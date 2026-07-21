import { inject, Injectable, NgZone } from "@angular/core";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { catchError, exhaustMap, finalize, map, of, tap } from "rxjs";
import { login, loginError, loginSuccess, logout, logoutError, logoutSuccess, removeAccount, removeSuccessAccount } from "./auth.action";
import { Store } from "@ngrx/store";
import { cleanUser } from "../user/user.action";
import { ModalService } from "src/app/services/modal.service";

@Injectable()
export class AuthEffects {

    login$ = createEffect(
        () => inject(Actions).pipe(
            ofType(login),
            exhaustMap(
                (action) => this.service.loginUser(action).pipe(
                    map( () => {
                        const payload = this.service.getPayload();
                        const id = payload ? Number(payload.sub) : 0;

                        return loginSuccess({
                            login:{
                                id, 
                                token: this.service.getToken()
                            }
                        })
                    }),
                    catchError( error => {
                        this.modalService.dismissLoading();
                        return of(loginError({error: error.error.message}))
                    })
                )
            )
        )
    );

    loginSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loginSuccess),
            tap( () => {
                this.modalService.dismissLoading();
                this.zone.run( () => {
                    this.router.navigate(['/dailyHabits']);
                });
            })
        ),  
        {dispatch: false}
    )

    loginError$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loginError),
            tap( (action) =>{
                this.modalService.dismissLoading();
                this.modalService.showModal('custom', "Error in the login", action.error , 'error');
            })
        ),
        {dispatch: false}
    )

    logout$ = createEffect(
        () => inject(Actions).pipe(
            ofType(logout),
            exhaustMap(
                () => this.service.logout()
            )
        ).pipe(
            map( () => logoutSuccess()),
            catchError( error => {
                this.modalService.dismissLoading();
                return of(logoutError())
            }),
        )
    )

    logoutSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(logoutSuccess),
            exhaustMap( async () => {
                await this.service.removeSession();
                this.store.dispatch(cleanUser());
                
                this.zone.run( () => {
                    this.router.navigate(['/login']);
                });

                this.modalService.showModal('exit');
            })
        ),
        {dispatch : false}
    )

    logoutError$ = createEffect(
        () => inject(Actions).pipe(
            ofType(logoutError),
            tap( () => {
                this.service.removeSession();
                this.store.dispatch(cleanUser());

                this.zone.run( () => {
                    this.router.navigate(['/login']);
                });

            })
        ),
        {dispatch : false}
    )

    remove$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeAccount),
            exhaustMap(
                () => this.service.logout()
            )
        ).pipe(
            map( () => removeSuccessAccount()),
            catchError( error => {
                this.modalService.dismissLoading();
                return of(loginError({error: error.error.message}))
            }),
        )
    )

    removeSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeSuccessAccount),
            tap( () => {
                this.service.removeSession();
                this.store.dispatch(cleanUser());

                this.zone.run( () => {
                    this.router.navigate(['/login']);
                });

            })
        ),
        {dispatch : false}
    )

    constructor(
        private service : AuthService,
        private modalService : ModalService,
        private router : Router,
        private store : Store<{users : any}>,
        private zone : NgZone
    ) { }
}