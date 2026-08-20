import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { API_ROUTES, GENERAL } from '../constants/constants';
import { CreateUserRequest, DeleteUserRequest, UpdatePasswordRequest, UpdateUserRequest, User } from '../models/dtos/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.apiUrl}${API_ROUTES.USERS}`;

  getMe() : Observable<User> {
    return this.http.get<User>(`${this.apiUrl}${API_ROUTES.ME}`);
  }

  getMyImage() : Observable<Blob> {
    return this.http.get(`${this.apiUrl}${API_ROUTES.ME_IMAGE}`, { responseType: GENERAL.BLOB });
  }

  createUser(user : CreateUserRequest) : Observable<User> {
    return this.http.post<User>(this.apiUrl, user);
  }

  uploadProfileImage(file : File) : Observable<User> {
    const formData = new FormData();
    formData.append(GENERAL.IMAGE, file);

    return this.http.post<User>(`${this.apiUrl}${API_ROUTES.ME_IMAGE}`, formData);
  }

  updateMe(user : UpdateUserRequest) : Observable<User> {
    return this.http.put<User>(`${this.apiUrl}${API_ROUTES.ME}`, user);
  }

  updatePassword(request : UpdatePasswordRequest) : Observable<void> {
    return this.http.put<void>(`${this.apiUrl}${API_ROUTES.ME_PASSWORD}`, request);
  }

  deleteWithPassword(request : DeleteUserRequest) : Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}${API_ROUTES.ME_PASSWORD}`, {
      body: request
    });
  }
}
