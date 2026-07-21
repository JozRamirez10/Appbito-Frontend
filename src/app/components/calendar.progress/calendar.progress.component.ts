import { Component, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Habit, HabitProgress } from 'src/app/models/habit';
import { selectHabitsWithProgress } from 'src/app/selectors/habit.selector';
import { findByIdHabitAndRange, findHabitProgress } from 'src/app/store/habitProgress/habit.progress.action';
import { dayWihtoutTime, getDone, getMonthlyRanges, getTwoMonthlyRangesForToday, hasNote, isToday, monthNames, weekDays } from 'src/app/utils/helpers';
import { CommonModule } from '@angular/common';
import { DetailHabitProgressComponent } from "../detail.habit.progress/detail.habit.progress.component";
import { IonButton, IonIcon, IonText, IonModal } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { caretBackOutline, caretForwardOutline, readerOutline } from 'ionicons/icons';

@Component({
  selector: 'app-calendar-progress',
  templateUrl: './calendar.progress.component.html',
  styleUrls: ['./calendar.progress.component.scss'],
  standalone: true,
  imports: [
    IonButton, IonModal, IonText, IonIcon, IonButton, 
    CommonModule,
    DetailHabitProgressComponent
],
})
export class CalendarProgressComponent  implements OnInit {

  habitProgress ! : HabitProgress[];
  destroy$ = new Subject<void>();

  currentDate: Date = new Date();
  daysInMonth: Date[] = [];
  calendarWeeks: Date[][] = [];

  weekDays : string[] = weekDays;
  monthNames : string [] = monthNames;
  
  @Input() edit : boolean  = false;
  
  habit ! : Habit ; 
  habits ! : Habit[];
  habits$ ! : Observable<Habit[]>;

  isOpen : boolean = false;
  
  constructor(
    private store : Store<{habits: any}>
  ) {
    addIcons({
      caretBackOutline,
      caretForwardOutline,
      readerOutline
    });
    this.store.select('habits').subscribe(state => {
      this.habit = state.habit;
      this.habits = state.habits;
    });

    this.habits$ = this.store.select(selectHabitsWithProgress);
  }

  ngOnInit() {
    this.generateCalendar();
    this.habits$.pipe(takeUntil(this.destroy$)).subscribe(habits => {
      this.habitProgress = habits.flatMap(habit => habit.id == this.habit.id ? habit.habitProgress : []);
    });

    const ranges = getTwoMonthlyRangesForToday();

    this.store.dispatch(findByIdHabitAndRange({
      habits: [this.habit],
      startDate: ranges.start,
      endDate: ranges.end
    }));
  }

  generateCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Ajustar el inicio de la semana (lunes a domingo)
    const offset = (firstDayOfMonth + 6) % 7;

    this.daysInMonth = Array(offset).fill(null).concat(
      Array.from({ length: totalDays }, (_, i) => new Date(year, month, i + 1))
    );

    this.calendarWeeks = [];
    for(let i = 0; i < this.daysInMonth.length; i += 7){
      this.calendarWeeks.push(this.daysInMonth.slice(i, i + 7));
    }    
  }

  prevMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() - 1);
    this.generateCalendar();
    this.findPrevMonth(this.currentDate);
  }

  findPrevMonth(day : Date) {
    const lastDayMonth = new Date(day.getFullYear(), day.getMonth() - 1, day.getDate());
    const monthRanges = getMonthlyRanges(lastDayMonth);

    this.store.dispatch(findByIdHabitAndRange({
      habits: this.habits,
      startDate: monthRanges.start,
      endDate: monthRanges.end
    }));
  }

  nextMonth() {
    this.currentDate.setMonth(this.currentDate.getMonth() + 1);
    this.generateCalendar();
    this.findNextMonth(this.currentDate);
  }

  findNextMonth(day : Date) {
    const nextDayMonth = new Date(day.getFullYear(), day.getMonth() + 1, day.getDate());
    const monthRanges = getMonthlyRanges(nextDayMonth);

    this.store.dispatch(findByIdHabitAndRange({
      habits: this.habits,
      startDate: monthRanges.start,
      endDate: monthRanges.end
    }));
  }

  isToday(day : Date) : boolean {
    return isToday(day);
  }

  getDone(day : Date, habitProgress : HabitProgress[]) : number {
    if(day != null){
      return getDone(dayWihtoutTime(day), habitProgress);
    }
    return 0;
  }

  hasNote(day : Date, habitProgress : HabitProgress[]) : boolean {
    if(day != null){
      return hasNote(day, habitProgress);
    }
    return false;
  }

  loadHabitProgress(habit: Habit, day : Date) {
    if(day != null){
      this.store.dispatch(findHabitProgress({habit, day}));
      this.isOpen = true;
    }
  }
}
