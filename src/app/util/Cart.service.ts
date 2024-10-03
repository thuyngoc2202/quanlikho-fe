import { EventEmitter, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartCountSource = new BehaviorSubject<number>(0);
  cartCount$ = this.cartCountSource.asObservable();

  updateCartCount(count: number) {
    this.cartCountSource.next(count);
  }
  
  cartUpdated = new EventEmitter<void>();

  constructor() {}

  updateCart() {
    this.cartUpdated.emit();
  }
}