import { HttpInterceptorFn, HttpRequest } from "@angular/common/http";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { catchError, from, mergeMap, tap, throwError } from "rxjs";
// import { showModal } from "../utils/helpers";
import { Store } from "@ngrx/store";
import { logoutError } from "../store/auth/auth.action";
import { ModalService } from "../services/modal.service";

export const tokenInterceptor : HttpInterceptorFn = (req, next) => {
    const authService = inject(AuthService);
    const modalService = inject(ModalService);
    const store = inject(Store)
    // const token = authService.getToken() || sessionStorage.getItem("token");
    const isRefreshRequest = req.url.includes("/auth/refresh");

    return from(authService.getToken()).pipe(
        mergeMap(token => {
            if(!token || isRefreshRequest){
                return next(req);
            }

            // if(authService.isExpired()){
            //     return from(authService.refreshToken()).pipe(
            //         mergeMap(newToken => {
            //             if(!newToken){
            //                 store.dispatch(logoutError());
            //                 modalError('JWT expired', modalService);
            //                 return throwError(() => new Error("No token after refresh"));
            //             }
            //             authService.setToken(newToken);
            //             return next(reqClone(req, newToken));
            //         }),
            //         catchError( error => {
            //             store.dispatch(logoutError());
            //             modalError(error.error?.error ?? 'Session error', modalService);
            //             return throwError(() => error);
            //         })
            //     )
            // }

            req = reqClone(req, token);
            // req = req.clone({
            //     url : req.url,
            //     setHeaders: {
            //         Authorization: `Bearer ${token}`
            //     }
            // });

            return next(req).pipe(
                catchError(error => {
                    if(error.status !== 401) 
                        return throwError( () => error);
                    
                    if(error.status === 500){
                        return throwError( () => error.log(error))
                    }
            
                    return from(authService.refreshToken()).pipe(
                        mergeMap(newToken => {
                            if(!newToken) {
                                store.dispatch(logoutError());
                                modalError(error.error.error, modalService);
                                return throwError( () => error);
                            }
            
                            authService.setToken(newToken);
                            return next(reqClone(req, newToken));
            
                        }),
                        catchError( (error) => {
                            store.dispatch(logoutError());
                            modalError(error.error.error, modalService);
                            return throwError( () => error);
                        })
                    )
                })
            )
        })
    )
}

export function reqClone(req : HttpRequest<any>, token : string) : HttpRequest<any> {
    return req.clone({
        setHeaders: {Authorization: `Bearer ${token}`}
    });
}

export function modalError(message : string, modalService : ModalService ){
    if(message.includes("JWT expired")){
        modalService.showModal('expired');
    }else{
        modalService.showModal('errorSession');
    }
}