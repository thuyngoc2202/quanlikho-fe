import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../model/product.model';
import { Category } from '../model/category.model';
import { map, tap } from 'rxjs/operators';
import { ProductCategory } from '../model/product-category.model';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  private apiUrl = 'http://localhost:8083/api/v1/un_auth/category';
  private adminApiUrl = 'http://localhost:8083/api/v1/admin/category';
  private productApiUrl = 'http://localhost:8083/api/v1/un_auth/product';
  private adminProductApiUrl = 'http://localhost:8083/api/v1/admin/product';
  private productCategoryApiUrl = 'http://localhost:8083/api/v1/un_auth/product_category';
  private adminProductCategoryApiUrl = 'http://localhost:8083/api/v1/admin/product_category';
  private httpClient: HttpClient;
  token = localStorage.getItem('token');
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
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.token}`)
      .set('Content-Type', 'application/json');

    return this.httpClient.post<Product>(`${this.adminProductApiUrl}/create`, product, { headers });
  }

  updateProduct(product: Product): Observable<Product> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.httpClient.post<Product>(`${this.adminProductApiUrl}/product_update`, product, { headers })
  }

  deleteProduct(id: string): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.httpClient.delete<void>(`${this.adminProductApiUrl}/delete/${id}`, { headers })
  }

  createCategory(category: Category): Observable<Category> {
    return this.httpClient.post<Category>(`${this.apiUrl}/category_create`, category, { headers: this.headers });
  }

  updateCategory(category: Category): Observable<Category> {
    return this.httpClient.post<Category>(`${this.apiUrl}/category_update`, category, { headers: this.headers });
  }

  deleteCategory(id: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

    return this.httpClient.delete(`${this.adminApiUrl}/delete/${id}`, { headers })
  }

  getCategory(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(`${this.apiUrl}/all`);
  }

  getProductCategory(): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.productCategoryApiUrl}/all`);
  }

  createProductCategory(productCategory: ProductCategory): Observable<ProductCategory> {
    return this.httpClient.post<ProductCategory>(`${this.productCategoryApiUrl}/create`, productCategory, { headers: this.headers });
  }

  updateProductCategory(productCategory: ProductCategory): Observable<ProductCategory> {
    return this.httpClient.post<ProductCategory>(`${this.productCategoryApiUrl}/update`, productCategory, { headers: this.headers });
  }

  deleteProductCategory(id: string): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.httpClient.delete<void>(`${this.adminProductCategoryApiUrl}/delete/${id}`, { headers });
  }

  getProductCategoryByCategoryId(categoryId: string): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.productCategoryApiUrl}/${categoryId}`);
  }

  importProduct(formData: FormData): Observable<any> {

    return this.httpClient.post(`${this.productApiUrl}/import`, formData)
  }

  importProductCategory(categoryId: string | null, formData: FormData): Observable<any> {

    return this.httpClient.post(`${this.productCategoryApiUrl}/import/${categoryId}`, formData)
  }




}
