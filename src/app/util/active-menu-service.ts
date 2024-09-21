import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ActiveMenuService {
  private activeMenuKey = 'activeMenu';

  setActiveMenu(menuItem: string) {
    localStorage.setItem(this.activeMenuKey, menuItem);
  }

  getActiveMenu(): string {
    return localStorage.getItem(this.activeMenuKey) || '';
  }
}