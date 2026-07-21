import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { UserService } from "../../services/user.service";
import { Router } from "@angular/router";
import { add, addSuccess, edit, editImage, editImageSuccess, editPassword, editPasswordSuccess, editSuccess, findById, findByIdSuccess, findImage, findImageSuccess, remove, removeSuccess, setErrorImage, setErrors, setErrorsAny, setErrorsRemove } from "./user.action";
import { catchError, EMPTY, exhaustMap, finalize, from, map, mergeMap, of, tap } from "rxjs";
import { Store } from "@ngrx/store";
import { logout, removeAccount } from "../auth/auth.action";
import { loadingState } from "../loading/loading.action";
import { ModalService } from "src/app/services/modal.service";

@Injectable()
export class UserEffects {

    findUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(findById),
            exhaustMap(
                (action) => this.userService.findById(action.id).pipe(
                    mergeMap( (user) => [
                        findByIdSuccess({user}),
                        findImage({pathImage: user.image})
                    ]),
                    catchError(error => {
                        this.modalService.dismissLoading();
                        return EMPTY;
                    })   
                )
            )
        )
    )

    findUserByIdSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(findByIdSuccess),
            tap( () => {
                // this.store.dispatch(loadingState({loading: false}));
                this.modalService.dismissLoading();
            })
        ),
        {dispatch: false}
    )

    findImageUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(findImage),
            exhaustMap(
                (action) => this.userService.findImage(action.pathImage)
                .pipe(
                    map((imageBlob) => {
                        const imageUrl = URL.createObjectURL(imageBlob);
                        return findImageSuccess({ image: imageUrl });
                    }),
                    catchError(error => {
                        this.modalService.dismissLoading();
                        return EMPTY;
                    })
                )
            )
        )
    )

    addUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(add),
            exhaustMap(
                (action) => this.userService.create(action.user)
                .pipe(
                    map((user) => addSuccess({user})),
                    catchError(error => {
                        this.modalService.dismissLoading();
    
                        if (error.status === 400) {
                            return of(setErrors({userForm: action.user, errors: error.error}));
                        } else {
                            return of(error);
                        }
                    })
                )
            )
        )
    )

    addSuccessUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(addSuccess),
            tap( () => {
                this.router.navigate(['/login']);
                // this.store.dispatch(loadingState({loading: false}));
                this.modalService.dismissLoading();
                this.modalService.showModal('userCreated');
            })
        ),
        {dispatch: false}
    )

    editUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(edit),
            exhaustMap(
                (action) => this.userService.edit(action.userUpdate)
                .pipe(
                    map((userUpdate) => editSuccess({userUpdate})),
                    catchError(error => {
                        this.modalService.dismissLoading();
    
                        if (error.status === 400) {
                            return of(setErrors({userForm: action.userUpdate, errors: error.error}));
                        } else {
                            return of(error);
                        }
                    })
                )
            )
        )
    )

    editSuccessUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editSuccess),
            tap( async () => {
                this.modalService.dismissLoading();
                await this.modalService.showModal('edit');
                window.location.reload();

            })
        ),
        {dispatch: false}
    )

    editImageUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editImage),
            exhaustMap(
                (action) => this.userService.uploadProfileImage(action.formImage)
                .pipe(
                    map((response) => editImageSuccess({image: response.image})),
                    catchError(error => {
                        this.modalService.dismissLoading();
                        return of(setErrorImage)
                    })
                )
            )
        )
    )

    editImageSuccessUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editImageSuccess),
            tap( async (response) => {
                await this.modalService.showModal('edit');
                window.location.reload();
            })
        ),
        {dispatch: false}
    )

    editPassword$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editPassword),
            exhaustMap(
                (action) => this.userService.editPassword(action.request, action.id)
                .pipe(
                    map((userUpdate) => editPasswordSuccess({userUpdate})),
                    catchError(error => {
                        this.modalService.dismissLoading();
    
                        if (error.status === 400) {
                            return of(setErrorsAny({errors: error.error}))
                        } else {
                            return of(error);
                        }
                    }),
                    finalize( () => of(null) )
                )
            )
        )
    )

    editPasswordSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editPasswordSuccess),
            exhaustMap( () => 
                from(this.modalService.showModal('editPassword')).pipe(
                    tap( () => this.store.dispatch(logout()))
                )
            )
        ),
        {dispatch: false}
    )

    removeUser$ = createEffect(
        () => inject(Actions).pipe(
            ofType(remove),
            exhaustMap(
                (action) => this.userService.remove(action.request, action.id)
                .pipe(
                    map(() => removeSuccess()),
                    catchError(error => {
                        this.modalService.dismissLoading();
    
                        if (error.status === 400) {
                            return of(setErrorsRemove({errors: error.error}))
                        } else {
                            return of(error);
                        }
                    })
                )
            )
        )
    )

    removeUserSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeSuccess),
            tap( () => {
                this.modalService.dismissLoading();
                this.modalService.showModal('userRemoved');
                this.store.dispatch(removeAccount());
            })
        ),
        {dispatch: false}
    )

    setErrors$ = createEffect(
        () => inject(Actions).pipe(
            ofType(setErrors),
            tap( () => {
                this.modalService.dismissLoading();
                // this.store.dispatch(loadingState({loading : false}));
            })
        ),
        {dispatch: false}
    )

    setErrorImage$ = createEffect(
        () => inject(Actions).pipe(
            ofType(setErrorImage),
            tap( () => {
                this.modalService.dismissLoading();
                this.modalService.showModal('errorImage');
            })
        ),
        {dispatch: false}
    )

    setErrorsRemove$ = createEffect(
        () => inject(Actions).pipe(
            ofType(setErrorsRemove),
            tap( (action) => {
                this.modalService.dismissLoading();
                this.modalService.showModal('custom',
                    "An error ocurred",
                    action.errors.error,
                    "error"
                )
            })
        ),
        {dispatch: false}
    )

    setErrorsAny$ = createEffect(
        () => inject(Actions).pipe(
            ofType(setErrorsAny),
            tap( () => {
                this.modalService.dismissLoading();
            })
        ),
        {dispatch : false}
    )

    constructor(
        private userService : UserService,
        private modalService : ModalService,
        private store : Store<{auth: any}>,
        private router : Router
    ) { }
}