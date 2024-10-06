import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductCategory } from '../model/product-category.model';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Category } from '../model/category.model';
import { Order, OrderDetails, PlaceOrderDetail } from '../model/cart-detail.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  private readonly API_CONFIG = {
    category: {
      unAuth: `${environment.apiBaseUrl}/un_auth/category`,
    },
    productCategory: {
      unAuth: `${environment.apiBaseUrl}/un_auth/product_category`,
    },
    order: {
      unAuth: `${environment.apiBaseUrl}/un_auth/product_order`,
    },
    orderDetail: {
      unAuth: `${environment.apiBaseUrl}/un_auth/product_order_detail`,
    },
  };

  private httpClient: HttpClient;

  headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(private backend: HttpBackend) {
    this.httpClient = new HttpClient(backend);
  }

  getProductCategory(): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.API_CONFIG.productCategory.unAuth}/all`, { headers: this.headers });
  }

  getCategory(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(`${this.API_CONFIG.category.unAuth}/all`, { headers: this.headers });
  }

  getProductCategoryByCategoryId(categoryId: string, typeLogin: string): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.API_CONFIG.productCategory.unAuth}/${categoryId}/${typeLogin}`);
  }

  placeOrder(order: any): Observable<Order> {
    return this.httpClient.post<Order>(`${this.API_CONFIG.order.unAuth}/create`, order, { headers: this.headers });
  }
  
  placeOrderDetail(orderDetail: any): Observable<PlaceOrderDetail[]> {
    return this.httpClient.post<PlaceOrderDetail[]>(`${this.API_CONFIG.orderDetail.unAuth}/create`, orderDetail, { headers: this.headers });
  }
}
