import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductCategory } from '../model/product-category.model';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Category } from '../model/category.model';

@Injectable({
  providedIn: 'root'
})
export class UserServiceService {
  private categoryApiUrl = 'http://localhost:8083/api/v1/un_auth/category';
  private productCategoryApiUrl = 'http://localhost:8083/api/v1/un_auth/product_category';
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
}
