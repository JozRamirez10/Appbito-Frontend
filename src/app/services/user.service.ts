import { Injectable } from '@angular/core';
import { UpdatePasswordRequest, User } from '../models/user';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private url : string = environment.apiUrl + "/api/users";

  private users : User[] = [];

  constructor(
    private http : HttpClient
  ) { }

  findAllData() : User[]{
    return this.users;
  }

  findById(id : number) : Observable<User>{
    return this.http.get<User>(`${this.url}/${id}`);
  }

  create(user : User) : Observable<User> {
    return this.http.post<User>(this.url, user);
  }

  edit(user : User) : Observable<User>{
    return this.http.put<User>(`${this.url}/${user.id}`, user);
  }

  editPassword(request : UpdatePasswordRequest, id : number) : Observable<User>{
    return this.http.put<User>(`${this.url}/password/${id}`, request);
  }

  remove(request : any, id : number) : Observable<any>{
    return this.http.delete<number>(`${this.url}/password/${id}`, {
      body: request,
      headers: new HttpHeaders({ 'Content-Type': 'application/json' }) 
    });
  }

  uploadProfileImage(formData : FormData) : Observable<any>{
    return this.http.post(`${this.url}/image`, formData);
  }

  findImage(image : string){
    return this.http.get(`${this.url}/image/${image}`, {responseType: 'blob'});
  }

}
