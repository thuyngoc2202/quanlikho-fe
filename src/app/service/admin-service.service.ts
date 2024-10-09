import { Injectable } from '@angular/core';
import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { catchError, Observable, Subject, tap, throwError } from 'rxjs';
import { Product } from '../model/product.model';
import { Category } from '../model/category.model';
import { ProductCategory } from '../model/product-category.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AdminServiceService {
  private readonly API_CONFIG = {
    category: {
      unAuth: `${environment.apiBaseUrl}/un_auth/category`,
      admin: `${environment.apiBaseUrl}/admin/category`,
    },
    product: {
      unAuth: `${environment.apiBaseUrl}/un_auth/product`,
      admin: `${environment.apiBaseUrl}/admin/product`,
    },
    productCategory: {
      unAuth: `${environment.apiBaseUrl}/un_auth/product_category`,
      admin: `${environment.apiBaseUrl}/admin/product_category`,
    },
    order: {
      unAuth: `${environment.apiBaseUrl}/un_auth/product_order`,
      admin: `${environment.apiBaseUrl}/admin/product_order`,
    },
    orderStatus: `${environment.apiBaseUrl}/un_auth/product_order_status`,
    report: `${environment.apiBaseUrl}/un_auth/report`,
  };

  private httpClient: HttpClient;
  token = this.authService.getToken();

  constructor(private backend: HttpBackend, private authService: AuthService, private router: Router) {
    this.httpClient = new HttpClient(backend);
    this.token = this.authService.getToken();
  }

  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });


  private dataChangedSubject = new Subject<void>();

  dataChanged$ = this.dataChangedSubject.asObservable();

  notifyDataChanged() {
    this.dataChangedSubject.next();
  }

  getProduct(): Observable<Product[]> {
    return this.httpClient.get<Product[]>(`${this.API_CONFIG.product.unAuth}/product_list`);
  }

  createProduct(product: Product): Observable<Product> {


    return this.httpClient.post<Product>(`${this.API_CONFIG.product.unAuth}/create`, product, { headers: this.headers });
  }

  updateProduct(product: Product): Observable<Product> {
    return this.httpClient.post<Product>(`${this.API_CONFIG.product.unAuth}/product_update`, product, { headers: this.headers })

  }

  deleteProduct(id: string | undefined): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_CONFIG.product.unAuth}/delete/${id}`, { headers: this.headers })
  }

  createCategory(category: Category): Observable<Category> {
    return this.httpClient.post<Category>(`${this.API_CONFIG.category.unAuth}/category_create`, category, { headers: this.headers })
      .pipe(
        tap(() => this.notifyDataChanged())
      );
  }

  updateCategory(category: Category): Observable<Category> {
    return this.httpClient.post<Category>(`${this.API_CONFIG.category.unAuth}/category_update`, category, { headers: this.headers })
      .pipe(
        tap(() => this.notifyDataChanged())
      );
  }

  deleteCategory(id: string): Observable<any> {
    return this.httpClient.delete(`${this.API_CONFIG.category.unAuth}/delete/${id}`, {  headers: this.headers })
      .pipe(
        tap(() => this.notifyDataChanged())
      );
  }

  getCategory(): Observable<Category[]> {
    return this.httpClient.get<Category[]>(`${this.API_CONFIG.category.unAuth}/all`);
  }

  getProductCategory(): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.API_CONFIG.productCategory.unAuth}/all`);
  }

  createProductCategory(productCategory: ProductCategory): Observable<ProductCategory> {
    return this.httpClient.post<ProductCategory>(`${this.API_CONFIG.productCategory.unAuth}/create`, productCategory, { headers: this.headers })
      .pipe(
        tap(() => this.notifyDataChanged())
      );
  }

  updateProductCategory(productCategory: ProductCategory): Observable<ProductCategory> {
    return this.httpClient.post<ProductCategory>(`${this.API_CONFIG.productCategory.unAuth}/update`, productCategory, { headers: this.headers })
      .pipe(
        tap(() => this.notifyDataChanged())
      );
  }

  deleteProductCategory(id: string): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.httpClient.delete<void>(`${this.API_CONFIG.productCategory.unAuth}/delete/${id}`, {  headers: this.headers })
  }

  deleteProductCategoryByCategoryId(categoryId: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.API_CONFIG.productCategory.unAuth}/all/delete/${categoryId}`, { headers: this.headers })
      .pipe(
        tap(() => this.notifyDataChanged())
      );
  }

  getProductCategoryByCategoryId(categoryId: string): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.API_CONFIG.productCategory.unAuth}/${categoryId}`);
  }

  importProduct(formData: FormData): Observable<any> {
    return this.httpClient.post(`${this.API_CONFIG.product.unAuth}/import`, formData);
  }
  
  importVerifyProductCategory(categoryId: string | null, formData: FormData): Observable<any> {
    return this.httpClient.post(`${this.API_CONFIG.productCategory.unAuth}/import/verify/${categoryId}`, formData)
    .pipe(
      tap(() => this.notifyDataChanged())
    );;
  }

  importProductCategory(importData: any): Observable<any> {
    return this.httpClient.post(`${this.API_CONFIG.productCategory.unAuth}/import`, importData).pipe(
      tap(() => this.notifyDataChanged())
    );;
  }

  getAllOrder(): Observable<any> {
    return this.httpClient.get<any>(`${this.API_CONFIG.order.unAuth}/product_order_list`, { headers: this.headers });
  }

  getOrderDetail(product_order_id: string): Observable<any> {
    return this.httpClient.get<any>(`${this.API_CONFIG.order.unAuth}/${product_order_id}`, { headers: this.headers });
  }

  getOrderStatus(product_order_id: string): Observable<any> {
    return this.httpClient.get<any>(`${this.API_CONFIG.orderStatus}/${product_order_id}`, { headers: this.headers });
  }

  updateOrder(order: any): Observable<any> {
    return this.httpClient.post<any>(`${this.API_CONFIG.order.unAuth}/product_order_update`, order, {  headers: this.headers });
  }

  deleteOrder(product_order_id: string): Observable<any> {
    return this.httpClient.delete<any>(`${this.API_CONFIG.order.unAuth}/delete/${product_order_id}`, { headers: this.headers });
  }

  startShipping(order: any): Observable<any> {
    return this.httpClient.post<any>(`${this.API_CONFIG.order.unAuth}/start_shipping`, order, { headers: this.headers });
  }

  getTopSellingProducts(startDate: string, endDate: string,categoryId: string): Observable<Blob> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate)
      .set('categoryId', categoryId);

    return this.httpClient.get<Blob>(`${this.API_CONFIG.report}/top-selling-products`, {
      params: params,
      responseType: 'blob' as 'json'
    });
  }

  getBuReport(startDate: string, categoryId: string): Observable<Blob> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('categoryId', categoryId);
    return this.httpClient.get<Blob>(`${this.API_CONFIG.report}/restock-product-category`, {
      params: params,
      responseType: 'blob' as 'json'
    });
  }

  // private handleError(error: HttpErrorResponse) {
  //   if (error.status === 403) {
  //     console.log('Access Forbidden. Token might be expired or invalid.');
  //     this.authService.logout();
  //     this.router.navigate(['/login']);
  //   }
  //   return throwError(() => error);
  // }
}
