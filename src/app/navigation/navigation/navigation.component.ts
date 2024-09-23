import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';
import { CartService } from 'src/app/util/Cart.service';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  currentRoute: string = '';
  getCurrentRoute: string = '';
  cartCount: number = 0;
  constructor(private router: Router, private cartService: CartService) { }

  ngOnInit(): void {
    this.gerRouter();
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
    });
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

}
