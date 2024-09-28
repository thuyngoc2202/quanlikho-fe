import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SelectedCategoryService {
  private selectedCategorySubject = new BehaviorSubject<any>(null);
  selectedCategory$ = this.selectedCategorySubject.asObservable().pipe(
    distinctUntilChanged((prev, curr) => prev && curr && prev.category_id === curr.category_id)
  );

  setSelectedCategory(category: any) {
    this.selectedCategorySubject.next(category);
  }

  hasSelectedCategory(): boolean {
    return this.selectedCategorySubject.getValue() !== null;
  }
}