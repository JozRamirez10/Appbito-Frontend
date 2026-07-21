import { inject, Injectable } from "@angular/core";
import { HabitProgressService } from "../../services/habit-progress.service";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { addHabitProgressByMonth, cleanHabitProgressMonthly, loadHabitProgressByMonth, loadHabitProgressByMonthSuccess, removeHabitProgressByMonth, updateHabitProgressByMonth } from "./habit.progress.month.action";
import { catchError, EMPTY, map, mergeMap, tap, withLatestFrom } from "rxjs";
import { addHabitProgressSuccess, removeHabitProgressSuccess, updateHabitProgressSuccess } from "../habitProgress/habit.progress.action";
import { select, Store } from "@ngrx/store";
import { selectHabitProgressByMonth } from "../../selectors/habit.selector";
import { ModalService } from "src/app/services/modal.service";
import { cleanUser } from "../user/user.action";

@Injectable()
export class HabitProgressMonthlyEffects {
    
    loadHabitProgressByMonth$ = createEffect(
        () => inject(Actions).pipe(
            ofType(loadHabitProgressByMonth),
            withLatestFrom(inject(Store).select(selectHabitProgressByMonth)),
            mergeMap(([{years, habitIds}, progressByMonth]) => {
                const yearsToFetch = years.filter(year => !progressByMonth?.[year]);
                if(!yearsToFetch.length) return EMPTY;
                return this.habitProgressService.getTotalDoneByYears(yearsToFetch, habitIds)
                .pipe(
                    map(progress => loadHabitProgressByMonthSuccess({progress})),
                    catchError(error => {
                        this.modalService.dismissLoading();
                        return EMPTY;
                    })
                )
            })
        )
    )

    addHabitProgressByMonth$ = createEffect(
        () => inject(Actions).pipe(
            ofType(addHabitProgressSuccess),
            map(action => {
                const date = new Date(action.habitProgressNew.date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;

                return addHabitProgressByMonth({
                    year,
                    month,
                    habitId: action.habitId,
                    timesPerformed: action.habitProgressNew.timesPerformed
                });
            }),
            catchError(error => {
                this.modalService.dismissLoading();
                return EMPTY;
            })
        )
    )

    updateHabitProgressByMonth$ = createEffect(
        () => inject(Actions).pipe(
            ofType(updateHabitProgressSuccess),
            map(action => {
                const date = new Date(action.habitProgressUpdate.date);
                const year = date.getFullYear();
                const month = date.getMonth() + 1;

                return updateHabitProgressByMonth({
                    year,
                    month,
                    habitId: action.habitId,
                    timesPerformed: action.habitProgressUpdate.timesPerformed
                });
            }),
            catchError(error => {
                this.modalService.dismissLoading();
                return EMPTY;
            })
        )
    )

    removeHabitProgressByMonth$ = createEffect(
        () => inject(Actions).pipe(
            ofType(removeHabitProgressSuccess),
            withLatestFrom(inject(Store).pipe(select(state => state.habitProgress.lastRemovedProgress))),
            map(([action, lastRemovedProgress]) => {
                if(lastRemovedProgress){
                    const date = new Date(lastRemovedProgress.date);
                    const year = date.getFullYear();
                    const month = date.getMonth() + 1;
                    return removeHabitProgressByMonth({
                        year,
                        month,
                        habitId: action.habitId,
                        timesPerformed: lastRemovedProgress.timesPerformed
                    });
                }
                return { type: 'NO_ACTION'}
            }),
            catchError(error => {
                this.modalService.dismissLoading();
                return EMPTY;
            })
        )
    )

    cleanHabits$ = createEffect(
        () => inject(Actions).pipe(
            ofType(cleanUser),
            tap( () => {
                this.store.dispatch(cleanHabitProgressMonthly());
            })
        )
    )

    constructor(
        private habitProgressService : HabitProgressService,
        private modalService : ModalService,
        private store : Store
    ) {}
}