import { Component, computed, effect, inject, signal, untracked } from '@angular/core';

import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IonBadge, IonButton, IonCard, IonCardContent, IonCardHeader, IonCheckbox, IonCol, IonContent, IonGrid, IonIcon, IonItem, IonLabel, IonList, IonModal, IonRefresher, IonRefresherContent, IonRow, IonSpinner } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { addSharp, ellipsisHorizontalSharp, listSharp, newspaperSharp, personSharp, readerOutline } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { HabitViewRefresh } from 'src/app/classes/habit.view.refresh';
import { GENERAL } from 'src/app/constants/constants';
import { DaysOfWeek } from 'src/app/enums/days.enum';
import { ModalActions } from 'src/app/enums/modal.actions.enum';
import { CreateHabitProgressRequest, UpdateHabitProgressRequest } from 'src/app/models/dtos/habit.progress.model';
import { HabitView } from 'src/app/models/views/habit.view';
import { ModalService } from 'src/app/services/modal.service';
import { getDayOfWeek, getTwoMonthlyRangesForDate, todayToString } from '../../utils/helpers';
import { CalendarWeekProgressComponent } from '../calendar.week.progress/calendar.week.progress.component';
import { ChartMonthProgressComponent } from '../chart.month.progress/chart.month.progress.component';
import { DetailHabitProgressComponent } from '../detail.habit.progress/detail.habit.progress.component';

@Component({
  selector: 'app-daily.habits',
  standalone: true,
  imports: [
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonBadge,
    IonLabel,
    IonCheckbox,
    IonItem,
    IonList,
    IonSpinner,
    IonGrid,
    IonCardContent,
    IonIcon,
    IonCol,
    IonRow,
    IonCardHeader,
    IonCard,
    IonContent,
    IonModal,
    RouterLink,
    DatePipe,
    CommonModule,
    DetailHabitProgressComponent,
    CalendarWeekProgressComponent,
    ChartMonthProgressComponent
],
  templateUrl: './daily.habits.component.html',
  styleUrls: ['./daily.habits.component.scss'],
})
export class DailyHabitsComponent extends HabitViewRefresh {

  private readonly modalService = inject(ModalService);

  todayDate = signal<Date>(new Date());
  todayStr = signal<string>(todayToString());
  todayNameOfWeek = signal<DaysOfWeek>(getDayOfWeek() as DaysOfWeek);

  habits = computed(() => this.habitState.habits());

  dailyHabits = computed(() => {
    return this.habitState.habits().filter(habit =>
      habit.days.includes(this.todayNameOfWeek())
    );
  });

  isOpen = signal<boolean>(false);
  selectedHabit = signal<HabitView | null>(null);
  selectedDate = signal<Date>(new Date());

  constructor() {
    super();
    addIcons({ personSharp, listSharp, addSharp, readerOutline, newspaperSharp,
      ellipsisHorizontalSharp });

    effect(() => {
      const currentDailyHabits = this.dailyHabits();
      untracked(() => {
        currentDailyHabits.forEach(habit => {
          if(habit.streak === undefined) {
            this.habitState.loadHabitStreak(habit.id);
          }
        });
      });
    });
  }

  override loadData() : void {
    this.todayDate.set(new Date());
    this.todayStr.set(todayToString());
    this.todayNameOfWeek.set(getDayOfWeek() as DaysOfWeek);

    const ranges = getTwoMonthlyRangesForDate(this.todayDate());
    this.habitState.loadHabitsWithProgress(ranges.start, ranges.end);
  }

  getTodayProgress(habit : HabitView) {
    return habit.progress.find(p => p.date === this.todayStr());
  }

  isChecked(habit : HabitView) : boolean {
    const progress = this.getTodayProgress(habit);
    return !!progress && progress.timesPerformed > 0;
  }

  hasNote(habit : HabitView) : boolean {
    const progress = this.getTodayProgress(habit);
    return !!progress && !!progress.note && progress.note.trim().length > 0;
  }

  openDetailModal(habit : HabitView, date : Date = this.todayDate()) {
    this.selectedHabit.set(habit);
    this.selectedDate.set(date);
    this.isOpen.set(true);
  }

  onDailyHabitDone(event : any, habit : HabitView) : void {

    const isChecked = event.detail.checked;
    const progress = this.getTodayProgress(habit);

    const todayStr = todayToString();

    this.modalService.showModal(ModalActions.LOADING);

    const currentTimes = progress?.timesPerformed ?? 0;

    if ((!isChecked && !progress) || (isChecked && currentTimes >= 1)) {
      this.modalService.dismissLoading();
      return;
    }

    const hasNote = (progress?.note?.trim().length ?? 0) > 0;

    if (!isChecked && progress && !hasNote) {
      this.habitState.deleteHabitProgress(habit.id, progress.id).pipe(
        finalize(() => this.modalService.dismissLoading())
      ).subscribe();
      return;
    }

    const timesPerformed = isChecked ? 1 : 0;
    const note = progress?.note || GENERAL.EMPTY_STRING;

    const payload = progress
      ? { timesPerformed, note } as UpdateHabitProgressRequest
      : { habitId: habit.id, date: todayStr, timesPerformed,
        note } as CreateHabitProgressRequest

    this.executeProgressAction(habit.id, progress?.id, payload);
  }

  private executeProgressAction(habitId : number, progressId : number | undefined,
    payload : CreateHabitProgressRequest | UpdateHabitProgressRequest) {

    this.habitState.saveHabitProgress(habitId, progressId, payload).pipe(
      finalize(() => this.modalService.dismissLoading())
    ).subscribe();
  }

  handleOpenDetailFromCalendar(event : {habit : HabitView, date : Date}) {
    this.openDetailModal(event.habit, event.date);
  }

}
