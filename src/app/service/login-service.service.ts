import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../model/user.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {
  private apiUrl = 'http://localhost:8083/api/v1/un_auth';
  private httpClient: HttpClient;
  headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });
  constructor(private backend: HttpBackend) {
    this.httpClient = new HttpClient(backend);
  }

  register(user: User) {
    return this.httpClient.post(`${this.apiUrl}/signup/user`, user, { headers: this.headers });
  }

  login(user: User) {
    return this.httpClient.post(`${this.apiUrl}/signin`, user, { headers: this.headers })
      .pipe(
        tap((response: any) => {
          console.log('respónse', response);
          
          if (response) {
            localStorage.setItem('token', response.result_data.token);
            localStorage.setItem('role', response.result_data.roleId); // 
          }
        })
      );
  }
}
