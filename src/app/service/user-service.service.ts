import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductCategory } from '../model/product-category.model';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Category } from '../model/category.model';
import { Order, PlaceOrderDetail } from '../model/cart-detail.model';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  private categoryApiUrl = 'http://localhost:8083/api/v1/un_auth/category';
  private productCategoryApiUrl = 'http://localhost:8083/api/v1/un_auth/product_category';
  private orderApiUrl = 'http://localhost:8083/api/v1/un_auth/product_order';
  private orderDetailApiUrl = 'http://localhost:8083/api/v1/un_auth/product_order_detail';
  private httpClient: HttpClient;

  headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private backend: HttpBackend) {
    this.httpClient = new HttpClient(backend);
   }

  getProductCategory(): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.productCategoryApiUrl}/all` , { headers: this.headers });
  }

  getCategory(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(`${this.categoryApiUrl}/all` , { headers: this.headers });
  }

  getProductCategoryByCategoryId(categoryId: string): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.productCategoryApiUrl}/${categoryId}`);
  }

  placeOrder(order: any): Observable<Order> {
    return this.httpClient.post<Order>(`${this.orderApiUrl}/create`, order, { headers: this.headers });
  }
  
  placeOrderDetail(orderDetail: any): Observable<any> {
    return this.httpClient.post(`${this.orderDetailApiUrl}/create`, orderDetail, { headers: this.headers });
  }

}
