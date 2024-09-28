import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActiveCategoryService {
  private selectedCategoryIdSubject = new BehaviorSubject<string | null>(this.getStoredCategoryId());
  selectedCategoryId$ = this.selectedCategoryIdSubject.asObservable();

  private selectedCategoryNameSubject = new BehaviorSubject<string | null>(this.getStoredCategoryName());
  selectedCategoryName$ = this.selectedCategoryNameSubject.asObservable();

  constructor() {}

  setSelectedCategory(categoryId: string, categoryName: string) {
    localStorage.setItem('selectedCategoryId', categoryId);
    localStorage.setItem('selectedCategoryName', categoryName);
    this.selectedCategoryIdSubject.next(categoryId);
    this.selectedCategoryNameSubject.next(categoryName);
  }

  getStoredCategoryId(): string | null {
    return localStorage.getItem('selectedCategoryId');
  }

  getStoredCategoryName(): string | null {
    return localStorage.getItem('selectedCategoryName');
  }

  getStoredCategoryNameIdMenu(): string | null {
    return `category-${this.getStoredCategoryId()}`;
  }

  clearSelectedCategory() {
    localStorage.removeItem('selectedCategoryId');
    localStorage.removeItem('selectedCategoryName');
    this.selectedCategoryIdSubject.next(null);
    this.selectedCategoryNameSubject.next(null);
  }
  
  private activeMenuKey = 'activeMenu';

  setActiveMenu(menuItem: string) {
    localStorage.setItem(this.activeMenuKey, menuItem);
  }

  getActiveMenu(): string {
    return localStorage.getItem(this.activeMenuKey) || '';
  }
}