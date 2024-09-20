import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../model/product.model';
import { Category } from '../model/category.model';
import { Attribute } from '../model/attribute.model';
@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  private apiUrl = 'http://localhost:8080/api/v1/admin';
  constructor(private http: HttpClient) { }

  createProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.apiUrl}/product`, product);
  }

  updateProduct(product: Product): Observable<Product> {
    return this.http.put<Product>(`${this.apiUrl}/product/product_update`, product);
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/product/delete/${id}`);
  }

  createCategory(category: Category): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/category`, category);
  }

  updateCategory(category: Category): Observable<Category> {
    return this.http.put<Category>(`${this.apiUrl}/category/category_update`, category);
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/category/delete/${id}`);
  }

  createAttribute(attribute: Attribute): Observable<Attribute> {
    return this.http.post<Attribute>(`${this.apiUrl}/attribute`, attribute);
  }

  updateAttribute(attribute: Attribute): Observable<Attribute> {
    return this.http.put<Attribute>(`${this.apiUrl}/attribute/attribute_update`, attribute);
  }

  deleteAttribute(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/attribute/delete/${id}`);
  }

  
  
  
}
