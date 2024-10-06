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
      quantities[item.product_category_id] = item.quantity;
      return quantities;
    }, {});
  }

  getProductCart() {
    this.productCart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.orderNotes = localStorage.getItem('orderNotes') || '';
  }

  decreaseQuantity(product: any) {
    if (!this.productQuantities[product.product_category_id]) {
      this.productQuantities[product.product_category_id] = 0;
      return; // Không thể giảm nếu số lượng đã là 0
    }
    
    // Chuyển đổi tất cả các giá trị sang số
    let currentQuantity = Number(this.productQuantities[product.product_category_id]);
    const minQuantity = Number(product.min_quantity) || 1;
    
    // Tính toán số lượng mới
    let newQuantity = currentQuantity - minQuantity;
    
    // Đảm bảo số lượng mới là bội số của min_quantity và không âm
    newQuantity = Math.max(0, Math.floor(newQuantity / minQuantity) * minQuantity);
    
    // Cập nhật số lượng mới
    this.productQuantities[product.product_category_id] = newQuantity;
  
    this.updateLocalStorage();
    this.updateCartCount();
    this.getTotalQuantity();
  
  }
  
  increaseQuantity(product: any) {
    if (!this.productQuantities[product.product_category_id]) {
      this.productQuantities[product.product_category_id] = 0;
    }
    

    const currentQuantity = Number(this.productQuantities[product.product_category_id]);
    const stock = Number(product.stock) || 0;
    const minQuantity = Number(product.min_quantity) || 1;
    

    let newQuantity = currentQuantity + minQuantity;
 
    newQuantity = Math.floor(newQuantity / minQuantity) * minQuantity;
    

    if (newQuantity <= stock) {
      this.productQuantities[product.product_category_id] = newQuantity;
    } else {
     
      this.productQuantities[product.product_category_id] = Math.floor(stock / minQuantity) * minQuantity;
    }
  
    this.updateLocalStorage();
    this.updateCartCount();
    this.getTotalQuantity();
  
  }

  removeItem(item: any) {
    const index = this.productCart.indexOf(item);
    if (index > -1) {
      this.productCart.splice(index, 1);
    }
    this.updateLocalStorage();
    this.updateCartCount();
    this.getTotalQuantity();
  }

  getQuantity(product: any): number {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem = cart.find((item: any) => item.product_category_id === product.product_category_id);
    return cartItem ? cartItem.quantity : 0;
  }

  handleInputChange(event: Event, item: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');
    
    if (input.value === '') {
      input.value = '1';
    }
    
    this.handleQuantityChange(item, input.value);
  }

  handleQuantityChange(item: any, value: string): void {
    let newQuantity = parseInt(value, 10);

    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }

    this.productQuantities[item.product_category_id] = newQuantity;
    item.quantity = newQuantity;

    this.onQuantityChange(item);
  }

  onQuantityChange(product: any): void {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartItem = cart.find((item: any) => item.product_category_id === product.product_category_id);

    if (cartItem) {
      cartItem.quantity = product.quantity;
      this.updateLocalStorage();
      this.updateCartCount();
      this.getTotalQuantity();
    }
  }

  updateLocalStorage() {
    const cart = this.productCart.map(item => ({
      ...item,
      quantity: this.productQuantities[item.product_category_id] || item.quantity
    }));
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  updateCartCount(): void {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartCount = cart.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
    this.cartService.updateCartCount(this.cartCount);
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
