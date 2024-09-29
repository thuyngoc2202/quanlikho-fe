import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/util/Cart.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserServiceService } from 'src/app/service/user-service.service';
import { Category } from 'src/app/model/category.model';
import { ActiveMenuService } from 'src/app/util/active-menu-service';
import { SelectedCategoryService } from 'src/app/util/categoryService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  currentRoute: string = '';
  getCurrentRoute: string = '';
  cartCount: number = 0;
  isAdmin: boolean = false;
  isLoggedIn: boolean = false;
  userName: string = '';
  categories: Category[] = [];
  cartItems: any[] = [];
  totalAmount: number = 0;
  productQuantities: { [key: string]: number } = {};
  private cartSubscription!: Subscription;

  constructor(private activeMenuService: ActiveMenuService, private router: Router, private cartService: CartService, private authService: AuthService, private userService: UserServiceService, private sltCategory: SelectedCategoryService) { }

  ngOnInit(): void {
    this.gerRouter();
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.updateAuthStatus();
    });
    
    this.getCategory();
    this.loadCartFromLocalStorage();
    this.cartSubscription = this.cartService.cartUpdated.subscribe(() => {
      this.loadCartFromLocalStorage();
    });
  }

  updateAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const role = this.authService.getRole();
      this.userName = this.authService.getUserName() || '';
      this.isAdmin = role === '1';
    } else {
      this.isAdmin = false;
      this.userName = '';
      this.isLoggedIn = false;
    }
  }

  gerRouter() {
    this.getCurrentRoute = this.router.url.split('/').pop() || '';
    if (this.getCurrentRoute === 'login') {
      this.currentRoute = 'ĐĂNG NHẬP';
    }
    if (this.getCurrentRoute === 'register') {
      this.currentRoute = 'ĐĂNG KÍ';
    }
    if (this.getCurrentRoute === '' || this.getCurrentRoute === 'home') {
      this.currentRoute = 'DANH MỤC SẢN PHẨM';
    }
    if (this.getCurrentRoute === 'cart') {
      this.currentRoute = 'GIỎ HÀNG';
    }
  }

  loadCartFromLocalStorage() {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      this.cartItems = JSON.parse(cartData);
      this.updateCartSummary();
    } else {
      this.cartItems = [];
      this.cartCount = 0;
      this.totalAmount = 0;
    }
  }

  updateCartSummary() {
    this.cartCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
    this.totalAmount = this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  removeItem(item: any) {
    const index = this.cartItems.indexOf(item);
    if (index > -1) {
      this.cartItems.splice(index, 1);
    }
    this.updateLocalStorage();
    this.updateCartCount();
  }

  updateCartCount(): void {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartCount = cart.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
    this.cartService.updateCartCount(this.cartCount);
  }

  updateLocalStorage() {
    const cart = this.cartItems.map(item => ({
      ...item,
      quantity: this.productQuantities[item.product_category_id] || item.quantity
    }));
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  logout() {
    this.authService.logout();
    this.updateAuthStatus();
    this.router.navigate(['/home']);
  }

  getCategory() {
    this.userService.getCategory().subscribe((data: any) => {
      this.categories = data.result_data;
    });
  }

  selectCategory(category: any) {
    this.sltCategory.setSelectedCategory(category);
    this.router.navigate(['/home']);
  }
}
