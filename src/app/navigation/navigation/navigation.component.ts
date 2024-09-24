import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/util/Cart.service';
import { AuthService } from 'src/app/auth/auth.service';

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

  constructor(private router: Router, private cartService: CartService, private authService: AuthService) { }

  ngOnInit(): void {
    this.gerRouter();
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.updateAuthStatus();
    });
 
  }

  updateAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const role = this.authService.getRole();
      console.log('role', role);
      this.userName = this.authService.getUserName() || 'nam';
      this.isAdmin = role === '1';
    } else {
      this.isAdmin = false;
      this.userName = '';
      this.isLoggedIn = false;
    }
  }

  gerRouter(){
    this.getCurrentRoute = this.router.url.split('/').pop() || '';
    if (this.getCurrentRoute === 'login') {
      this.currentRoute ='ĐĂNG NHẬP';
    }
    if (this.getCurrentRoute === 'register') {
      this.currentRoute ='ĐĂNG KÍ';
    }
    if (this.getCurrentRoute === '' || this.getCurrentRoute === 'home') {
      this.currentRoute ='DANH MỤC SẢN PHẨM';
    }
    if (this.getCurrentRoute === 'cart') {
      this.currentRoute ='GIỎ HÀNG';
    }
  }

  logout() {
    this.authService.logout();
    this.updateAuthStatus();
    this.router.navigate(['/home']); 
  }
}
