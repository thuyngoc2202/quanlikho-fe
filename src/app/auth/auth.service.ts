import { HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable } from 'rxjs';
import { Router } from '@angular/router'; // Add this import

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedIn = new BehaviorSubject<boolean>(this.hasToken());

  constructor(
    private jwtHelper: JwtHelperService,
    private router: Router // Inject Router
  ) { }

  private hasToken(): boolean {
    return !!localStorage.getItem('token');
  }

  public removeToken() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('tokenExpiration');
    localStorage.removeItem('encodedRole');
    localStorage.removeItem('activeMenu');
    return localStorage.removeItem('role');
  }
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('encodedRole');
    this.loggedIn.next(false);
    this.router.navigate(['/login']);
  }

  public getToken(): string | null {
    const token = localStorage.getItem('token');
    const expiration = localStorage.getItem('tokenExpiration');
    
    if (token && expiration) {
      const expirationTime = parseInt(expiration, 10);
      if (new Date().getTime() > expirationTime) {
        this.removeToken();
        this.loggedIn.next(false);
        return null;
      }
    }
    
    return token || null;
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
    console.log('Failed request:', request);
  }
  public retryFailedRequests(): void {
    // retry the requests. this method can
    // be called after the token is refreshed
  }

  public login(token: string): void {
    this.setTokenWithExpiration(token);
    this.loggedIn.next(true);
  }

  public setTokenWithExpiration(token: string): void {
    localStorage.setItem('token', token);
    const expirationTime = new Date().getTime() + 24 * 60 * 60 * 1000;
    localStorage.setItem('tokenExpiration', expirationTime.toString());
    this.scheduleTokenClear(expirationTime);
  }

  private scheduleTokenClear(expirationTime: number): void {
    const timeUntilExpiration = expirationTime - new Date().getTime();
    setTimeout(() => {
      this.removeToken();
      this.loggedIn.next(false);
      console.log('Token cleared after 10 seconds (test mode)');
      this.router.navigate(['/home']); 
    }, timeUntilExpiration);
  }
}
