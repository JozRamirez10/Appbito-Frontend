import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, Subject, takeUntil } from 'rxjs';
import { Habit } from 'src/app/models/habit';
import { selectHabitsWithProgress } from 'src/app/selectors/habit.selector';
import { AuthService } from 'src/app/services/auth.service';
import { ModalService } from 'src/app/services/modal.service';
import { findByUserIdRange } from 'src/app/store/habit/habits.action';
import { findByIdHabitAndRange } from 'src/app/store/habitProgress/habit.progress.action';
import { getTwoMonthlyRangesForToday } from 'src/app/utils/helpers';
import { DetailHabitComponent } from "../detail.habit/detail.habit.component";
import { IonContent, IonCard, IonCardHeader, IonRow, IonCol, IonIcon, IonCardContent, IonList, IonRefresherContent, IonRefresher } from "@ionic/angular/standalone";
import { addIcons } from 'ionicons';
import { addSharp, closeSharp } from 'ionicons/icons';

@Component({
  selector: 'app-list.habits',
  standalone: true,
  imports: [
    IonRefresher, IonRefresherContent, 
    IonList, IonCardContent, IonIcon, IonCol, IonRow, IonCardHeader, IonCard, IonContent, 
    RouterLink,
    DetailHabitComponent
],
  templateUrl: './list.habits.component.html',
  styleUrls: ['./list.habits.component.scss'],
})
export class ListHabitsComponent  implements OnInit {

  private destroy$ = new Subject<void>();

  habits$ ! : Observable<Habit[]>;
  habits ! : Habit[];

  loading ! : boolean;
  
  constructor(
    private store : Store<{habits: any, loading : any}>,
    private auth : AuthService,
    private modalService : ModalService
  ) {
    addIcons({
      closeSharp,
      addSharp
    });
    this.habits$ = this.store.select(selectHabitsWithProgress);
  }

  doRefresh(event : any){
    this.enterOnView().then(() => event.target.complete());;
  }

  async enterOnView(): Promise<void>{
    const ranges = getTwoMonthlyRangesForToday();

    if(this.habits.length <= 0){
      const payload = this.auth.getPayload();
      if(payload && payload.sub){
        this.modalService.showModal('loading');
        this.store.dispatch(findByUserIdRange({
          id : Number(payload.sub), 
          startDate: ranges.start, 
          endDate: ranges.end 
        }));
      }
    }else{
      this.store.dispatch(findByIdHabitAndRange({
        habits: this.habits, 
        startDate: ranges.start, 
        endDate: ranges.end
      }))
    }
  }

  ngOnInit() : void {

    this.habits$.pipe(takeUntil(this.destroy$)).subscribe(habits => {
      this.habits = habits;
    });
    this.enterOnView();
  }

}
