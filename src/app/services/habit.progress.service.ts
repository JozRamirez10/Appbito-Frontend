import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { API_ROUTES } from '../constants/constants';
import { CreateHabitProgressRequest, HabitProgress, HabitProgressMonthly, UpdateHabitProgressRequest } from '../models/dtos/habit.progress.model';

@Injectable({
  providedIn: 'root'
})
export class HabitProgressService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}${API_ROUTES.HABITS_PROGRESS}`;

  getProgressByHabitId(habitId : number) : Observable<HabitProgress[]> {
    return this.http.get<HabitProgress[]>(`${this.apiUrl}${API_ROUTES.HABIT}/${habitId}`);
  }

  getProgressById(id : number) : Observable<HabitProgress> {
    return this.http.get<HabitProgress>(`${this.apiUrl}/${id}`);
  }

  getProgressByDateRange(habitId : number, startDate : string, endDate : string)
  : Observable<HabitProgress[]> {
    return this.http.get<HabitProgress[]>(
      `${this.apiUrl}${API_ROUTES.HABIT}/${habitId}${API_ROUTES.RANGE}`, {
      params: {
        startDate,
        endDate
      }
    });
  }

  getMonthlyProgress(years : number[], habitIds: number[]) : Observable<HabitProgressMonthly[]> {
    return this.http.get<HabitProgressMonthly[]>(`${this.apiUrl}${API_ROUTES.MONTHLY}`,{
      params: {
        years,
        habitIds
      }
    });
  }

  createProgress(progress : CreateHabitProgressRequest) : Observable<HabitProgress> {
    return this.http.post<HabitProgress>(this.apiUrl, progress);
  }

  updateProgress(id : number, progress : UpdateHabitProgressRequest) : Observable<HabitProgress> {
    return this.http.put<HabitProgress>(`${this.apiUrl}/${id}`, progress);
  }

  deleteProgress(id : number) : Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getHabitStreak(habitId : number) : Observable<number> {
    return this.http.get<number>(
      `${this.apiUrl}${API_ROUTES.HABIT}/${habitId}${API_ROUTES.STREAK}`
    );
  }
}
