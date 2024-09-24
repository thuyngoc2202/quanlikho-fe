import { Component, OnInit } from '@angular/core';
import { UserServiceService } from 'src/app/service/user-service.service';
import { CartService } from 'src/app/util/Cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-place-order',
  templateUrl: './place-order.component.html',
  styleUrls: ['./place-order.component.css']
})
export class PlaceOrderComponent implements OnInit {

  cartCount: number = 0;
  productCart: any[] = [];
  items: any;
  totalPrice: number = 0;
  productQuantities: { [key: string]: number } = {};
  orderNotes: string = '';

  constructor(private cartService: CartService, private userService: UserServiceService, private router: Router) { }

  ngOnInit(): void {
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
    this.updateCartCount();
    this.getProductCart();
    this.initializeProductQuantities();
  }

  initializeProductQuantities() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.productQuantities = cart.reduce((quantities: { [key: string]: number }, item: any) => {
      quantities[item.product_id] = item.quantity;
      return quantities;
    }, {});
  }

  getProductCart() {
    this.productCart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.orderNotes = localStorage.getItem('orderNotes') || '';
  }

  decreaseQuantity(product: any) {
    if (!this.productQuantities[product.product_id]) {
      this.productQuantities[product.product_id] = 0;
    }
    if (this.productQuantities[product.product_id] > 0) {
      this.productQuantities[product.product_id]--;
      this.updateLocalStorage();
      this.updateCartCount();
    }
  }

  increaseQuantity(product: any) {

    this.productQuantities[product.product_id]++;
    this.updateLocalStorage();
    this.updateCartCount();
  }



  removeItem(item: any) {
    const index = this.productCart.indexOf(item);
    if (index > -1) {
      this.productCart.splice(index, 1);
    }
    this.updateLocalStorage();
    this.updateCartCount();
  }

  getQuantity(product: any): number {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem = cart.find((item: any) => item.product_id === product.product_id);
    return cartItem ? cartItem.quantity : 0;
  }

  onQuantityChange(product: any): void {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem = cart.find((item: any) => item.product_id === product.product_id);

    if (cartItem) {
      if (product.quantity === null || product.quantity === undefined || product.quantity < 0) {
        cartItem.quantity = 0;
      } else {
        cartItem.quantity = product.quantity;
      }
      this.updateLocalStorage();
      this.updateCartCount();
      localStorage.setItem('cart', JSON.stringify(cart));
    }
  }

  updateLocalStorage() {
    const cart = this.productCart.map(item => ({
      ...item,
      quantity: this.productQuantities[item.product_id] || item.quantity
    }));
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  updateCartCount(): void {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartCount = cart.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
    this.cartService.updateCartCount(this.cartCount);
  }

  getTotal() {
    var total = 0;
    for (var i = 0; i < this.productCart.length; i++) {
      var item = this.productCart[i];
      console.log(item);

      total += item.price * item.quantity;
    }
    localStorage.setItem('total', total.toString());
    return total;
  }
  getTotalQuantity(): number {
    let totalQuantity = 0;
    for (let item of this.productCart) {
      totalQuantity += item.quantity;
    }
    return totalQuantity;
  }
  updateOrderNotes(newNotes: string) {
    localStorage.setItem('orderNotes', newNotes);
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }

}
