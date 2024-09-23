import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/util/Cart.service';

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
  constructor(private cartService: CartService) { }

  ngOnInit(): void {
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });

    this.getProductCart();
  }

  getProductCart() {
    this.productCart = JSON.parse(localStorage.getItem('cart') || '[]');
  }

  decreaseQuantity(item: any) {
    if (item.quantity > 1) {
      item.quantity--;
      this.updateLocalStorage();
    }
  }

  increaseQuantity(item: any) {
    item.quantity++;
    this.updateLocalStorage();
  }

  removeItem(item: any) {
    const index = this.productCart.indexOf(item);
    if (index > -1) {
      this.productCart.splice(index, 1);
    }
    this.updateLocalStorage();
  }

  updateLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(this.productCart));
  }

  getTotal() {
    var total = 0;
    for (var i = 0; i < this.productCart.length; i++) {
      var item = this.productCart[i];
      console.log(item);

      total += item.price * item.quantity;
    }
    return total;
  }

  isModalOpen = false;
  orderInfo = {
    name: '',
    address: '',
    email: '',
    phone: ''
  };

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  submitOrder() {
    // Handle order submission logic here
    console.log('Order Info:', this.orderInfo);
    this.closeModal();
  }

}
