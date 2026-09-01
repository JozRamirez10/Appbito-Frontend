import { Component, computed, DestroyRef, effect, ElementRef, inject, OnInit, signal, untracked } from '@angular/core';
import { IonButton, IonIcon, IonSpinner, IonText } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { caretBackCircleOutline, caretForwardCircleOutline } from 'ionicons/icons';
import { ApexAxisChartSeries, ApexChart, ApexDataLabels, ApexStroke, ApexTheme, ApexXAxis, ApexYAxis, NgApexchartsModule } from "ng-apexcharts";
import { APP, CALENDAR } from 'src/app/constants/constants';
import { HabitState } from 'src/app/states/habit.state';
import { getMonthlyProgressKey } from 'src/app/utils/helpers';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  yaxis: ApexYAxis;
  theme: ApexTheme;
  stroke: ApexStroke;
  dataLabels: ApexDataLabels;
}

@Component({
  selector: 'app-chart-month-progress',
  standalone: true,
  imports: [IonSpinner,
    IonText, IonIcon, IonButton, NgApexchartsModule
  ],
  templateUrl: './chart.month.progress.component.html',
  styleUrls: ['./chart.month.progress.component.scss']
})
export class ChartMonthProgressComponent implements OnInit {

  public readonly habitState = inject(HabitState);
  private readonly elementRef = inject(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly monthNames = CALENDAR.MONTH_NAMES;
  currentYear = signal<number>(new Date().getFullYear());

  chartSeries = computed<ApexAxisChartSeries>(() => {
    const habits = this.habitState.habits();
    const stats = this.habitState.habitProgressMonthly();
    const year = this.currentYear();

    if (!habits || habits.length === 0) return [];

    const statsMap = new Map<string, number>();

    stats.forEach(s => {
      const key = getMonthlyProgressKey(s.year, s.month, s.habitId);
      statsMap.set(key, s.totalTimesPerformed);
    })

    return habits.map(habit => {
      const data = this.monthNames.map((_, index) => {
        const month = index + 1;
        const key = getMonthlyProgressKey(year, month, habit.id);
        return statsMap.get(key) ?? 0;
      });

      return { name: habit.name, data: data }
    });
  });

  public readonly chartOptions : Partial<ChartOptions> = {
    chart: {
      type: 'line',
      height: 350,
      background: 'transparent',
      toolbar: { show: true, tools: { zoom: true, pan: true, reset: true }}
    },
    theme: { mode: 'dark', palette: 'palette1' },
    stroke: { curve: 'smooth', width: 3 },
    dataLabels: { enabled: true },
    xaxis: { categories: this.monthNames },
    yaxis: { min: 0 }
  };

  constructor() {
    addIcons({ caretBackCircleOutline, caretForwardCircleOutline });

    effect(() => {
      const habits = this.habitState.habits();
      const year = this.currentYear();

      if (habits.length > 0) {
        untracked(() => {

          if (!this.isYearLoad(year)) {
            const habitIds = this.getHabitsIds();
            this.habitState.loadHabitProgressMonthly([year - 1, year], habitIds);
          }
        });
      }
    });
  }

  ngOnInit(): void {
    this.setupChartResizeObserver();
  }

  changeYear(offset : number) {
    this.currentYear.update(y => y + offset);
  }

  private getHabitsIds() : number[] {
    return untracked(() => this.habitState.habits().map(h => h.id));
  }

  private isYearLoad(year : number) {
    return untracked(() => this.habitState.habitProgressMonthly().some(r => r.year === year));
  }

  private setupChartResizeObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => window.dispatchEvent(new Event(APP.RESIZE)), APP.TIME_RESIZE);
        }
      });
    });

    observer.observe(this.elementRef.nativeElement);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
