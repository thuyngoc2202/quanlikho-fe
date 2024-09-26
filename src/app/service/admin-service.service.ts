import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Product } from '../model/product.model';
import { Category } from '../model/category.model';
import { map, tap } from 'rxjs/operators';
import { ProductCategory } from '../model/product-category.model';
import { AuthService } from '../auth/auth.service';

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
  private orderApiUrl = 'http://localhost:8083/api/v1/un_auth/product_order';
  private adminOrderApiUrl = 'http://localhost:8083/api/v1/admin/product_order';
  private orderDetailApiUrl = 'http://localhost:8083/api/v1/un_auth/product_order_detail';
  private orderDetailStatus ='http://localhost:8083/api/v1/un_auth/product_order_status';
  private reportApiUrl = 'http://localhost:8083/api/v1/un_auth/report';

  private httpClient: HttpClient;
  token = this.authService.getToken();
  constructor(private backend: HttpBackend, private authService: AuthService) {
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

  getAllOrder(): Observable<any> {
    return this.httpClient.get<any>(`${this.orderApiUrl}/product_order_list`, { headers: this.headers });
  }

  getOrderDetail(product_order_id: string): Observable<any> {
    return this.httpClient.get<any>(`${this.orderApiUrl}/${product_order_id}`, { headers: this.headers });
  }

  getOrderStatus(product_order_id: string): Observable<any> {
    return this.httpClient.get<any>(`${this.orderDetailStatus}/${product_order_id}`, { headers: this.headers });
  }

  updateOrder(order: any): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);

    return this.httpClient.post<any>(`${this.adminOrderApiUrl}/product_order_update`, order, { headers });
  }

  deleteOrder(product_order_id: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.httpClient.delete<any>(`${this.adminOrderApiUrl}/delete/${product_order_id}`, { headers });
  }



  getTopSellingProducts(startDate: string, endDate: string): Observable<Blob> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.httpClient.get<Blob>(`${this.reportApiUrl}/top-selling-products`, {
      params: params,
      responseType: 'blob' as 'json'
    });
  }
}
