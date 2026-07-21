import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import { BehaviorSubject, catchError, Observable, tap, throwError } from "rxjs";
import { JwtTokenService } from "./jwt.token.service";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import { Preferences } from "@capacitor/preferences";
import { Http } from "@capacitor-community/http";

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    
    private url: string = environment.apiUrl;

    private tokenReady$ = new BehaviorSubject<boolean>(false);

    constructor(
        private http : HttpClient,
        private store : Store<{auth : any}>,
        private jwtService : JwtTokenService,
        private router : Router,
    ) { }

    async verifyAccount(token : string) : Promise<boolean> {
        // return this.http.get(`${this.url}/auth/verify?token=${token}`).toPromise()
        try{
            await Http.get({
                url: `${this.url}/auth/verify?token=${token}` ,
                headers: { 'Content-Type': 'application/json' }
            })
            return true;
        }catch{
            return false;
        }
        
    }

    loginUser({email, password} : any) : Observable<any> {
        return this.http.post<any>(`${this.url}/login`, {email, password}, {
            observe: 'response',
            withCredentials: true
        }).pipe(
            tap(response => {
                const token = response.headers.get('Authorization');
                if(!token){
                    return;
                }
                this.setToken(token);
            }),
            catchError(error => {
                return throwError( () => error);
            })
        );
    }

    refreshToken() : Promise<string | null> {
        return new Promise( (resolve) => {
            this.http.post<any>(`${this.url}/auth/refresh`, {}, {
                observe: 'response',
                withCredentials: true
            }).subscribe({
                next: response => {
                    const token = response.headers.get("Authorization");
                    if(!token){
                        resolve(null)
                        return;
                    }
                    this.setToken(token);
                    resolve(token);
                },
                error: () => {
                    resolve(null);
                }
            })
        });     
    }

    logout() : Observable<any>{
        return this.http.post<any>(`${this.url}/auth/logout`, {}, {withCredentials: true});
    }
    
    async setToken(token : string){
        // console.log('[setToken] Guardando token:', token);
        await Preferences.set({key:'token', value: token});
        this.jwtService.setToken(token);
    }

    async getToken() : Promise<string | null > {
        let token = this.jwtService.getToken();
        if(!token){
            const storedToken = await Preferences.get({key:'token'});
            token = storedToken.value ?? null;
            if(token){
                this.jwtService.setToken(token);
            }
        }
        // const tokenWithoutBearer = token?.replace('Bearer ', '');
        // return tokenWithoutBearer;
        this.tokenReady$.next(true);
        return token?.replace('Bearer ', '') ?? null;
    }

    isTokenReady$() {
        return this.tokenReady$.asObservable();
    }

    getPayload(){
        return this.jwtService.getDecodeToken();
    }

    isExpired() : boolean {
        return this.jwtService.isTokenExpired();
    }

    async removeSession() : Promise<void> {
        // sessionStorage.removeItem('token');
        await Preferences.remove({key: 'token'});
        this.jwtService.setToken(null);
        this.tokenReady$.next(false);
    }
}