import { Component, Input } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Habit, HabitProgress } from 'src/app/models/habit';
import { addHabitProgress, removeHabitProgress, updateHabitProgress } from 'src/app/store/habitProgress/habit.progress.action';
import { CommonModule } from '@angular/common';
import { ModalService } from 'src/app/services/modal.service';
import { IonHeader,IonCol, IonButton, IonIcon, IonContent, IonRow, IonInput, ModalController, IonTextarea } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { closeSharp } from 'ionicons/icons';

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
export class DetailHabitProgressComponent {

  @Input() edit : boolean = false;

  habitProgress ! : HabitProgress;

  habit ! : Habit;

  day ! : Date;

  constructor (
    private store : Store<{habitProgress : any, habits : any, loading : any}>,
    private modalController : ModalController,
    private modalService : ModalService
  ) {

    addIcons({
      closeSharp
    });

    this.habitProgress = new HabitProgress();
    this.habit = new Habit();
    
    this.store.select('habitProgress').subscribe(state => {
      this.habitProgress = {...state.habitProgress};
      this.habit = {...state.habit};
      this.day = state.day;
    });

  }

  setDone(operation : string) : void{

    let updateProgress = {... this.habitProgress};

    switch(operation){
      case '+':
        updateProgress.timesPerformed++;
        break;
      case '-':
        if(updateProgress.timesPerformed > 0)
          updateProgress.timesPerformed--;
        break;
      default:
        break;
    }

    this.habitProgress = {...updateProgress};

  }

  onSubmit(habitProgressForm : NgForm) : void {
    if(this.habitProgress.timesPerformed > 0 || (this.habitProgress.note !== undefined && this.habitProgress.note?.length > 0) ){
      if(this.habitProgress.id === undefined){
        this.habitProgress.date = this.day;
        this.habitProgress.habitId = this.habit.id;
        this.store.dispatch(addHabitProgress({habitProgressNew: this.habitProgress }));
      }else{
        this.store.dispatch(updateHabitProgress({habitProgressUpdate: this.habitProgress }));
      }
      // showModal('loading');
      this.modalService.showModal('loading');
      this.closeHabitProgressCanvas();
    }else{
      const message = 'You should include the times you have done it or a quick note';
      // showModal('custom', "Error", message, "error");
      this.modalService.showModal('custom', "Error", message, "error");
    }
  }

  onDeleteHabitProgress(){
    this.store.dispatch(removeHabitProgress({
      habitId: this.habit.id,
      habitProgressId: this.habitProgress.id
    }));
    // showModal('loading');
    this.modalService.showModal('loading');
    this.closeHabitProgressCanvas();
  }

  closeHabitProgressCanvas(){
    this.modalController.dismiss(null, 'cancel');
  }

}
