import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './home/index/index.component';
import { ProductComponent } from './admin/product/product/product.component';
import { CategoryComponent } from './admin/category/category/category.component';
import { LoginComponent } from './login/login/login.component';
import { RegisterComponent } from './register/register/register.component';
import { ProductCategoryComponent } from './admin/product-category/product-category/product-category.component';
import { PlaceOrderComponent } from './order/place-order/place-order.component';
import { CheckoutComponent } from './checkout/checkout/checkout.component';
import { AuthGuard } from './auth/AuthGuard';
import { UnthorizedComponent } from './unauthorized/unthorized/unthorized.component';
import { OrderManagementComponent } from './admin/order/order-management/order-management.component';
import { ReportComponent } from './admin/report/report/report.component';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'login', component: LoginComponent },
  { path: 'home', component: IndexComponent },
  { path: 'admin', component: ProductComponent, canActivate: [AuthGuard] },
  { path: 'admin/products', component: ProductComponent, canActivate: [AuthGuard] },
  { path: 'admin/categories', component: CategoryComponent, canActivate: [AuthGuard] },
  { path: 'admin/product-category', component: ProductCategoryComponent, canActivate: [AuthGuard] },
  { path: 'admin/product-category/:id', component: ProductCategoryComponent, canActivate: [AuthGuard] },
  { path: 'admin/order-management', component: OrderManagementComponent, canActivate: [AuthGuard] },
  { path: 'admin/report', component: ReportComponent, canActivate: [AuthGuard] },
  { path: 'cart', component: PlaceOrderComponent },
  { path: 'checkout', component: CheckoutComponent },
  { path: 'unauthorized', component: UnthorizedComponent },
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
