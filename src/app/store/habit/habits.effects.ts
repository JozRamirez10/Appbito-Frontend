import { Actions, createEffect, ofType } from "@ngrx/effects";
import { inject, Injectable } from "@angular/core";
import { add, addSuccess, cleanHabits, edit, editBatch, editBatchSuccess, editSucess, findByUserId, findByUserIdRange, loadByUserId, loadByUserIdRange, remove, removeSucess, setErrors } from "./habits.action";
import { catchError, EMPTY, exhaustMap, map, mergeMap, of, tap } from "rxjs";
import { HabitService } from "../../services/habit.service";
import { Router } from "@angular/router";
import { Store } from "@ngrx/store";
import { loadingState } from "../loading/loading.action";
import { ModalService } from "src/app/services/modal.service";
import { cleanUser } from "../user/user.action";

@Injectable()
export class HabitsEffects {
    
    findHabitsByUserId$ = createEffect(
        () => inject(Actions).pipe(
            ofType(findByUserId),
            exhaustMap( 
                (action) => this.habitService.findByUserId(action.id).pipe(
                    map(habits => (loadByUserId({habits}))),
                    catchError( error => {
                        this.modalService.dismissLoading();
                        return EMPTY;
                    })
                )
            )
        )
    );
    
    loadHabitsByUserId$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loadByUserId),
            tap( () => {
                // this.store.dispatch(loadingState({loading: false}));
                this.modalService.dismissLoading();
            })
        ),
        {dispatch : false}
    );

    findHabitsByUserIdRange$ = createEffect(
        () => inject(Actions).pipe(
            ofType(findByUserIdRange),
            exhaustMap( 
                (action) => this.habitService.findByUserId(action.id).pipe(
                    map(habits => (loadByUserIdRange({
                        habits,
                        startDate: action.startDate,
                        endDate: action.endDate
                    }))),
                    catchError( error => {
                        this.modalService.dismissLoading();
                        return EMPTY;
                    })
                )
            )
        )
    );

    loadHabitsByUserIdRange$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loadByUserIdRange),
            tap( () => {
                // this.store.dispatch(loadingState({loading: false}));
                this.modalService.dismissLoading();
            })
        ),
        {dispatch : false}
    );

    addHabit$ = createEffect(
      () => inject(Actions).pipe(
        ofType(add),
        exhaustMap(
            (action) => this.habitService.create(action.habitNew)
            .pipe(
                map((habitNew) => addSuccess({habitNew})),
                catchError(error => {
                    this.modalService.dismissLoading();

                    if (error.status === 400) {
                        return of(setErrors({ habitForm: action.habitNew, errors: error.error }));
                    } else {
                        return of(error);
                    }
                })
            )
        )
      )  
    );

    addSuccessHabit$ = createEffect(
        () => inject(Actions).pipe(
            ofType(addSuccess),
            tap( () => {
                this.router.navigate(['/listHabits']);
                this.modalService.dismissLoading();
                this.modalService.showModal('create');
            })
        ),
        {dispatch : false}
    );

    updateHabit$ = createEffect(
        () => inject(Actions).pipe(
            ofType(edit),
            exhaustMap(
                action => this.habitService.update(action.habitUpdate)
                .pipe(
                    map((habitUpdate) => editSucess({habitUpdate})),
                    catchError(error => {
                        this.modalService.dismissLoading(); // efecto secundario

                        if (error.status === 400) {
                            return of(setErrors({habitForm: action.habitUpdate, errors: error.error}));
                        } else {
                            return of(error);
                        }
                    })
                )
            )
        )
    );

    updateSuccessHabit$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editSucess),
            tap( () => {
                this.router.navigate(['/listHabits']);
                this.modalService.dismissLoading();
                this.modalService.showModal('edit');
            })
        ),
        {dispatch: false}
    );

    updateHabitsBatch$ = createEffect(
        () => inject(Actions).pipe(
            ofType(editBatch),
            mergeMap(
                ({habitsUpdate}) => this.habitService.updateBatch(habitsUpdate)
                .pipe(
                    map( (habitsUpdate) => editBatchSuccess({habitsUpdate})),
                    catchError( error => {
                        this.modalService.dismissLoading();
                        return EMPTY;
                    })
                )
            )
        )
    );

    removeHabit$ = createEffect(
        () => inject(Actions).pipe(
            ofType(remove),
            exhaustMap(
                action => this.habitService.delete(action.id)
                .pipe(
                    map((id) => removeSucess({id})),
                    catchError( error => {
                        this.modalService.dismissLoading();
                        return EMPTY;
                    })
                )
            )
        )
    );

    removeSucessHabit$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeSucess),
            tap( () => {
                this.modalService.dismissLoading();
                this.modalService.showModal('delete');
            })
        ),
        {dispatch: false}
    );

    setErrors$ = createEffect(
        () => inject(Actions).pipe(
            ofType(setErrors),
            tap( () => {
                // this.store.dispatch(loadingState({loading: false}));
                this.modalService.dismissLoading();
            })
        ),
        {dispatch : false}
    );

    cleanHabits$ = createEffect(
        () => inject(Actions).pipe(
            ofType(cleanUser),
            tap( () => {
                this.store.dispatch(cleanHabits());
            })
        )
    )

    constructor(
        private habitService : HabitService,
        private modalService : ModalService,
        private router : Router,
        private store : Store
    ) { }
}