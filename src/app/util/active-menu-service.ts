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
  private selectedCategoryNameSource = new BehaviorSubject<string | null>(null);
  selectedCategoryId$ = this.selectedCategoryIdSource.asObservable();
  selectedCategoryName$ = this.selectedCategoryNameSource.asObservable();

  setSelectedCategoryId(categoryId: string) {
    this.selectedCategoryIdSource.next(categoryId);
  }

  setSelectedCategoryName(categoryName: string) {
    this.selectedCategoryNameSource.next(categoryName);
  }

  clearSelectedCategory() {
    this.selectedCategoryIdSource.next(null);
    this.selectedCategoryNameSource.next(null);
  }
}