import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavigationComponent } from './navigation/navigation/navigation.component';
import { IndexComponent } from './home/index/index.component';
import { SidebarComponent } from './admin/sidebar/sidebar/sidebar.component';
import { ProductComponent } from './admin/product/product/product.component';
import { AttributeComponent } from './admin/attributeProduct/attribute/attribute.component';
import { CategoryComponent } from './admin/category/category/category.component';

@NgModule({
  declarations: [
    AppComponent,
    NavigationComponent,
    IndexComponent,
    SidebarComponent,
    ProductComponent,
    AttributeComponent,
    CategoryComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
