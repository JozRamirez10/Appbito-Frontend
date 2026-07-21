import { Component, Input, OnInit } from '@angular/core';
import { HabitProgress } from 'src/app/models/habit';
import { HabitProgressService } from 'src/app/services/habit-progress.service';
import { CalendarProgressComponent } from "../calendar.progress/calendar.progress.component";
import { IonCard, IonCardContent } from "@ionic/angular/standalone";

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
export class ProgressHabitComponent  implements OnInit {

  @Input() edit : boolean = false;
  @Input() habitId ! : number;
  @Input() habitProgress ! : HabitProgress[];

  public counterStreak ! : number;

  constructor(
    private habitProgressService : HabitProgressService    
  ){
    this.counterStreak = 0;
  } 

  async ngOnInit(): Promise<void> {
    this.counterStreak = await this.habitProgressService.getStreakByIdHabit(this.habitId);
  }

}
