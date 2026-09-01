import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, forkJoin, map, of, retry, switchMap, tap } from 'rxjs';
import { APP } from '../constants/constants';
import { ModalActions } from '../enums/modal.actions.enum';
import { MonthStatus } from '../enums/month.status.enum';
import { CreateHabitRequest, Habit, UpdateHabitRequest } from '../models/dtos/habit.model';
import { CreateHabitProgressRequest, HabitProgress, HabitProgressMonthly, UpdateHabitProgressRequest } from '../models/dtos/habit.progress.model';
import { MonthRecord, MonthStatusRecord } from '../models/internal/month.status.record';
import { HabitView } from '../models/views/habit.view';
import { HabitProgressService } from '../services/habit.progress.service';
import { HabitService } from '../services/habit.service';
import { ModalService } from '../services/modal.service';
import { catchAndNotify, decodeDateString, getMonthlyProgressKey, getMonthsFromRange, notifyError } from '../utils/helpers';

@Injectable({
    providedIn: 'root'
})
export class HabitState {

    private readonly habitService = inject(HabitService);
    private readonly habitProgressService = inject(HabitProgressService);
    private readonly modalService = inject(ModalService);

    public readonly habits = signal<HabitView[]>([]);
    public readonly isLoading = signal<boolean>(false);

    public readonly monthStatusRecord = signal<MonthStatusRecord[]>([]);
    public readonly habitProgressMonthly = signal<HabitProgressMonthly[]>([]);
    public readonly isMonthlyLoading = signal<boolean>(false);

    loadHabitsWithProgress(startDate : string, endDate : string) {

        this.isLoading.set(true);
        const period = getMonthsFromRange(startDate, endDate);

        this.habitService.getMyHabits().pipe(
            switchMap((habits : Habit[]) => {

                if (!habits || habits.length === 0) {
                    return of([]);
                }

                const progressRequests = habits.map(habit => {
                    return this.habitProgressService.getProgressByDateRange(
                        habit.id, startDate, endDate).pipe(

                        map((progressData : HabitProgress[]) => ({
                            ...habit,
                            progress: progressData,
                            hasProgressError: false
                        } as HabitView)),
                        catchError(() => of({
                            ...habit,
                            progress: [],
                            hasProgressError: true
                        } as HabitView))
                    );
                });
                return forkJoin(progressRequests);
            }),
            finalize(() => this.isLoading.set(false))
        ).subscribe({
            next: (habitsWithProgress : HabitView[]) => {
                this.habits.set(habitsWithProgress);

                const newRecords : MonthStatusRecord[] = [];
                habitsWithProgress.forEach(h => {
                    const status = h.hasProgressError ? MonthStatus.ERROR : MonthStatus.SUCCESS;
                    period.forEach(p =>
                        newRecords.push({ habitId: h.id, year: p.year, month: p.month, status}));
                });

                this.updateMonthStatus(newRecords);
            },
            error: (err : HttpErrorResponse) => {
                notifyError(err, ModalActions.ERROR_HABITS_LOADING, this.modalService);
            }
        });
    }

    loadHabitStreak(habitId : number) {

        const currentHabit = this.habits().find(h => h.id === habitId);

        if (!currentHabit || currentHabit.streak !== undefined) {
            return;
        }

        this.habitProgressService.getHabitStreak(habitId).subscribe({
            next: (streakValue) => {
                this.updateHabit(habitId, { streak: streakValue });
            },
            error: () => {
                this.updateHabit(habitId, { streak: null});
            }
        })
    }

    saveHabit(payload : Partial<HabitView>) {

        const { id, progress, name = '' , days = [], ...request } = payload;

        const request$ = id
            ? this.habitService.updateHabit(id, { name, days, ...request } as UpdateHabitRequest)
                .pipe(
                    tap((updateHabit) => this.updateHabit(updateHabit.id, updateHabit))
                )
            : this.habitService.createHabit({ name, days, ...request } as CreateHabitRequest)
                .pipe(
                    tap((newHabit) => {
                        const newHabitView : HabitView = { ...newHabit, progress: [],
                            hasProgressError: false };
                        this.habits.update(current => [newHabitView, ...current]);
                    })
                );

        return request$.pipe(
            catchAndNotify(ModalActions.ERROR_SAVE, this.modalService, true)
        );
    }

    deleteHabit(id : number) {

        this.isLoading.set(true);
        this.modalService.showModal(ModalActions.LOADING);

        this.habitService.deleteHabit(id).pipe(
            finalize(() => {
                this.isLoading.set(false)
                this.modalService.dismissLoading();
            })
        ).subscribe({
            next: () => {
                this.habits.update(currentHabits => currentHabits.filter(h => h.id !== id));
                this.monthStatusRecord.update(records => records.filter(r => r.habitId !== id));
                this.modalService.showModal(ModalActions.DELETE);
            },
            error: (err : HttpErrorResponse) => {
                notifyError(err, ModalActions.ERROR_DELETE, this.modalService);
            }
        });
    }

    loadProgress(habitId : number, startDate: string, endDate: string) {

        const period = getMonthsFromRange(startDate, endDate);

        const allCached = period.every(m => {
            const status = this.getMonthStatus({habitId, year: m.year, month: m.month});
            return status === MonthStatus.SUCCESS || status === MonthStatus.LOADING;
        });

        if (allCached) return;

        this.setMonthStatus(habitId, period, MonthStatus.LOADING);

        this.habitProgressService.getProgressByDateRange(habitId, startDate, endDate).pipe(
            retry(APP.RETRY)
        ).subscribe({
            next: (newData) => {

                this.setMonthStatus(habitId, period, MonthStatus.SUCCESS);

                if (newData.length === 0) return;

                this.mutateHabitProgress(habitId, (currentProgress) => {
                    const newIds = new Set(newData.map(p => p.id));
                    return [...currentProgress.filter(p => !newIds.has(p.id)), ...newData]
                });
            },
            error: () => {
                this.setMonthStatus(habitId, period, MonthStatus.ERROR); // TODO: Sirve para indicar carga manual del método
            }
        });
    }

    saveHabitProgress(habitId : number, progressId : number | undefined,
        payload : CreateHabitProgressRequest | UpdateHabitProgressRequest ) {

        const oldRecord = progressId ? this.getProgressRecord(habitId, progressId) : undefined;
        const oldTimes = oldRecord ? oldRecord.timesPerformed : 0;

        const request$ = progressId
            ? this.habitProgressService.updateProgress(progressId,
                payload as UpdateHabitProgressRequest).pipe(
                    tap((updateRecord) => {
                        this.mutateHabitProgress(habitId, (progress) =>
                            progress.map(p => p.id === updateRecord.id ? updateRecord : p)
                        )
                        this.updateMonthlyProgress(habitId, updateRecord.date,
                            updateRecord.timesPerformed - oldTimes);
                    })
                )
            : this.habitProgressService.createProgress(payload as CreateHabitProgressRequest).pipe(
                tap((newRecord) => {
                    this.mutateHabitProgress(habitId, (progress) => [...progress, newRecord]);
                    this.updateMonthlyProgress(habitId, newRecord.date, newRecord.timesPerformed);
                })
            );

        return request$.pipe(
            catchAndNotify(ModalActions.ERROR_SAVE, this.modalService, true)
        );
    }

    deleteHabitProgress(habitId : number, progressId : number) {

        const oldRecord = this.getProgressRecord(habitId, progressId);

        return this.habitProgressService.deleteProgress(progressId).pipe(
            tap(() => {
                this.mutateHabitProgress(habitId, (progress) =>
                    progress.filter(p => p.id !== progressId)
                )
                if (oldRecord) {
                    this.updateMonthlyProgress(habitId, oldRecord.date, -oldRecord.timesPerformed);
                }
            }),
            catchAndNotify(ModalActions.ERROR_DELETE, this.modalService)
        );
    }

    loadHabitProgressMonthly(years : number[], habitIds : number[]) {

        if (years.length === 0 || habitIds.length === 0) return;

        this.isMonthlyLoading.set(true);

        this.habitProgressService.getMonthlyProgress(years, habitIds).pipe(
            finalize(() => this.isMonthlyLoading.set(false))
        )
        .subscribe({
            next: (newData : HabitProgressMonthly[]) => {
                this.habitProgressMonthly.update(current => {
                    const newKeys = new Set(newData.map(d =>
                        getMonthlyProgressKey(d.year, d.month, d.habitId)
                    ));

                    const filtered = current.filter(d =>
                        !newKeys.has(getMonthlyProgressKey(d.year, d.month, d.habitId))
                    );

                    return [...filtered, ...newData];
                });
            },
            error: () => {} // TODO: Agregar botón para carga manual
        });
    }

    private updateHabit(habitId : number, changes : Partial<HabitView>) {
        this.habits.update(habits =>
            habits.map(h => (h.id === habitId ? { ...h, ...changes} : h))
        );
    }

    private isSameMonthRecord(a : MonthRecord, b : MonthRecord) : boolean {
        return a.habitId === b.habitId && a.year === b.year && a.month === b.month;
    }

    public getMonthStatus(monthRecord : MonthRecord) : MonthStatus | undefined {
        return this.monthStatusRecord().find(s => this.isSameMonthRecord(s, monthRecord))?.status;
    }

    private setMonthStatus(habitId : number, period : { year : number, month : number}[],
        status : MonthStatus) {

        this.updateMonthStatus(
            period.map(p => ({ habitId, year: p.year, month: p.month, status }))
        );
    }

    private updateMonthStatus(newRecords : MonthStatusRecord[]) {
        this.monthStatusRecord.update(current => {
            const filtered = current.filter(old =>
                !newRecords.some(n => this.isSameMonthRecord(n, old))
            );
            return [...filtered, ...newRecords];
        });
    }

    private mutateHabitProgress(habitId : number,
        mutator: (currentProgress : HabitProgress[]) => HabitProgress[]) {

        this.habits.update(habits =>
            habits.map(h => (h.id === habitId ? { ...h, progress: mutator(h.progress) } : h))
        )
    }

    private getProgressRecord(habitId : number, progressId : number) : HabitProgress | undefined {
        return this.habits()
            .find(h => h.id === habitId)?.progress
            .find(p => p.id === progressId);
    }

    private updateMonthlyProgress(habitId : number, dateStr : string, difference : number) {

        if (difference === 0) return;

        const dateDecoded = decodeDateString(dateStr);

        const recordToMatch: MonthRecord = {
            habitId,
            year: dateDecoded.year,
            month: dateDecoded.month + 1
        }

        this.habitProgressMonthly.update(current => {

            const index = current.findIndex(stat => this.isSameMonthRecord(stat, recordToMatch));

            if (index >= 0) {
                const updated = [...current];
                updated[index] = {
                    ...updated[index],
                    totalTimesPerformed: Math.max(
                        0, updated[index].totalTimesPerformed + difference
                    )
                };
                return updated;
            } else if (difference > 0) {
                return [...current, { ...recordToMatch, totalTimesPerformed: difference } as
                    HabitProgressMonthly]
            }
            return current;
        })
    }
}