import { HttpClient, HttpErrorResponse, HttpResponse } from "@angular/common/http";
import { inject, Injectable, NgZone } from "@angular/core";
import { Router } from "@angular/router";
import { Preferences } from "@capacitor/preferences";
import { BehaviorSubject, finalize, firstValueFrom, Observable, switchMap } from "rxjs";
import { environment } from "../../environments/environment";
import { AUTH, GENERAL, HTTP_HEADERS, PATHS } from "../constants/constants";
import { ModalActions } from "../enums/modal.actions.enum";
import { LoginRequest } from "../models/dtos/auth.model";
import { JwtTokenService } from "./jwt.token.service";
import { ModalService } from "./modal.service";

@Injectable({
    providedIn: 'root'
})
export class AuthService {

    private readonly http = inject(HttpClient);
    private readonly jwtService = inject(JwtTokenService);
    private readonly modalService = inject(ModalService);
    private readonly ngZone = inject(NgZone)
    private readonly router = inject(Router);

    private readonly url = environment.apiUrl;
    private readonly apiUrl= `${this.url}${PATHS.AUTH}`;
    private readonly tokenReady$ = new BehaviorSubject<boolean>(false);

    async verifyAccount(token : string) : Promise<boolean> {
        try{
            await firstValueFrom(this.http.get(`${this.apiUrl}${PATHS.VERIFY}`, {
                params: {token}
            }));
            return true;
        }catch{
            return false;
        }
    }

    loginUser(credentials : LoginRequest) : Observable<HttpResponse<any>> {
        return this.http.post<any>(`${this.url}${PATHS.LOGIN}`, credentials, {
            observe: GENERAL.RESPONSE,
            withCredentials: true
        }).pipe(
            switchMap(async (response) => {
                const token = response.headers.get(HTTP_HEADERS.AUTHORIZATION);
                if(token) {
                    await this.setToken(token);
                }
                return response;
            })
        );
    }

    async refreshToken() : Promise<string | null> {
        try{
            const response = await firstValueFrom(
                this.http.post<any>(`${this.apiUrl}${PATHS.REFRESH}`, {}, {
                    observe: GENERAL.RESPONSE,
                    withCredentials: true
                })
            );

            const token = response.headers.get(HTTP_HEADERS.AUTHORIZATION);
            if (token) {
                await this.setToken(token);
                return this.jwtService.getToken();
            }
            return null;
        } catch {
            return null;
        }
    }

    cleanToken(token : string) : string {
        return token.replace(AUTH.BEARER, GENERAL.EMPTY_STRING).trim();
    }

    logout() : void {
        this.modalService.showModal(ModalActions.LOADING);

        this.http.post<any>(`${this.apiUrl}${PATHS.LOGOUT}`, {}, {
            withCredentials: true
        }).pipe(
            finalize(() => this.modalService.dismissLoading())
        ).subscribe({
            next: async () => {
                await this.removeSession();
                this.ngZone.run(() => {
                    this.router.navigateByUrl(PATHS.LOGIN, {replaceUrl: true});
                });
            },
            error: (err : HttpErrorResponse) => {
                this.forceLogout(err);
            }
        });
    }

    async forceLogout(error ? : HttpErrorResponse) {

        await this.removeSession();
        this.modalService.dismissLoading();

        const message = error?.error?.error || GENERAL.EMPTY_STRING;
        const modal_action = message.includes(AUTH.TOKEN_EXPIRED)
            ? ModalActions.EXPIRED
            : ModalActions.ERROR_SESSION;

        this.ngZone.run(() => {
            this.router.navigateByUrl(PATHS.LOGIN, {replaceUrl: true}).then(() => {
                this.modalService.showModal(modal_action);
            });
        });
    }

    async setToken(token : string) {
        const cleanToken = this.cleanToken(token);
        await Preferences.set({key:AUTH.TOKEN, value: cleanToken});
        this.jwtService.setToken(cleanToken);
        this.tokenReady$.next(true);
    }

    async getToken() : Promise<string | null> {

        let token = this.jwtService.getToken();

        if(!token){
            const storedToken = await Preferences.get({key: AUTH.TOKEN});
            token = storedToken.value ?? null;
            if(token){
                this.jwtService.setToken(token);
            }
        }

        this.tokenReady$.next(!!token);
        return token;
    }

    isTokenReady$() : Observable<boolean> {
        return this.tokenReady$.asObservable();
    }

    getPayload(){
        return this.jwtService.getDecodeToken();
    }

    isExpired() : boolean {
        return this.jwtService.isTokenExpired();
    }

    async removeSession() : Promise<void> {
        await Preferences.remove({key: AUTH.TOKEN});
        this.jwtService.setToken(null);
        this.tokenReady$.next(false);
    }
}