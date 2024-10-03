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
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.token}`)
      .set('Content-Type', 'application/json');

    return this.httpClient.post<Product>(`${this.API_CONFIG.product.admin}/create`, product, { headers });
  }

  updateProduct(product: Product): Observable<Product> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.httpClient.post<Product>(`${this.API_CONFIG.product.admin}/product_update`, product, { headers })

  }

  deleteProduct(id: string | undefined): Observable<void> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.httpClient.delete<void>(`${this.API_CONFIG.product.admin}/delete/${id}`, { headers })
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
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.httpClient.delete(`${this.API_CONFIG.category.admin}/delete/${id}`, { headers })
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
    return this.httpClient.delete<void>(`${this.API_CONFIG.productCategory.admin}/delete/${id}`, { headers })
  }

  getProductCategoryByCategoryId(categoryId: string): Observable<ProductCategory[]> {
    return this.httpClient.get<ProductCategory[]>(`${this.API_CONFIG.productCategory.unAuth}/${categoryId}`);
  }

  importProduct(formData: FormData): Observable<any> {
    return this.httpClient.post(`${this.API_CONFIG.product.unAuth}/import`, formData);
  }

  importProductCategory(categoryId: string | null, formData: FormData): Observable<any> {
    return this.httpClient.post(`${this.API_CONFIG.productCategory.unAuth}/import/${categoryId}`, formData);
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
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.httpClient.post<any>(`${this.API_CONFIG.order.admin}/product_order_update`, order, { headers });
  }

  deleteOrder(product_order_id: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.token}`);
    return this.httpClient.delete<any>(`${this.API_CONFIG.order.admin}/delete/${product_order_id}`, { headers });
  }

  getTopSellingProducts(startDate: string, endDate: string): Observable<Blob> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);

    return this.httpClient.get<Blob>(`${this.API_CONFIG.report}/top-selling-products`, {
      params: params,
      responseType: 'blob' as 'json'
    });
  }

  getBuReport(): Observable<Blob> {
    return this.httpClient.get<Blob>(`${this.API_CONFIG.report}/restock-product-category`, {
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
