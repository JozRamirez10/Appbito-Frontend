import { Component, OnInit } from '@angular/core';

import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Habit, HabitProgress, HabitStreak } from '../../models/habit';
import { findByUserIdRange } from '../../store/habit/habits.action';
import { CommonModule, DatePipe } from '@angular/common';
import { compareDay, dayWihtoutTime, getDayOfWeek, getWeeklyRanges } from '../../utils/helpers';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { filter, Observable, Subject, take, takeUntil } from 'rxjs';
import { findById } from '../../store/user/user.action';
import { selectHabitsWithProgress } from '../../selectors/habit.selector';
import { addHabitProgress, findByIdHabitAndRange, findHabitProgress, removeHabitProgress, updateHabitProgress } from '../../store/habitProgress/habit.progress.action';
import { HabitProgressService } from '../../services/habit-progress.service';
import { DetailHabitProgressComponent } from '../detail.habit.progress/detail.habit.progress.component';
import { CalendarWeekProgressComponent } from "../calendar.week.progress/calendar.week.progress.component";
import { ChartMonthProgressComponent } from "../chart.month.progress/chart.month.progress.component";
import { ModalService } from 'src/app/services/modal.service';
import { IonModal, IonContent, IonCard, IonCardHeader, IonRow, IonCol, IonIcon, IonCardContent, IonGrid, IonSpinner, IonList, IonItem, IonCheckbox, IonLabel, IonBadge, IonButton, IonRefresherContent, IonRefresher } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { addSharp, ellipsisHorizontalSharp, listSharp, newspaperSharp, personSharp, readerOutline } from 'ionicons/icons';

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
export class DailyHabitsComponent implements OnInit{

  private destroy$ = new Subject<void>();

  user ! : User;
  id ! : number;
  
  today : Date = dayWihtoutTime(new Date());
  loading ! : boolean;

  saveHabits : Habit[] = [];

  habits$ ! : Observable<Habit[]>;
  habits ! : Habit[];

  dailyHabits ! : Habit[];
  dailyHabit ! : Habit;

  habitStreaks ! : HabitStreak[];

  isOpen : boolean = false;

  constructor(
    private store : Store<{habits : any, users : any, auth : any, loading : any, habitProgress : any }>,
    private authService : AuthService,
    private habitProgressService : HabitProgressService,
    private modalService : ModalService
  ) {
    addIcons({personSharp,listSharp,addSharp,readerOutline,newspaperSharp,ellipsisHorizontalSharp});
    this.habits$ = this.store.select(selectHabitsWithProgress);
  }

  doRefresh(event : any){
    this.enterOnView().then(() => event.target.complete());;
  }

  async enterOnView(): Promise<void>{
    this.chargeHabits();
  }

  ngOnInit(): void {
    this.habits$.pipe(takeUntil(this.destroy$)).subscribe(habits => {
      this.habits = habits;
      this.loadDailyHabits();
      this.rechargeStreaks();
    });

    this.store.select('auth')
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.id = {... state.id}
    })

    this.store.select('users')
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.user = state.user;
    });

    this.chargeHabits();
  }

  loadDailyHabits(){
    const today = getDayOfWeek();
    this.dailyHabits = this.habits.filter(habit => habit.days.some(day => day === today));
  }

  loadHabitProgress(habit: Habit, day : Date) {
    this.store.dispatch(findHabitProgress({habit, day}));
    this.isOpen = true;
  }

  loadHabitProgressCatch(isOpen : boolean){
    this.isOpen = isOpen;
  }

  chargeHabits() {

    const weekRanges = this.getWeeklyRanges();

    if (!this.user.id) {
      const payload = this.authService.getPayload();
      if(payload && payload.sub){
        this.modalService.showModal('loading');
        this.store.dispatch(findById({ id: Number(payload.sub) }));
      }
    
      this.store.select(state => state.users.user?.id) 
        .pipe(
          filter(id => !!id), 
          take(1) 
        )
        .subscribe(id => {
          this.store.dispatch(findByUserIdRange({ id: id, startDate: weekRanges.start, endDate: weekRanges.end }));
        });
    }else if(this.habits.length === 0){
      this.modalService.showModal('loading');
      this.store.dispatch(findByUserIdRange({id: this.user.id, startDate: weekRanges.start, endDate: weekRanges.end }));  
    }else{
      this.store.dispatch(findByIdHabitAndRange({
        habits: this.habits,
        startDate: weekRanges.start,
        endDate: weekRanges.end
      }))
    }
  }

  onDailyHabitDone(event : Event, habit : Habit) : void {
    const dailyHabitCheck = (event as CustomEvent).detail;
    this.dailyHabit = habit;
    
    if(dailyHabitCheck.checked){
      this.createHabitProgress();

    }else{

      const habitProgress = this.dailyHabit.habitProgress.find(progress => 
        compareDay(progress.date, dayWihtoutTime(new Date())));

      if(habitProgress != undefined ){
        if(habitProgress.note == null || habitProgress.note.length == 0){
          this.deleteHabitProgress(habitProgress);
        } else {
          this.store.dispatch(updateHabitProgress({habitProgressUpdate: {... habitProgress, timesPerformed: 0} }));
          !dailyHabitCheck.checked;
        }
      } 
    }
  }

  createHabitProgress(){
    let habitProgress = new HabitProgress();
    habitProgress.id = Math.random();
    habitProgress.date = dayWihtoutTime( new Date() );
    habitProgress.timesPerformed = 1;
    habitProgress.habitId = this.dailyHabit.id;

    this.store.dispatch(addHabitProgress({
      habitProgressNew: habitProgress
    }));
  }

  deleteHabitProgress(habitProgress : HabitProgress){
    this.store.dispatch(removeHabitProgress({
      habitId: this.dailyHabit.id,
      habitProgressId: habitProgress.id
    }));
  }

  isChecked(habit: Habit) : boolean{
    return habit.habitProgress.some(progress => {
      return compareDay(progress.date, this.today) && progress.timesPerformed > 0;
    });
  }

  hasNote(habit : Habit) : boolean{
    return habit.habitProgress.some(progress =>{
      return compareDay(progress.date, this.today) && progress.note && progress.note?.length > 0
    })
  }

  getWeeklyRanges(){
    const lastDayWeek = dayWihtoutTime(new Date());
    lastDayWeek.setDate(lastDayWeek.getDate() - 7);

    const nextDayWeek = dayWihtoutTime(new Date());
    nextDayWeek.setDate(nextDayWeek.getDate() + 7);

    const lastWeek = getWeeklyRanges(lastDayWeek);
    const nextWeek = getWeeklyRanges(nextDayWeek);

    return {
      start: lastWeek.start,
      end: nextWeek.end
    }
  }

  async rechargeStreaks(){
    this.habitStreaks = await Promise.all(
      this.dailyHabits.map(async dailyHabit => ({
          habit: dailyHabit,
          streak: await this.habitProgressService.getStreakByIdHabit(dailyHabit.id)
      }))
    );
  }

  ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }

}
