import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { API_ROUTES } from '../constants/constants';
import { CreateHabitRequest, Habit, UpdateHabitBatchRequest, UpdateHabitRequest } from '../models/dtos/habit.model';

@Injectable({
  providedIn: 'root'
})
export class HabitService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}${API_ROUTES.HABITS}`;

  getHabitById(id : number) : Observable<Habit> {
    return this.http.get<Habit>(`${this.apiUrl}/${id}`);
  }

  getMyHabits() : Observable<Habit[]> {
    return this.http.get<Habit[]>(`${this.apiUrl}${API_ROUTES.ME}`);
  }

  getTodayHabits() : Observable<Habit[]> {
    return this.http.get<Habit[]>(`${this.apiUrl}${API_ROUTES.TODAY}`);
  }

  createHabit(habit : CreateHabitRequest) : Observable<Habit> {
    return this.http.post<Habit>(this.apiUrl, habit);
  }

  updateHabit(id : number, habit : UpdateHabitRequest) : Observable<Habit> {
    return this.http.put<Habit>(`${this.apiUrl}/${id}`, habit);
  }

  updateHabitBatch(habits : UpdateHabitBatchRequest[]) : Observable<Habit[]> {
    return this.http.put<Habit[]>(`${this.apiUrl}${API_ROUTES.BATCH}`, habits);
  }

  deleteHabit(id : number) : Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

}
