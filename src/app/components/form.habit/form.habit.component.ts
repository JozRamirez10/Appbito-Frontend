import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { IonAccordion, IonAccordionGroup, IonButton, IonCard, IonCardContent, IonCardHeader, IonCardTitle, IonCheckbox, IonCol, IonContent, IonDatetime, IonDatetimeButton, IonIcon, IonInput, IonItem, IonLabel, IonModal, IonRow, IonText, IonToggle } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { closeSharp } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { BaseForm } from 'src/app/classes/base.form';
import { APP, GENERAL, VIEWS } from 'src/app/constants/constants';
import { DaysOfWeek } from 'src/app/enums/days.enum';
import { ModalActions } from 'src/app/enums/modal.actions.enum';
import { Habit } from 'src/app/models/dtos/habit.model';
import { ModalService } from 'src/app/services/modal.service';
import { HabitState } from 'src/app/states/habit.state';
import { dateToDatetimeStr } from 'src/app/utils/helpers';
import { CalendarProgressComponent } from "../calendar.progress/calendar.progress.component";

@Component({
  selector: 'app-form.habit',
  standalone: true,
  imports: [IonText,
    IonButton, IonAccordion, IonAccordionGroup, IonCheckbox, IonCardTitle, IonModal, IonDatetimeButton, IonItem, IonLabel, IonCardContent, IonIcon, IonCol, IonRow, IonCardHeader, IonCard, IonContent, IonInput, IonToggle, IonDatetime,
    RouterLink,
    FormsModule,
    CalendarProgressComponent
],
  templateUrl: './form.habit.component.html',
  styleUrls: ['./form.habit.component.scss'],
})
export class FormHabitComponent extends BaseForm implements OnInit {

  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly habitState = inject(HabitState);
  private readonly modalService = inject(ModalService);

  habitForm : Partial<Habit> = { days: [] };
  daysOfWeek = DaysOfWeek;

  view = signal<string>('');
  hourAllowed = false;
  errorHour = false;

  constructor() {
    super();
    addIcons({closeSharp});
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = Number(params.get(APP.ID)) || GENERAL.ZERO;
      const viewMode = params.get(APP.VIEW) || GENERAL.EMPTY_STRING;

      this.view.set(viewMode);

      if (id > 0) {
        const existingHabit = this.habitState.habits().find(h => h.id === id);

        if (existingHabit) {
          this.habitForm = { ...existingHabit };
          this.hourAllowed = !!this.habitForm.hour;
        } else {
          this.router.navigate([VIEWS.LIST_HABITS]);
        }
      } else {
        this.habitForm = { days: [] };
        this.hourAllowed = false;
      }
    });
  }

  onHourAllowed(event : any ) : void {
    this.hourAllowed = event.detail.checked;
    if (!this.hourAllowed) {
      this.habitForm.hour = undefined;
    } else if (!this.habitForm.hour) {
      this.habitForm.hour = dateToDatetimeStr(new Date());
    }
  }

  onSubmit() : void {
    this.errorHour = false;
    this.clearErrors();

    if (this.hourAllowed) {
      if (!this.habitForm.hour) {
        this.errorHour = true;
        return;
      }

      if (this.habitForm.hour.includes(GENERAL.SEPARATE_DATETIME)) {
        this.habitForm.hour = dateToDatetimeStr(new Date(this.habitForm.hour));
      }
    }

    this.modalService.showModal(ModalActions.LOADING);

    this.habitState.saveHabit(this.habitForm).pipe(
      finalize(() => this.modalService.dismissLoading())
    ).subscribe({
      next: () => {
        this.router.navigate([VIEWS.LIST_HABITS]);
      },
      error: (err : HttpErrorResponse) => {
        this.handleFormError(err);
      }
    });
  }

  toggleAllDays() {
    const allDays = Object.values(DaysOfWeek);

    if (this.habitForm.days?.length === allDays.length) {
      this.habitForm.days = [];
    } else {
      this.habitForm.days = [...allDays];
    }
  }

  toggleDay(day : DaysOfWeek){
    const currentDays = this.habitForm.days || [];
    const index = currentDays.indexOf(day);

    if (index === -1) {
      this.habitForm.days = [...currentDays, day];
    } else {
      this.habitForm.days = currentDays.filter(d => d !== day);
    }
  }
}
