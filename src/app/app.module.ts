import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation/navigation.component';
import { IndexComponent } from './home/index/index.component';
import { SidebarComponent } from './admin/sidebar/sidebar/sidebar.component';
import { ProductComponent } from './admin/product/product/product.component';
import { CategoryComponent } from './admin/category/category/category.component';
import { LoginComponent } from './login/login/login.component';
import { RegisterComponent } from './register/register/register.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginServiceService } from './service/login-service.service';
import { TokenInterceptor } from './auth/token.interceptor';
import { JWT_OPTIONS, JwtHelperService } from '@auth0/angular-jwt';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { ProductCategoryComponent } from './admin/product-category/product-category/product-category.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { CustomCurrencyPipe } from './pipe/custom-currency.pipe';
import { PlaceOrderComponent } from './order/place-order/place-order.component';
import { CheckoutComponent } from './checkout/checkout/checkout.component';
import { UnthorizedComponent } from './unauthorized/unthorized/unthorized.component';
import { OrderManagementComponent } from './admin/order/order-management/order-management.component';
import { StatusOrderPipe } from './pipe/status-order.pipe';
import { HighlightPipe } from './pipe/highlight.pipe';
import { ReportComponent } from './admin/report/report/report.component';
import { ToastrModule } from 'ngx-toastr';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCalendarBody } from '@angular/material/datepicker';
import { PriceDisplayPipe } from './pipe/price-display-pipe.pipe';
import { JwtInterceptor } from './auth/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    IndexComponent,
    SidebarComponent,
    ProductComponent,
    CategoryComponent,
    LoginComponent,
    RegisterComponent,
    ProductCategoryComponent,
    CustomCurrencyPipe,
    PlaceOrderComponent,
    CheckoutComponent,
    UnthorizedComponent,
    OrderManagementComponent,
    StatusOrderPipe,
    HighlightPipe,
    ReportComponent,
    PriceDisplayPipe
  ],
  imports: [
    RouterModule,
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgSelectModule,
    FormsModule,
    ToastrModule.forRoot(),
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true
    },
    { provide: JWT_OPTIONS, useValue: JWT_OPTIONS },
    JwtHelperService,
    LoginServiceService,
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
