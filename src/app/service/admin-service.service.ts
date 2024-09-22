import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../model/product.model';
import { Category } from '../model/category.model';
import { Attribute } from '../model/attribute.model';
import { map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  private apiUrl = 'http://localhost:8083/api/v1/un_auth/category';
  private adminApiUrl = 'http://localhost:8083/api/v1/admin/category';
  private productApiUrl = 'http://localhost:8083/api/v1/un_auth/product';
  private httpClient: HttpClient;

  constructor(private backend: HttpBackend) {
    this.httpClient = new HttpClient(backend);
  }
  headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  getProduct(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.productApiUrl}/product_list`);
  } 

  createProduct(product: Product): Observable<Product> {
    return this.httpClient.post<Product>(`${this.apiUrl}/product`, product, { headers: this.headers });
  }

  updateProduct(product: Product): Observable<Product> {
    return this.httpClient.put<Product>(`${this.apiUrl}/product/product_update`, product, { headers: this.headers });
  }

  deleteProduct(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/product/delete/${id}`, { headers: this.headers });
  }

  createCategory(category: Category): Observable<Category> {
    return this.httpClient.post<Category>(`${this.apiUrl}/category_create`, category, { headers: this.headers });
  }

  updateCategory(category: Category): Observable<Category> {
    return this.httpClient.post<Category>(`${this.apiUrl}/category_update`, category, { headers: this.headers });
  }

  deleteCategory(id: string): Observable<any> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.httpClient.delete(`${this.adminApiUrl}/delete/${id}`, { headers }).pipe(
      tap(response => console.log('Delete response:', response)));
  }

  getCategory(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(`${this.apiUrl}/all`);
  }

  importProduct(formData: FormData): Observable<any> {
    console.log('formData', formData);

    return this.httpClient.post(`${this.productApiUrl}/import`, formData)
  }




}
