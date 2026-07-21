import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { ChartType } from 'chart.js';
import { Chart } from 'chart.js/auto'
import { combineLatest, Observable, Subject, takeUntil } from 'rxjs';
import { Habit, MonthlyHabit } from 'src/app/models/habit';
import { selectHabitProgressByMonth, selectHabitsWithProgress } from 'src/app/selectors/habit.selector';
import { loadHabitProgressByMonth } from 'src/app/store/habitProgressMonthly/habit.progress.month.action';
import { monthNames } from 'src/app/utils/helpers';
import { IonButton, IonIcon, IonText } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { caretBackCircleOutline, caretForwardCircleOutline } from 'ionicons/icons';

@Component({
  selector: 'app-chart-month-progress',
  standalone: true,
  imports: [
    IonText, IonIcon, IonButton
  ],
  templateUrl: './chart.month.progress.component.html',
  styleUrls: ['./chart.month.progress.component.scss'],
})
export class ChartMonthProgressComponent  implements OnInit {
  @ViewChild('chartCanvas', {static: false}) chartCanvas!: ElementRef;

  private destroy$ = new Subject<void>();

  chart ! : Chart;
  monhtNames : string[] = monthNames;
  currentDay : Date = new Date();

  habitProgressMonthly$ ! : Observable<any>;
  habitProgressMonthly ! : any;

  habits$ ! : Observable<Habit[]>;
  habits ! : Habit[];

  monthlyHabits ! : MonthlyHabit[];
  
  constructor(
    private store : Store<{habits : any}>
  ) {
    addIcons({
      caretBackCircleOutline,
      caretForwardCircleOutline
    });
    this.monthlyHabits = [];
    this.habits$ = this.store.select(selectHabitsWithProgress);
    this.habitProgressMonthly$ = this.store.select(selectHabitProgressByMonth);
  }

  ngOnInit(): void {

    combineLatest([this.habitProgressMonthly$, this.habits$])
      .pipe(takeUntil(this.destroy$))
      .subscribe(([habitProgress, habits]) =>{
        if(!habitProgress || !habits) return;

        this.habitProgressMonthly = { ...habitProgress};
        this.habits = habits;
        this.onHabistChange();
      });

    const currentYear = this.currentDay.getFullYear();
  
    const years = [
      currentYear - 1,
      currentYear
    ];
    
    if(!this.habitProgressMonthly?.[currentYear]){
      this.store.dispatch(loadHabitProgressByMonth({years: years, habitIds: this.getHabitsIds() }));
    }
  }

  ngAfterViewInit() : void {
    // setTimeout( () => {
    //   this.generateChart();
    // });
  }

  onHabistChange(){
    this.getMonthlyHabits();
    this.generateChart();
  }

  getMonthlyHabits() : void {
    this.monthlyHabits = [];

    if(!this.habits || this.habits.length === 0)
      return;
    
    this.habits.forEach(habit => {
      let count : number[] = [];
      
      this.monhtNames.forEach( (month, index) => {
        count.push(
          this.getDateCountForMonth(habit.id, this.currentDay.getFullYear(), index + 1)
        )
      });
      
      this.monthlyHabits.push({
        name: habit.name,
        count: count
      });
    
    });
  }

  getDateCountForMonth(habitId : number, year : number, month : number) : number {
    if(!this.habitProgressMonthly?.[year]?.[month])
      return 0;
    return this.habitProgressMonthly[year][month][habitId] || 0;
  }

  prevYear(){
    this.currentDay.setFullYear(this.currentDay.getFullYear() - 1);
    this.findPrevYear(this.currentDay);
    this.getMonthlyHabits();
    this.generateChart();
  }

  findPrevYear(day : Date){
    const lastYear = day.getFullYear() - 1;
    const years = [lastYear];
    this.store.dispatch(loadHabitProgressByMonth({years, habitIds: this.getHabitsIds() }));
  }

  nextYear(){
    this.currentDay.setFullYear(this.currentDay.getFullYear() + 1);
    this.findNextYear(this.currentDay);
    this.getMonthlyHabits();
    this.generateChart();
  }

  findNextYear(day : Date){
    const lastYear = day.getFullYear() + 1;
    const years = [lastYear];
    this.store.dispatch(loadHabitProgressByMonth({years, habitIds: this.getHabitsIds() }));
  }

  getHabitsIds() : number[] {
    let habitIds : number[] = [];
    this.habits.forEach(habit => habitIds.push(habit.id));
    return habitIds;
  }

  generateChart() : void {

    if(!this.chartCanvas || !this.chartCanvas.nativeElement) return;

    const ctx = this.chartCanvas.nativeElement.getContext("2d");

    if(!ctx){
      return;
    }

    if(this.chart){
      this.chart.destroy();
    }

    const data = {
      labels : monthNames,
      datasets : 
        this.monthlyHabits.map(habit => {
          const randomColor = `rgb(
            ${Math.floor(Math.random() * 256)}, 
            ${Math.floor(Math.random() * 256)}, 
            ${Math.floor(Math.random() * 256)}
          )`;

          return {
            label: habit.name,
            data: habit.count,
            fill: false,
            borderColor : randomColor,
            backgroundColor: randomColor,
            tension: 0.1,
          }
        }
      )
    };

    const options = {
      devicePixelRatio: window.devicePixelRatio || 1,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: '#fff' },
          grid: { color: '#2c2c37' },
          font: {
            size: 16,
            family: "Arial, sans-serif"
          }
        },
        y: {
          ticks: { color: '#fff' },
          grid: { color: '#2c2c37' },
          beginAtZero: true,
          min: 0,
          // max: 31
          font: {
            size: 16,
            family: "Arial, sans-serif"
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            color: '#fff',
            font: {
              size: 16,
              family: "Arial, sans-serif"
            },
          }
        }
      },
      layout: {
        padding: 30
      }
    };

    this.chart = new Chart(ctx, {
      type: 'line' as ChartType,
      data: data,
      options: options,
    });

  }

}
