import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductCheckService {
  private checkProductsSource = new BehaviorSubject<boolean>(false);
  checkProducts$ = this.checkProductsSource.asObservable();

  toggleCheck() {
    this.checkProductsSource.next(!this.checkProductsSource.value);
  }
}