import { Component, OnInit } from '@angular/core';
import { Category } from 'src/app/model/category.model';
import { ProductCategory } from 'src/app/model/product-category.model';
import { UserServiceService } from 'src/app/service/user-service.service';
import { ActiveMenuService } from 'src/app/util/active-menu-service';
import { CustomCurrencyPipe } from 'src/app/pipe/custom-currency.pipe';
import { CartService } from 'src/app/util/Cart.service';
import { OrderDetails } from 'src/app/model/cart-detail.model';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
  providers: [CustomCurrencyPipe]
})
export class IndexComponent implements OnInit {

  categories: Category[] = [];
  productsCategories: ProductCategory[] = [];
  filteredProductsCategories: any[] = [];
  searchQuery: string = '';
  activeMenu: string = '';
  idCategory: string = '';
  cartCount: number = 0;

  constructor(
    private userService: UserServiceService,
    private activeMenuService: ActiveMenuService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.updateCartCount();
    this.getProductCategory();
    if (this.idCategory) {
      this.getProductCategoryByCategoryId(this.idCategory);
    } else {
      this.getProductCategory();
    }
    this.getCategory();
  }

  updateCartCount(): void {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartCount = cart.length;
    this.cartService.updateCartCount(this.cartCount);
  }

  addToCart(product: any): void {
    let orderCart = JSON.parse(localStorage.getItem('cart') || '[]');

    const orderProduct = orderCart.find((item: any) => item.product_id == product.product_id);
    if (orderProduct) {
      orderProduct.quantity += 1;
    } else {
      const orderDetail = new OrderDetails();
      orderDetail.product_id = product.product_id;
      orderDetail.product_name = product.product_name;
      orderDetail.quantity = 1;
      orderDetail.price = product.price;
      orderCart.push(orderDetail)
    }

    localStorage.setItem('cart', JSON.stringify(orderCart));
    this.updateCartCount();
  }


  getProductCategory() {
    this.userService.getProductCategory().subscribe((data: any) => {
      this.productsCategories = data.result_data;
      this.filteredProductsCategories = this.productsCategories
    });
  }

  getCategory() {
    this.userService.getCategory().subscribe((data: any) => {
      this.categories = data.result_data;
    });
  }

  searchProductCategories() {
    if (!this.searchQuery) {
      this.filteredProductsCategories = this.productsCategories;
    } else {
      this.filteredProductsCategories = this.productsCategories.filter(productCategory =>
        productCategory.product_name.toLowerCase().includes(this.searchQuery.toLowerCase())
      );
    }
  }

  getProductCategoryByCategoryId(categoryId: string) {
    this.userService.getProductCategoryByCategoryId(categoryId).subscribe({
      next: (response: any) => {
        console.log('Product loaded successfully', response.result_data);
        this.productsCategories = response.result_data;
        this.filteredProductsCategories = this.productsCategories;
      },
      error: (error) => {
        console.error('Failed to load products', error);
      }
    });
  }

  setActiveMenu(menuItem: string) {
    this.activeMenu = menuItem;
  }

  selectCategory(category: any) {
    this.idCategory = category.category_id;
    this.getProductCategoryByCategoryId(this.idCategory);
  }
}
