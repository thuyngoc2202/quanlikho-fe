import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../model/user.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoginServiceService {
  private readonly API_CONFIG = {
    auth: {
      unAuth: `${environment.apiBaseUrl}/un_auth`,
    }
  };

  private httpClient: HttpClient;
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private backend: HttpBackend, private authService: AuthService) {
    this.httpClient = new HttpClient(backend);
  }

  register(user: User): Observable<any> {
    return this.httpClient.post(`${this.API_CONFIG.auth.unAuth}/signup/user`, user, { headers: this.headers });
  }

  login(user: User): Observable<any> {
    return this.httpClient.post(`${this.API_CONFIG.auth.unAuth}/signin`, user, { headers: this.headers })
      .pipe(
        tap((response: any) => {          
          if (response && response.result_data) {
            sessionStorage.setItem('token', response.result_data.token);
            const encodedRole = this.authService.encodeRole(response.result_data.roleId);
            sessionStorage.setItem('encodedRole', encodedRole);
          }
        })
      );
  }
}
