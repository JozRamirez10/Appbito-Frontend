import { HttpErrorResponse, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpStatusCode } from "@angular/common/http";
import { inject } from "@angular/core";
import { BehaviorSubject, catchError, filter, from, switchMap, take, throwError } from "rxjs";

import { AuthService } from "../services/auth.service";

import { AUTH, HTTP_HEADERS, PATHS } from '../constants/constants';

let isRefreshing = false;
let refreshTokenSubject = new BehaviorSubject<string | null>(null);

export const tokenInterceptor : HttpInterceptorFn = (req, next) => {

    const authService = inject(AuthService);
    const isRefreshRequest = req.url.includes(AUTH.REFRESH_TOKEN_PATH);
    const isLoginRequest = req.url.includes(PATHS.LOGIN);

    return from(authService.getToken()).pipe(
        switchMap(token => {

            const request = (token && !isRefreshRequest && !isLoginRequest)
                ? addTokenHeader(req, token)
                : req;

            return next(request).pipe(
                catchError((error : HttpErrorResponse) => {
                    if (error.status === HttpStatusCode.Unauthorized && !isRefreshRequest
                        && !isLoginRequest) {
                        return handleUnauthorized(error, req, next, authService);
                    }
                    return throwError(() => error);
                })
            )
        })
    )
}

function handleUnauthorized(error : HttpErrorResponse, req : HttpRequest<unknown>,
    next : HttpHandlerFn, authService : AuthService) {

    if (!isRefreshing) {

        isRefreshing = true;
        refreshTokenSubject.next(null)

        return from(authService.refreshToken()).pipe(
            switchMap(newToken => {

                isRefreshing = false;
                if(!newToken) return throwError(() => error);

                refreshTokenSubject.next(newToken);
                return next(addTokenHeader(req, newToken));
            }),
            catchError((finalError : HttpErrorResponse) => {
                if (finalError.status === HttpStatusCode.Unauthorized) {
                    authService.forceLogout(finalError);
                }
                return throwError(() => error);
            })
        );
    } else {
        return refreshTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap(token => {
                return next(addTokenHeader(req, token!));
            })
        );
    }
}

function addTokenHeader(req : HttpRequest<unknown>, token : string) : HttpRequest<unknown> {
    return req.clone({
        setHeaders : {
            [HTTP_HEADERS.AUTHORIZATION]: `${AUTH.BEARER_PREFIX}${token}`
        }
    });
}