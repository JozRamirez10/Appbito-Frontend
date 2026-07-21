import { inject, Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { addHabitProgress, addHabitProgressSuccess, cleanHabitProgress, findByIdHabitAndRange, loadByIdHabit, loadByIdHabitRange, removeHabitProgress, removeHabitProgressSuccess, updateHabitProgress, updateHabitProgressSuccess } from "./habit.progress.action";
import { catchError, EMPTY, exhaustMap, forkJoin, map, mergeAll, mergeMap, tap, withLatestFrom } from "rxjs";
import { loadByUserId, loadByUserIdRange } from "../habit/habits.action";
import { HabitProgressService } from "../../services/habit-progress.service";
import { dayWihtoutTime } from "../../utils/helpers";
import { Store } from "@ngrx/store";
import { selectHabitProgressState } from "../../selectors/habit.selector";
import { ModalService } from "src/app/services/modal.service";
import { cleanUser } from "../user/user.action";

@Injectable()
export class HabitProgressEffects {
    
    findHabitProgressByHabitId$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loadByUserId),
            mergeMap( action => {
                if(!action.habits.length) return EMPTY;
                return forkJoin(
                    action.habits.map(habit => this.habitProgressService.findAllByIdHabit(habit.id))
                ).pipe(
                    map(habitsProgress => 
                        habitsProgress.map((progress, index) =>
                            loadByIdHabit({habitId: action.habits[index].id, habitProgress: progress})
                        )
                    ),
                    mergeAll(),
                    catchError(error => {
                        this.modalService.dismissLoading();
                        return EMPTY;
                    })
                )
            })
        )
    );

    findByIdHabitAndRange$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loadByUserIdRange, findByIdHabitAndRange),
            withLatestFrom(inject(Store).select(selectHabitProgressState)),
            mergeMap( ([action, habitProgrogresState]) => {
                if(!action.habits.length) return EMPTY;

                const requestedStartDate = dayWihtoutTime(new Date(action.startDate));
                const requestEndDate = dayWihtoutTime(new Date(action.endDate));

                const habitsToFetch = action.habits.filter(habit => {
                    const storedData = habitProgrogresState.progressByIdHabit[habit.id];
                    if(!storedData) return true;

                    const storedStartDate = dayWihtoutTime(new Date(storedData.startDate));
                    const storedEndDate = dayWihtoutTime(new Date(storedData.endDate));

                    return requestedStartDate < storedStartDate || requestEndDate > storedEndDate;
                })

                if(!habitsToFetch.length) return EMPTY;

                return forkJoin(
                    habitsToFetch.map(habit => 
                        this.habitProgressService.findByIdHabitAndDateRange(habit.id, action.startDate, action.endDate)
                    )
                ).pipe(
                    map(habitProgress => 
                        habitProgress.map((progress, index) =>
                            loadByIdHabitRange({
                                habitId: action.habits[index].id, 
                                habitProgress: progress, startDate: 
                                action.startDate, 
                                endDate: action.endDate})
                        )
                    ),
                    mergeAll(),
                    catchError(error => {
                        this.modalService.dismissLoading();
                        return EMPTY;
                    })
                );
            })
        )
    )

    addHabitProgress$ = createEffect(
        () => inject(Actions).pipe(
            ofType(addHabitProgress),
            mergeMap(
                (action) => this.habitProgressService.create(action.habitProgressNew)
                .pipe(
                    map(habitProgressNew => (addHabitProgressSuccess({habitId: habitProgressNew.habitId ,habitProgressNew}))),
                    catchError(error => {
                        this.modalService.dismissLoading();
                        return EMPTY;
                    })
                )
            )
        )
    )

    addHabitProgressSucess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(addHabitProgressSuccess),
            tap( () => {
                this.modalService.dismissLoading();
                this.modalService.showModal('edit');
            })
        ),
        {dispatch: false}
    )

    updateHabitProgress$ = createEffect(
        () => inject(Actions).pipe(
            ofType(updateHabitProgress),
            exhaustMap(
                action => this.habitProgressService.update(action.habitProgressUpdate)
                .pipe(
                    map(habitProgresUpdate => (updateHabitProgressSuccess({
                        habitId: habitProgresUpdate.habitId, 
                        habitProgressUpdate: habitProgresUpdate
                    }))),
                    catchError(error => {
                        this.modalService.dismissLoading();
                        return EMPTY;
                    })
                )
            )
        )
    )

    updateHabitProgressSuccess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(updateHabitProgressSuccess),
            tap( () => {
                this.modalService.dismissLoading();
                this.modalService.showModal('edit');
            })
        ),
        {dispatch: false}
    )

    removeHabitProgress$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeHabitProgress),
            mergeMap( ({habitId, habitProgressId}) => 
                this.habitProgressService.delete(habitProgressId).pipe(
                    map( () => removeHabitProgressSuccess({habitId, habitProgressId})),
                    catchError(error => {
                        this.modalService.dismissLoading();
                        return EMPTY;
                    })
                )
            )
        )
    )

    removeHabitProgressSucess$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeHabitProgressSuccess),
            tap( () => {
                this.modalService.dismissLoading();
                this.modalService.showModal('delete');
            })
        ),
        {dispatch: false}
    )

    cleanHabits$ = createEffect(
        () => inject(Actions).pipe(
            ofType(cleanUser),
            tap( () => {
                this.store.dispatch(cleanHabitProgress());
            })
        )
    )
    
    constructor(
        private habitProgressService : HabitProgressService,
        private modalService : ModalService,
        private store : Store
    ) {}
}