import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../model/user.model';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {
  private apiUrl = 'http://localhost:8083/api/v1/un_auth';
  

  constructor(private http: HttpClient) { }

  register(user: User) {
    return this.http.post(`${this.apiUrl}/signup/user`, user);
  }
}
