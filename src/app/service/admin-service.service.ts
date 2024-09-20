import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../model/product.model';
import { Category } from '../model/category.model';
import { Attribute } from '../model/attribute.model';
@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  private apiUrl = 'http://localhost:8083/api/v1/un_auth/category';
  private adminApiUrl = 'http://localhost:8083/api/v1/admin/category'
  private httpClient: HttpClient;

  constructor(private backend: HttpBackend) {
    this.httpClient = new HttpClient(backend);
  }
  headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  createProduct(product: Product): Observable<Product> {
    return this.httpClient.post<Product>(`${this.apiUrl}/product`, product ,{ headers: this.headers });
  }

  updateProduct(product: Product): Observable<Product> {
    return this.httpClient.put<Product>(`${this.apiUrl}/product/product_update`, product , { headers: this.headers });
  }

  deleteProduct(id: string): Observable<void> { 
    return this.httpClient.delete<void>(`${this.apiUrl}/product/delete/${id}` , { headers: this.headers });
  }

  createCategory(category: Category): Observable<Category> {
    return this.httpClient.post<Category>(`${this.apiUrl}/category_create`, category , { headers: this.headers });
  }

  updateCategory(category: Category): Observable<Category> {
    return this.httpClient.post<Category>(`${this.apiUrl}/category_update`, category , { headers: this.headers });
  }

  deleteCategory(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.adminApiUrl}/delete/${id}` , { headers: this.headers });
  }
  
  getCategory(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(`${this.apiUrl}/all`);
  }

  createAttribute(attribute: Attribute): Observable<Attribute> {
    return this.httpClient.post<Attribute>(`${this.apiUrl}/attribute`, attribute, { headers: this.headers });
  }

  updateAttribute(attribute: Attribute): Observable<Attribute> {
    return this.httpClient.put<Attribute>(`${this.apiUrl}/attribute/attribute_update`, attribute, { headers: this.headers });
  }

  deleteAttribute(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/attribute/delete/${id}`, { headers: this.headers });
  }

  
  
  
}
