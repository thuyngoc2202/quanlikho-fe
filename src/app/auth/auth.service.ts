import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private jwtHelper: JwtHelperService) {}
  public removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('email');
    localStorage.removeItem('user_id');
    localStorage.removeItem('file');
    localStorage.removeItem('user');
    return localStorage.removeItem('roles');
  }
  public getToken(): string {
    return localStorage.getItem('token') || 'null';
  }

  public setToken(token: string) {
    return localStorage.setItem('token', token);
  }


  public setRoles(roles: string) {
    return localStorage.setItem('roles', roles);
  }

  public getRoles() {
    return JSON.parse(localStorage.getItem('roles') || '[]');
  }

  public setId(user_id: string) {
    return localStorage.setItem('user_id', user_id);
  }

  public getId() {
    return localStorage.getItem('user_id') || "";
  }

  public setEmail(email: string) {
    return localStorage.setItem('email', email);
  }

  public getEmail() {
    return JSON.parse(localStorage.getItem('email') || "");
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
