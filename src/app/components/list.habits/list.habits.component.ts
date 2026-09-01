import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { getTwoMonthlyRangesForDate } from 'src/app/utils/helpers';

import { IonButton, IonCard, IonCardContent, IonCardHeader, IonCol, IonContent, IonIcon, IonList, IonRefresher, IonRefresherContent, IonRow } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { addSharp, closeSharp } from 'ionicons/icons';
import { HabitViewRefresh } from 'src/app/classes/habit.view.refresh';
import { DetailHabitComponent } from "../detail.habit/detail.habit.component";

@Component({
  selector: 'app-list-habits',
  standalone: true,
  imports: [
    IonRefresher, IonRefresherContent,
    IonList, IonCardContent, IonIcon, IonCol, IonRow, IonCardHeader, IonCard, IonContent, IonButton,
    RouterLink,
    DetailHabitComponent
  ],
  templateUrl: './list.habits.component.html',
  styleUrls: ['./list.habits.component.scss'],
})
export class ListHabitsComponent extends HabitViewRefresh {

  readonly habits = this.habitState.habits;
  readonly isLoading = this.habitState.isLoading;

  constructor() {
    super();
    addIcons({ closeSharp, addSharp });
  }

  override loadData(): void {
    const ranges = getTwoMonthlyRangesForDate(new Date());
    this.habitState.loadHabitsWithProgress(ranges.start, ranges.end);
  }
}