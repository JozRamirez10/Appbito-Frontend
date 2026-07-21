import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { DaysOfWeek } from 'src/app/enums/days.enum';
import { Habit } from 'src/app/models/habit';
import { find, remove } from 'src/app/store/habit/habits.action';
import { AlertController } from '@ionic/angular';
import { ModalService } from 'src/app/services/modal.service';
import { ProgressHabitComponent } from "../progress.habit/progress.habit.component";
import { IonCard, IonCardContent, IonIcon, IonRow, IonCol, IonText, IonButton, IonList, IonItem, IonLabel } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { calendarClear, calendarClearOutline, createSharp, trashSharp } from 'ionicons/icons';

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

private destroy$ = new Subject<void>();
  
  public viewProgress ! : boolean;

  daysOfWeek = DaysOfWeek;

  @Input() habit ! : Habit;

  habitStore ! : Habit;

  constructor(
    private store : Store<{habits : any, loading : any}>,
    private alertCtrl : AlertController,
    private modalService : ModalService
  ) {
    addIcons({
      calendarClear,
      calendarClearOutline,
      createSharp,
      trashSharp
    }),
    this.viewProgress = false;
    this.store.select('habits').subscribe(state => {
      this.habitStore = {... state.habit};
    });
  }

  buttonViewProgress() : boolean{
    this.viewProgress = !this.viewProgress;
    if(this.viewProgress){
      this.store.dispatch(find({id: this.habit.id}));
    }
    return this.viewProgress;
  }

  async remove(id: number) : Promise<void> {
    const alert = await this.alertCtrl.create({
      header: "Are you sure?",
      message: "You won't be able to revert this!",
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          cssClass: 'alert-button-cancel'
        },
        {
          text: 'Yes, delete it!',
          role: 'confirm',
          cssClass: 'alert-button-confirm',
          handler: () => {
            this.store.dispatch(remove({id}));
            this.modalService.showModal("loading");
          }
        }
      ]
    });
    await alert.present();
  }

  ngOnDestroy() : void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
