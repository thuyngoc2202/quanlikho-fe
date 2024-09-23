import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './home/index/index.component';
import { ProductComponent } from './admin/product/product/product.component';
import { CategoryComponent } from './admin/category/category/category.component';
import { LoginComponent } from './login/login/login.component';
import { RegisterComponent } from './register/register/register.component';
import { ProductCategoryComponent } from './admin/product-category/product-category/product-category.component';
import { PlaceOrderComponent } from './order/place-order/place-order.component';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'home', component: IndexComponent },
  { path: 'admin', component: ProductComponent },
  { path: 'admin/products', component: ProductComponent },
  { path: 'admin/categories', component: CategoryComponent },
  { path: 'admin/product-category', component: ProductCategoryComponent },
  { path: 'admin/product-category/:id', component: ProductCategoryComponent },
  { path: 'cart', component: PlaceOrderComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
