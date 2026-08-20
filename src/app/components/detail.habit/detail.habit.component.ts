import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HabitView } from 'src/app/models/views/habit.view';
import { HabitState } from 'src/app/states/habit.state';
import { ProgressHabitComponent } from "../progress.habit/progress.habit.component";

import { IonButton, IonCard, IonCardContent, IonCol, IonIcon, IonItem, IonLabel, IonList, IonRow, IonText } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { calendarClear, calendarClearOutline, createSharp, trashSharp } from 'ionicons/icons';
import { HABIT_FREQUENCIES } from 'src/app/constants/constants';
import { DaysOfWeek } from 'src/app/enums/days.enum';
import { ModalService } from 'src/app/services/modal.service';

@Component({
  selector: 'app-detail-habit',
  standalone: true,
  imports: [
    IonLabel, IonItem, IonList, IonButton, IonText, IonCol, IonRow, IonIcon, IonCardContent, IonCard,
    CommonModule,
    RouterLink,
    ProgressHabitComponent
],
  templateUrl: './detail.habit.component.html',
  styleUrls: ['./detail.habit.component.scss'],
})
export class DetailHabitComponent {

  private readonly habitState = inject(HabitState);
  private readonly modalService = inject(ModalService);

  public viewProgress : boolean = false;

  @Input({required : true}) habit! : HabitView;

  constructor() {
    addIcons({
      calendarClear,
      calendarClearOutline,
      createSharp,
      trashSharp
    });
  }

  buttonViewProgress() : void{
    this.viewProgress = !this.viewProgress;
  }

  async remove(id : number) : Promise<void> {

    if (!id) return;

    const isConfirmed = await this.modalService.confirmDelete();

    if (isConfirmed) {
      this.habitState.deleteHabit(id);
    }
  }

  get formattedDays() : string | string[] {

    if (!this.habit.days) return [];

    const daysArray = Array.isArray(this.habit.days)
      ? this.habit.days
      : Array.from(this.habit.days) as string[];

    const totalDays = daysArray.length;

    if (totalDays === 7) return HABIT_FREQUENCIES.ALL_WEEK;

    const hasSat = daysArray.includes(DaysOfWeek.SATURDAY);
    const hasSun = daysArray.includes(DaysOfWeek.SUNDAY);

    if (totalDays === 5 && !hasSat && !hasSun) return HABIT_FREQUENCIES.WEEKDAYS;
    if (totalDays === 2 && hasSat && hasSun) return HABIT_FREQUENCIES.WEEKEND;

    return daysArray;
  }
}
