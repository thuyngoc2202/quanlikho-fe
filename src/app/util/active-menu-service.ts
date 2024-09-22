import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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
  
  private selectedCategoryIdSource = new BehaviorSubject<string | null>(null);
  selectedCategoryId$ = this.selectedCategoryIdSource.asObservable();

  setSelectedCategoryId(categoryId: string) {
    this.selectedCategoryIdSource.next(categoryId);
  }

  clearSelectedCategory() {
    this.selectedCategoryIdSource.next(null);
  }
}