import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IndexComponent } from './home/index/index.component';
import { ProductComponent } from './admin/product/product/product.component';
import { AttributeComponent } from './admin/attributeProduct/attribute/attribute.component';
import { CategoryComponent } from './admin/category/category/category.component';
import { LoginComponent } from './login/login/login.component';
import { RegisterComponent } from './register/register/register.component';

const routes: Routes = [
  { path: '', component: IndexComponent },
  { path: 'admin/products', component: ProductComponent },
  { path: 'admin/attributes', component: AttributeComponent },
  { path: 'admin/categories', component: CategoryComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
