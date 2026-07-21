import { Injectable } from '@angular/core';
import { Habit } from '../models/habit';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HabitService {

  private url : string = environment.apiUrl + "/api/habits";

  constructor(
    private http : HttpClient
  ) { }

  findAll() : Observable<Habit[]>{
    return this.http.get<Habit[]>(this.url)
  }

  findByUserId(id : number) : Observable<Habit[]>{
    return this.http.get<Habit[]>(`${this.url}/user/${id}`)
  }

  findById(id : number) : Observable<Habit>{
    return this.http.get<Habit>(`${this.url}/${id}`)
  }

  create(habit : Habit) : Observable<Habit>{
    return this.http.post<Habit>(this.url, habit)
  }

  update(habit : Habit) : Observable<Habit>{
    return this.http.put<Habit>(`${this.url}/${habit.id}`, habit)
  }

  updateBatch(habits : Habit[]) : Observable<Habit[]>{
    return this.http.put<Habit[]>(`${this.url}/batch`, habits)
  }

  delete(id : number) : Observable<number>{
    return this.http.delete<number>(`${this.url}/${id}`)
    .pipe(
      map( () => id)
    );
  }
}
