import { Component, inject, Input, OnInit } from '@angular/core';

import { CalendarProgressComponent } from "../calendar.progress/calendar.progress.component";

import { IonCard, IonCardContent } from "@ionic/angular/standalone";
import { HabitProgress } from 'src/app/models/dtos/habit.progress.model';
import { HabitState } from 'src/app/states/habit.state';

@Component({
  selector: 'app-progress-habit',
  standalone: true,
  imports: [
    IonCardContent, IonCard,
    CalendarProgressComponent
],
  templateUrl: './progress.habit.component.html',
  styleUrls: ['./progress.habit.component.scss'],
})
export class ProgressHabitComponent implements OnInit {

  @Input() edit : boolean = false;
  @Input({required : true}) habitId! : number;
  @Input({required : true}) habitProgress! : HabitProgress[];
  @Input() streak? : number | null;

  private readonly habitState = inject(HabitState);

  ngOnInit(): void {

    if(!this.habitId) return;

    this.habitState.loadHabitStreak(this.habitId);
  }
}
