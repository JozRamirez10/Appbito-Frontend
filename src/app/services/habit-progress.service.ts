import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { HabitProgresMonthly, HabitProgress } from '../models/habit';
import { firstValueFrom, map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HabitProgressService {

  private url : string = environment.apiUrl + "/api/habitsProgress"

  constructor(
    private http : HttpClient
  ) { }

  findAllByIdHabit(habitId : number) : Observable<HabitProgress[]> {
    return this.http.get<HabitProgress[]>(`${this.url}/habit/${habitId}`)
    .pipe(
      map(habitProgress => this.transformHabitProgress(habitProgress) as HabitProgress[])
    );
  }

  findByIdHabitAndDateRange(habitId : number, startDate: string, endDate : string) : Observable<HabitProgress[]> {
    return this.http.get<HabitProgress[]>(`${this.url}/habit/${habitId}/range?startDate=${startDate}&endDate=${endDate}`)
    .pipe(
      map(HabitProgress => this.transformHabitProgress(HabitProgress) as HabitProgress[])
    );
  }

  getTotalDoneByYears(years : number[], habitIds : number[]) : Observable<HabitProgresMonthly[]>{
    return this.http.get<HabitProgresMonthly[]>(`${this.url}/monthly?years=${years}&habitIds=${habitIds}`);
  }

  async getStreakByIdHabit(habitId : number) : Promise<number>{
    return await firstValueFrom(this.http.get<number>(`${this.url}/habit/${habitId}/streak`));
  }

  findById(id : number) : Observable<HabitProgress> {
    return this.http.get<HabitProgress>(`${this.url}/${id}`)
    .pipe(
      map(habitProgress => this.transformHabitProgress(habitProgress) as HabitProgress)
    );
  }

  create(habitProgress : HabitProgress) : Observable<HabitProgress> {
    return this.http.post<HabitProgress>(`${this.url}`, habitProgress)
    .pipe(
      map(habitProgress => this.transformHabitProgress(habitProgress) as HabitProgress)
    );
  }

  update(habitProgress : HabitProgress) : Observable<HabitProgress> {
    return this.http.put<HabitProgress>(`${this.url}/${habitProgress.id}`, habitProgress)
    .pipe(
      map(habitProgress => this.transformHabitProgress(habitProgress) as HabitProgress)
    );
  }

  delete(id : number) : Observable<number> {
    return this.http.delete<number>(`${this.url}/${id}`)
    .pipe(
      map( () => id)
    )
  }

  private transformHabitProgress(habitProgress: HabitProgress | HabitProgress[]) : HabitProgress | HabitProgress[] {
    if(Array.isArray(habitProgress)){
      return habitProgress.map(progress => ({
        ...progress,
        date: new Date(progress.date)
      }));
    } else {
      return {
        ... habitProgress,
        date: new Date(habitProgress.date)
      }
    }
  }

}
