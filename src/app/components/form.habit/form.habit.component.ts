import { Component, OnInit } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { DaysOfWeek } from 'src/app/enums/days.enum';
import { Habit } from 'src/app/models/habit';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { add, edit, find, resetHabit } from 'src/app/store/habit/habits.action';
import { CalendarProgressComponent } from "../calendar.progress/calendar.progress.component";
import { IonContent, IonCard, IonCardHeader, IonRow, IonCol, IonIcon, IonCardContent, IonLabel, IonItem, IonDatetimeButton, IonDatetime, IonModal, IonCardTitle, IonCheckbox, IonAccordionGroup, IonAccordion, IonButton, IonInput, IonToggle } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { closeSharp } from 'ionicons/icons';

@Component({
  selector: 'app-form.habit',
  standalone: true,
  imports: [
    IonButton, IonAccordion, IonAccordionGroup, IonCheckbox, IonCardTitle, IonModal, IonDatetimeButton, IonItem, IonLabel, IonCardContent, IonIcon, IonCol, IonRow, IonCardHeader, IonCard, IonContent, IonInput, IonToggle, IonDatetime,
    RouterLink,
    FormsModule,
    CalendarProgressComponent
],
  templateUrl: './form.habit.component.html',
  styleUrls: ['./form.habit.component.scss'],
})
export class FormHabitComponent  implements OnInit {

  loading ! : boolean;

  habit ! : Habit;
  daysOfWeek = DaysOfWeek;

  errors : any = {}
  errorHour : boolean = false;
  
  view ! : string;

  hourAllowed : boolean;
  
  constructor(
    private store : Store<{habits : any, loading : any}>,
    private route : ActivatedRoute,
    private authService : AuthService,
    private modalService : ModalService
  ) {
    addIcons({
      closeSharp
    });
    this.habit = new Habit();
    this.hourAllowed = false;

    this.store.select('habits').subscribe(state => {
      this.habit = {... state.habit};
      this.errors = state.errors;
    });

  }

  ngOnInit(): void {
    this.store.dispatch(resetHabit());
    this.route.paramMap.subscribe(params => {
      const id : number = + (params.get('id') || '0');
      if(id > 0){
        this.store.dispatch(find({id}));
        
        if(this.habit.hour){
          this.hourAllowed = true;
        }
        
      }
      this.view = params.get('view') || '';

      if(this.view !== 'view' && this.view !== 'edit'){
        this.store.dispatch(resetHabit());
      }

    })
  }

  onHourAllowed(event : Event ) : void {
    const onHourCheck = event.target as HTMLInputElement;
    if(onHourCheck.checked){
      this.hourAllowed = true;
    }else{
      this.hourAllowed = false;
      this.habit.hour = '';
    }
  }

  onSubmit(habitForm : NgForm) : void {
    this.errorHour = false;
    this.errors = {}

    if(this.hourAllowed){
      if(this.habit.hour == undefined || this.habit.hour == ''){
        this.errorHour = true;
        return;
      }

      const date = new Date(this.habit.hour);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      this.habit.hour = `${hours}:${minutes}`;
    }

    if(this.habit.id != null){
      this.store.dispatch(edit({habitUpdate: this.habit}));
    }else{
      const payload = this.authService.getPayload();
      if(payload && payload.sub){
        this.habit.userId = Number(payload.sub);
        this.store.dispatch(add({habitNew: this.habit}));
      }
    } 
    this.modalService.showModal("loading");
  }

  toggleAllDays(){
    this.toggleDay(DaysOfWeek.MONDAY);
    this.toggleDay(DaysOfWeek.TUESDAY);
    this.toggleDay(DaysOfWeek.WEDNESDAY);
    this.toggleDay(DaysOfWeek.THURSDAY);
    this.toggleDay(DaysOfWeek.FRIDAY);
    this.toggleDay(DaysOfWeek.SATURDAY);
    this.toggleDay(DaysOfWeek.SUNDAY);
  }

  toggleDay(day : DaysOfWeek ){
    if(!this.habit.days){
      this.habit.days = [];
    }

    const updateDays = [... this.habit.days];
    const index = updateDays.indexOf(day);

    if(index === -1){
      updateDays.push(day);
    }else{
      updateDays.splice(index, 1);
    }

    this.habit.days = updateDays; 
  }

}
