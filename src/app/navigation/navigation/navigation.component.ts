import { Component, OnInit } from '@angular/core';
import {  Router } from '@angular/router';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
  currentRoute: string = '';
  getCurrentRoute: string = '';
  constructor(private router: Router) { }

  ngOnInit(): void {
    this.gerRouter();
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
  }

}
