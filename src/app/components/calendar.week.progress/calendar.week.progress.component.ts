import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Habit, HabitProgress } from 'src/app/models/habit';
import { selectHabitsWithProgress } from 'src/app/selectors/habit.selector';
import { findByIdHabitAndRange, findHabitProgress } from 'src/app/store/habitProgress/habit.progress.action';
import { dayWihtoutTime, getDone, getWeeklyRanges, hasNote, isToday, monthNames, weekDays } from 'src/app/utils/helpers';
import { IonButton, IonIcon, IonText } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { caretBackOutline, caretForwardOutline, readerOutline } from 'ionicons/icons';

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
export class CalendarWeekProgressComponent  implements OnInit {
  
  private destroy$ = new Subject<void>();

  habits$ ! : Observable<Habit[]>;
  habits ! : Habit[];
  
  weekDays ! : string[];
  monthNames  : string[] = monthNames;
  
  currentDay : Date = new Date;
  
  daysInWeek : Date[] = [];

  timesPerformed : number = 0;

  @Output() isOpen = new EventEmitter<boolean>();
  
  constructor(
    private store : Store<{habits : any}>
  ) {
    addIcons({
      caretBackOutline,
      caretForwardOutline,
      readerOutline
    });
    this.habits$ = this.store.select(selectHabitsWithProgress);
  }

  ngOnInit(): void {
    
    this.habits$.pipe(takeUntil(this.destroy$)).subscribe(habits => {
      this.habits = habits;
    })
    this.generateWeek();

  }

  generateWeek(){
    this.weekDays = weekDays;
    const currentDayIndex = this.currentDay.getDay();
    
    const startOfWeek = new Date(this.currentDay);
    startOfWeek.setDate(this.currentDay.getDate() - ((currentDayIndex + 6) % 7));

    this.daysInWeek = Array.from({length: 7}, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    this.weekDays = this.weekDays.map((day, index) => {
      return day + ' - ' + this.daysInWeek[index].getDate();
    });

    // this.weekDays.unshift('');
  }

  prevWeek(){
    this.currentDay.setDate(this.currentDay.getDate() - 7);
    this.generateWeek();
    this.findPrevWeek(this.currentDay);
  }

  findPrevWeek(day : Date){
    const lastDayWeek = new Date(day);
    lastDayWeek.setDate(lastDayWeek.getDate() - 7);

    const weekRanges = getWeeklyRanges(lastDayWeek);
    this.store.dispatch(findByIdHabitAndRange({
      habits: this.habits,
      startDate: weekRanges.start,
      endDate: weekRanges.end
    })); 
  }

  nextWeek(){
    this.currentDay.setDate(this.currentDay.getDate() + 7)
    this.generateWeek();
    this.findNextWeek(this.currentDay);
  }

  findNextWeek(day : Date){
    const nextDayWeek = new Date(day);
    nextDayWeek.setDate(nextDayWeek.getDate() + 7);

    const weekRanges = getWeeklyRanges(nextDayWeek);
    this.store.dispatch(findByIdHabitAndRange({
      habits: this.habits,
      startDate: weekRanges.start,
      endDate: weekRanges.end
    }));
  }

  isToday(day : Date) : boolean {
    return isToday(day);
  }

  getDone(day : Date, habitProgress : HabitProgress[]) : number {
    return getDone(day, habitProgress);
  }

  hasNote(day : Date, habitProgress : HabitProgress[]) : boolean {
    return hasNote(day, habitProgress);
  }

  loadHabitProgress(habit: Habit, day : Date) {
    this.store.dispatch(findHabitProgress({habit, day: dayWihtoutTime(day)}));
    this.isOpen.emit(true);
  }

}