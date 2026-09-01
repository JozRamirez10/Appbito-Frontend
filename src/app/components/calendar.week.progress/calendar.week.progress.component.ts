import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output, signal, untracked } from '@angular/core';
import { IonButton, IonIcon, IonText } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { caretBackOutline, caretForwardOutline, readerOutline } from 'ionicons/icons';
import { CALENDAR } from 'src/app/constants/constants';
import { HabitView } from 'src/app/models/views/habit.view';
import { HabitState } from 'src/app/states/habit.state';
import { getDone, getMonthlyRanges, hasNote, isToday } from 'src/app/utils/helpers';

@Component({
  selector: 'app-calendar-week-progress',
  standalone: true,
  imports: [
    IonText, IonIcon, IonButton,
    CommonModule,
  ],
  templateUrl: './calendar.week.progress.component.html',
  styleUrls: ['./calendar.week.progress.component.scss'],
})
export class CalendarWeekProgressComponent {

  private readonly habitState = inject(HabitState);

  currentDay = signal<Date>(new Date());
  readonly monthNames = CALENDAR.MONTH_NAMES;

  daysInWeek = computed<Date[]>(() => {
    const current = this.currentDay();
    const currentDayIndex = current.getDay();

    const startOffset = (currentDayIndex + 6) % 7;

    const startOfWeek = new Date(current);
    startOfWeek.setDate(current.getDate() - startOffset);

    return Array.from({ length: 7}, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
  });

  weekDaysHeader = computed<string[]>(() => {
    const days = this.daysInWeek();
    return CALENDAR.WEEKDAYS.map((dayName, index) => `${dayName} - ${days[index].getDate()}`);
  });

  habits = computed(() => this.habitState.habits());

  @Output() isOpen = new EventEmitter<boolean>();
  @Output() openDetail = new EventEmitter<{ habit : HabitView, date : Date }>();

  constructor() {
    addIcons({ caretBackOutline, caretForwardOutline, readerOutline });
  }

  changeWeek(offset : number) {
    const newDate = new Date(this.currentDay());
    newDate.setDate(newDate.getDate() + (offset * 7));

    this.currentDay.set(newDate);

    const ranges = getMonthlyRanges(newDate);
    untracked(() => {
      this.habits().forEach(habit => {
        this.habitState.loadProgress(habit.id, ranges.start, ranges.end)
      });
    });
  }

  isToday(day : Date) : boolean {
    return isToday(day);
  }

  getDoneCount(day : Date, habit : HabitView) : number {
    return getDone(day, habit.progress);
  }

  hasNoteData(day : Date, habit : HabitView) : boolean {
    return hasNote(day, habit.progress);
  }

  openDetailModal(habit : HabitView, day : Date) {
    this.openDetail.emit({ habit, date: day });
    this.isOpen.emit(true);
  }
}