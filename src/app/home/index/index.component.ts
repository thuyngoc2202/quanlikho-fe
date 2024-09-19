import { Component, OnInit } from '@angular/core';

interface Product {
  id: number;
  name: string;
  price: number;
  status: string;
}

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css']
})
export class IndexComponent implements OnInit {
  
  
  products: Product[] = [
    { id: 1, name: 'IPHONE 6 PLUS', price: 600000, status: 'Còn hàng' },
    { id: 2, name: 'IPHONE 7 PLUS', price: 700000, status: 'Hết hàng' },
    { id: 3, name: 'IPHONE 8 PLUS', price: 800000, status: 'Còn hàng' },
    { id: 4, name: 'IPHONE 11 PLUS', price: 900000, status: 'Còn hàng' },
    { id: 5, name: 'IPHONE 12 PLUS', price: 1000000, status: 'Còn hàng' },
    { id: 6, name: 'IPHONE 13 PLUS', price: 1100000, status: 'Còn hàng' },
    { id: 7, name: 'IPHONE 14 PLUS', price: 1200000, status: 'Còn hàng' },
    { id: 8, name: 'IPHONE 15 PLUS', price: 1300000, status: 'Còn hàng' },
    { id: 9, name: 'IPHONE 16 PLUS', price: 1400000, status: 'Còn hàng' },
    { id: 10, name: 'IPHONE 17 PLUS', price: 1500000, status: 'Còn hàng' },
    { id: 11, name: 'XIAOMI 18 PLUS', price: 1600000, status: 'Còn hàng' },
    { id: 12, name: 'XIAOMI 19 PLUS', price: 1700000, status: 'Còn hàng' },
    { id: 13, name: 'XIAOMI 20 PLUS', price: 1800000, status: 'Còn hàng' },
    { id: 14, name: 'XIAOMI 21 PLUS', price: 1900000, status: 'Còn hàng' },
    { id: 15, name: 'XIAOMI 22 PLUS', price: 2000000, status: 'Còn hàng' },
  ];

  constructor() { }

  ngOnInit(): void {
  }

}
