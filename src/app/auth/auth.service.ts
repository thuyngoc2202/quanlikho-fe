import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private jwtHelper: JwtHelperService) { }
  public removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('file');
    localStorage.removeItem('user');
    return localStorage.removeItem('role');
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('encodedRole');
  }

  public getToken(): string | null {
    return localStorage.getItem('token') || 'null';
  }

  public getRole() {
    const encodedRole = localStorage.getItem('encodedRole');
    return encodedRole ? this.decodeRole(encodedRole) : null;
  }

  getUserName() {
    return localStorage.getItem('username');
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  public encodeRole(role: string): string {
    return btoa(role);
  }

  private decodeRole(encodedRole: string): string {
    return atob(encodedRole);
  }



  public isAuthenticated(): boolean {
    // get the token
    const token = this.getToken();
    // return a boolean reflecting
    // whether or not the token is expired
    return !this.jwtHelper.isTokenExpired(token);
  }

  cachedRequests: Array<HttpRequest<any>> = [];
  public collectFailedRequest(request: HttpRequest<any>): void {
    this.cachedRequests.push(request);
  }
  public retryFailedRequests(): void {
    // retry the requests. this method can
    // be called after the token is refreshed
  }
}
