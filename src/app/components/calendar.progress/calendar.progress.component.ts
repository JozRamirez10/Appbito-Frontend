import { CommonModule } from '@angular/common';
import { Component, computed, inject, Input, OnInit, signal } from '@angular/core';

import { getDone, getMonthlyRanges, getTwoMonthlyRangesForDate, hasNote, isToday } from 'src/app/utils/helpers';
import { DetailHabitProgressComponent } from "../detail.habit.progress/detail.habit.progress.component";

import { IonButton, IonIcon, IonModal, IonText } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { caretBackOutline, caretForwardOutline, cloudOfflineOutline, readerOutline } from 'ionicons/icons';
import { CALENDAR } from 'src/app/constants/constants';
import { MonthStatus } from 'src/app/enums/month.status.enum';
import { ModalService } from 'src/app/services/modal.service';
import { HabitState } from 'src/app/states/habit.state';

@Component({
  selector: 'app-calendar-progress',
  templateUrl: './calendar.progress.component.html',
  styleUrls: ['./calendar.progress.component.scss'],
  standalone: true,
  imports: [
    IonButton, IonModal, IonText, IonIcon,
    CommonModule,
    DetailHabitProgressComponent
],
})
export class CalendarProgressComponent implements OnInit {

  @Input() edit : boolean = false;
  @Input({required: true}) habitId! : number;

  private readonly habitState = inject(HabitState);
  private readonly modalService = inject(ModalService);

  currentDate = signal<Date>(new Date());
  calendarWeeks = signal<Date[][]>([]);

  isOpen = signal<boolean>(false);
  selectedDay = signal<Date | null>(null);

  readonly weekDays : string[] = CALENDAR.WEEKDAYS;
  readonly monthNames : string [] = CALENDAR.MONTH_NAMES;

  habitProgress = computed(() => {
    const habit = this.habitState.habits().find(h => h.id === this.habitId);
    return habit?.progress || [];
  });

  currentMonthStatus = computed(() => {
    const date = this.currentDate();
    const status = this.habitState.getMonthStatus({
      habitId: this.habitId,
      year: date.getFullYear(),
      month: date.getMonth()
    });
    return status ?? MonthStatus.SUCCESS;
  });

  constructor() {
    addIcons({
      caretBackOutline,
      caretForwardOutline,
      readerOutline,
      cloudOfflineOutline
    });
  }

  ngOnInit() {
    this.generateCalendar(this.currentDate());
    const ranges = getTwoMonthlyRangesForDate(this.currentDate());
    this.fetchData(ranges.start, ranges.end);
  }

  generateCalendar(date : Date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const offset = (firstDayOfMonth + 6) % 7;

    const daysInMonth = new Array(offset).fill(null).concat(
      Array.from({ length: totalDays }, (_, i) => new Date(year, month, i + 1))
    )

    const weeks: Date[][] = [];
    for (let i = 0; i < daysInMonth.length; i += 7) {
      weeks.push(daysInMonth.slice(i, i + 7));
    }
    this.calendarWeeks.set(weeks);
  }

  changeMonth(offset : number) {
    const current = this.currentDate();
    const newDate = this.generateDateWithOffset(current, offset);

    this.currentDate.set(newDate);
    this.generateCalendar(newDate);

    const ranges = getMonthlyRanges(newDate);
    this.fetchData(ranges.start, ranges.end);
  }

  generateDateWithOffset(date : Date, offset : number) : Date {
    return new Date(date.getFullYear(), date.getMonth() + offset, 1);
  }

  fetchData(startDate : string, endDate : string) {
    this.habitState.loadProgress(this.habitId, startDate, endDate);
  }

  isToday(day : Date) : boolean {
    return isToday(day);
  }

  getDoneCount(day : Date) : number {
    if (day != null) {
      return getDone(day, this.habitProgress());
    }
    return 0;
  }

  hasNoteData(day : Date) : boolean {
    if (!day) return false;
    return hasNote(day, this.habitProgress());
  }

  loadHabitProgress(day : Date) {
    if (day) {
      this.selectedDay.set(day);
      this.isOpen.set(true);
    }
  }

  retryCurrentMonth() {
    const ranges = getMonthlyRanges(this.currentDate());
    this.fetchData(ranges.start, ranges.end);
  }

  handleModalDismiss(event: any) {
    this.isOpen.set(false);
  }

}
