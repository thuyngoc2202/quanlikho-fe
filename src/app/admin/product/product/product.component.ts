import { Component, OnInit } from '@angular/core';

interface Product {
  id: number;
  code: string;
  barCode: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  price: number;
  salePrice: number;
  quantity: number;
  status: string;
  createdDate: string;
}

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {

  products: Product[] = [
    {
      id: 1,
      code: '123456',
      barCode: '123456',
      name: 'Product 1',
      shortDescription: 'Short Description 1',
      longDescription: 'Long Description 1',
      price: 100000,
      salePrice: 90000,
      quantity: 100,
      status: 'Ngưỡng thấp',
      createdDate: '2021-01-01',
    },
    {
      id: 2,
      code: '123456',
      barCode: '123456',
      name: 'Product 2',
      shortDescription: 'Short Description 2',
      longDescription: 'Long Description 2',
      price: 200,
      salePrice: 200,
      quantity: 200,
      status: 'Ngưỡng cao',
      createdDate: '2021-01-01',
    },

  ];

  constructor() { }

  ngOnInit(): void {
  }

  isPopupOpen = false;

  openAddProductPopup() {
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
  }

  addProduct() {
    // Logic để thêm sản phẩm vào mảng products
    // this.products.push({ ...this.newProduct });
    // this.closePopup(); // Đóng popup sau khi thêm
    // this.newProduct = { name: '', price: '' }; // Reset form
  }
}
