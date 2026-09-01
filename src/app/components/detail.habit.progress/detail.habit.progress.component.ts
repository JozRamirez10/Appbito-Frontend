import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonButton, IonCol, IonContent, IonHeader, IonIcon, IonInput, IonRow, IonTextarea, ModalController } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { closeSharp } from 'ionicons/icons';
import { finalize } from 'rxjs';
import { GENERAL, MODAL_CONTROLLER } from 'src/app/constants/constants';
import { ModalActions } from 'src/app/enums/modal.actions.enum';
import { CreateHabitProgressRequest, HabitProgress, UpdateHabitProgressRequest } from 'src/app/models/dtos/habit.progress.model';
import { ModalService } from 'src/app/services/modal.service';
import { HabitState } from 'src/app/states/habit.state';
import { formatDateToString } from 'src/app/utils/helpers';

@Component({
  selector: 'app-detail-habit-progress',
  standalone: true,
  imports: [
    IonRow, IonContent, IonIcon, IonButton, IonCol, IonHeader, IonInput, IonTextarea,
    CommonModule,
    FormsModule
  ],
  templateUrl: './detail.habit.progress.component.html',
  styleUrls: ['./detail.habit.progress.component.scss'],
})
export class DetailHabitProgressComponent implements OnInit {

  @Input() edit : boolean = false;
  @Input({ required: true }) habitId! : number;
  @Input({ required: true }) day! : Date | null;
  @Input() monthProgress: HabitProgress[] = [];

  private readonly habitState = inject(HabitState);
  private readonly modalController = inject(ModalController);
  private readonly modalService = inject(ModalService);

  progressForm : Partial<HabitProgress> = {
    timesPerformed: 0,
    note: ''
  };

  constructor () {
    addIcons({ closeSharp });
  }

  ngOnInit() : void {

    if (!this.day) return;

    const formattedDate = formatDateToString(this.day);
    const existing = this.monthProgress.find(p => p.date === formattedDate);

    this.progressForm = existing
      ? { ...existing }
      : { habitId: this.habitId, date: formattedDate, timesPerformed: 0,
        note: GENERAL.EMPTY_STRING };
  }

  setDone(increment : number) : void {
    const currentTimes = this.progressForm.timesPerformed || 0;
    const newTimes = currentTimes + increment;

    if (newTimes >= 0) {
      this.progressForm.timesPerformed = newTimes;
    }
  }

  onSubmit() : void {

    const times = this.progressForm.timesPerformed || 0;
    const note = this.progressForm.note?.trim() || GENERAL.EMPTY_STRING;

    if (times <= 0 && note.length === 0) {
      this.modalService.showModal(ModalActions.ERROR_HABIT_PROGRESS_SAVE);
      return;
    }

    this.modalService.showModal(ModalActions.LOADING);

    const payload = this.progressForm.id
      ? { timesPerformed: times, note } as UpdateHabitProgressRequest
      : { habitId: this.habitId, date: this.progressForm.date, timesPerformed: times,
        note } as CreateHabitProgressRequest;

    this.habitState.saveHabitProgress(this.habitId, this.progressForm.id, payload).pipe(
      finalize(() => this.modalService.dismissLoading())
    ).subscribe({
      next: () => {
        this.modalController.dismiss(null, MODAL_CONTROLLER.SUCCESS);
        this.modalService.showModal(ModalActions.EDIT);
      },
      error: (err) => this.validateErrorToCloseModal(err)
    });
  }

  onDeleteHabitProgress() : void {

    if(!this.progressForm.id) return;

    this.modalService.showModal(ModalActions.LOADING);

    this.habitState.deleteHabitProgress(this.habitId, this.progressForm.id).pipe(
      finalize(() => this.modalService.dismissLoading())
    ).subscribe({
      next: () => {
        this.modalController.dismiss(null, MODAL_CONTROLLER.SUCCESS);
        this.modalService.showModal(ModalActions.DELETE);
      },
      error: (err) => this.validateErrorToCloseModal(err)
    });
  }

  closeHabitProgressCanvas() {
    this.modalController.dismiss(null, MODAL_CONTROLLER.CANCEL);
  }

  private validateErrorToCloseModal(err : HttpErrorResponse) {
    if (err?.status == HttpStatusCode.Unauthorized || err?.status == HttpStatusCode.Forbidden) {
      this.closeHabitProgressCanvas()
    }
  }
}
