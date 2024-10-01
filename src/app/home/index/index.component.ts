import { Component, OnInit, OnDestroy } from '@angular/core';
import { SelectedCategoryService } from 'src/app/util/categoryService';
import { Category } from 'src/app/model/category.model';
import { ProductCategory } from 'src/app/model/product-category.model';
import { UserServiceService } from 'src/app/service/user-service.service';
import { ActiveMenuService } from 'src/app/util/active-menu-service';
import { CustomCurrencyPipe } from 'src/app/pipe/custom-currency.pipe';
import { CartService } from 'src/app/util/Cart.service';
import { OrderDetails } from 'src/app/model/cart-detail.model';
import { Router } from '@angular/router';
import { retry, Subscription } from 'rxjs';
import { PriceDisplayPipe } from 'src/app/pipe/price-display-pipe.pipe';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
  providers: [CustomCurrencyPipe, PriceDisplayPipe]
})
export class IndexComponent implements OnInit, OnDestroy {

  categories: Category[] = [];
  activeCategory: any;
  productsCategories: ProductCategory[] = [];
  filteredProductsCategories: any[] = [];
  searchQuery: string = '';
  activeMenu: string = '';
  idCategory: string = '';
  quantity: number = 1;
  cartCount: number = 0;
  productQuantities: { [key: string]: number } = {};
  showPopup: boolean = false;
  selectedProduct: any = {};
  private categorySubscription!: Subscription;
  private breakpointSubscription!: Subscription;
  productsPerRow: number = 8; // Default value
  showPopupCart: boolean = false;

  constructor(
    private userService: UserServiceService,
    private activeMenuService: ActiveMenuService,
    private cartService: CartService,
    private router: Router,
    private sltCategory: SelectedCategoryService,
    private breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    this.updateCartCount();
    if (this.idCategory) {
      this.loadProductCategoryByCategoryId(this.idCategory);
    }
    this.getCategory();
    this.getTotalQuantity();
    this.categorySubscription = this.activeMenuService.selectedCategoryId$.subscribe(
      categoryId => {
        this.loadProductCategoryByCategoryId(categoryId);
      }
    );
    this.categorySubscription = this.sltCategory.selectedCategory$.subscribe(category => {
      if (category) {
        this.setActiveCategory(category);
      }
    });
    this.breakpointSubscription = this.breakpointObserver
      .observe([
        Breakpoints.XSmall,
        Breakpoints.Small,
        Breakpoints.Medium,
        Breakpoints.Large,
        Breakpoints.XLarge
      ])
      .subscribe(result => {
        if (result.breakpoints[Breakpoints.XSmall]) {
          this.productsPerRow = 2;
        } else if (result.breakpoints[Breakpoints.Small]) {
          this.productsPerRow = 4;
        } else if (result.breakpoints[Breakpoints.Medium]) {
          this.productsPerRow = 6;
        } else if (result.breakpoints[Breakpoints.Large]) {
          this.productsPerRow = 8;
        } else if (result.breakpoints[Breakpoints.XLarge]) {
          this.productsPerRow = 10;
        }
      });
  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
    if (this.breakpointSubscription) {
      this.breakpointSubscription.unsubscribe();
    }
  }

  updateCartCount(): void {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartCount = cart.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
    this.cartService.updateCartCount(this.cartCount);
  }

  decreaseQuantity(product: any) {
    if (!this.productQuantities[product.product_category_id]) {
      this.productQuantities[product.product_category_id] = 1;
    }
    if (this.productQuantities[product.product_category_id] > 1) {
      this.productQuantities[product.product_category_id]--;
    }
  }

  increaseQuantity(product: any) {
    if (!this.productQuantities[product.product_category_id]) {
      this.productQuantities[product.product_category_id] = 1;
    }
    this.productQuantities[product.product_category_id]++;
  }

  handleInputChange(event: Event, item: any): void {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/[^0-9]/g, '');

    if (input.value === '') {
      input.value = '1';
    }

    this.handleQuantityChange(item, input.value);
  }

  handleQuantityChange(item: any, value: string): void {
    let newQuantity = parseInt(value, 10);

    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
    }

    this.productQuantities[item.product_category_id] = newQuantity;
    // item.quantity = newQuantity;

    this.onQuantityChange(item);
  }

  onQuantityChange(product: any): void {
    if (this.productQuantities[product.product_category_id] === null ||
      this.productQuantities[product.product_category_id] === undefined) {
      this.productQuantities[product.product_category_id] = 0;
    } else if (this.productQuantities[product.product_category_id] < 0) {
      this.productQuantities[product.product_category_id] = 0;
    }
  }

  addToCart(product: any): void {
    let orderCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const quantity = this.productQuantities[product.product_category_id] || 1;

    // Sử dụng inventory_quantity thay vì quantity
    if (quantity > product.inventory_quantity) {
      alert(`Số lượng yêu cầu (${quantity}) vượt quá số lượng tồn kho (${product.inventory_quantity}).`);
      return;
    }
    const orderProduct = orderCart.find((item: any) => item.product_category_id === product.product_category_id);
    if (orderProduct) {
      // Kiểm tra tổng số lượng trong giỏ hàng và số lượng mới không vượt quá tồn kho
      if (orderProduct.quantity + quantity > product.inventory_quantity) {
        alert(`Tổng số lượng (${orderProduct.quantity + quantity}) vượt quá số lượng tồn kho (${product.inventory_quantity}).`);
        return;
      }
      orderProduct.quantity += quantity;
    } else {
      const orderDetail = new OrderDetails();
      orderDetail.product_category_id = product.product_category_id;
      orderDetail.product_name = product.product_name;
      orderDetail.quantity = quantity;
      orderDetail.price = product.price;
      orderDetail.category_id = product.category_id;
      orderDetail.category_name = product.category_name;
      orderCart.push(orderDetail);
    }

    this.getTotalQuantity();
    localStorage.setItem('cart', JSON.stringify(orderCart));
    this.updateCartCount();

    // Reset quantity after adding to cart
    this.productQuantities[product.product_category_id] = 0;

    // Hiển thị popup
    this.selectedProduct = { ...product }; // Tạo bản sao của sản phẩm
    this.selectedProduct.quantity = quantity; // Số lượng đã thêm vào giỏ hàng
    this.showPopup = true;
    this.showPopupCart = false;
    this.cartService.updateCart();
  }

  getQuantity(product: any): number {
    return 1;
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

      if ((this.router.url === '/home' || this.router.url === '/') && !this.sltCategory.hasSelectedCategory() && this.categories.length > 0) {
        this.selectCategory(this.categories[0]);
      }
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

  loadProductCategoryByCategoryId(categoryId: string | null) {
      if (categoryId) {

      this.userService.getProductCategoryByCategoryId(categoryId).subscribe({
        next: (response: any) => {
          this.productsCategories = response.result_data.map((product: any) => ({
            ...product,
            inventory_quantity: product.quantity // Lưu số lượng tồn kho
          }));
          this.filteredProductsCategories = this.productsCategories;
        },
        error: (error) => {
          console.error('Failed to load products', error);
        }
      });
    } else {
      return;
    }
  }

  setActiveMenu(menuItem: string) {
    this.activeMenu = menuItem;
  }
  setActiveCategory(category: any): void {
    this.activeCategory = category;
    this.activeMenu = category.category_name;
    this.idCategory = category.category_id;
    this.loadProductCategoryByCategoryId(this.idCategory);
  }

  selectCategory(category: any) {
    if (this.activeCategory?.category_id !== category.category_id) {
      this.sltCategory.setSelectedCategory(category);
    }
  }

  goToCart() {
    this.showPopup = false;
    this.router.navigate(['/cart']);
  }

  continueShopping() {
    this.showPopup = false;
    this.router.navigate(['/checkout']);
  }

  getTotalQuantity() {
    let countItem;
    this.cartService.cartCount$.subscribe(count => {
      countItem = count;
    });
    return countItem;
  }

  closePopup(event: MouseEvent) {
    // Đóng popup
    this.showPopup = false;
  }

  closePopupCart(event: MouseEvent) {
    // Đóng popup
    this.showPopupCart = false;
    this.selectedProduct = null;
  }

  buyNow(product: any) {
    let orderCart = JSON.parse(localStorage.getItem('cart') || '[]');
    const quantity = this.productQuantities[product.product_category_id] || 1;

    if (quantity > product.inventory_quantity) {
      alert(`Số lượng yêu cầu (${quantity}) vượt quá số lượng tồn kho (${product.inventory_quantity}).`);
      return;
    }

    const orderProduct = orderCart.find((item: any) => item.product_category_id === product.product_category_id);
    if (orderProduct) {
      if (orderProduct.quantity + quantity > product.inventory_quantity) {
        alert(`Tổng số lượng (${orderProduct.quantity + quantity}) vượt quá số lượng tồn kho (${product.inventory_quantity}).`);
        return;
      }
      orderProduct.quantity += quantity;
    } else {
      const orderDetail = new OrderDetails();
      orderDetail.product_category_id = product.product_category_id;
      orderDetail.product_name = product.product_name;
      orderDetail.quantity = quantity;
      orderDetail.price = product.price;
      orderDetail.category_id = product.category_id;
      orderDetail.category_name = product.category_name;
      orderCart.push(orderDetail);
    }
    localStorage.setItem('cart', JSON.stringify(orderCart));
    // Navigate to checkout
    this.router.navigate(['/checkout']);
  }

  openPopupCart(product: ProductCategory | null) {
    this.showPopupCart = true;
    if (product) {
      this.selectedProduct = product;
      this.getQuantity(product);
      console.log('this.selectedProduct', this.selectedProduct);
      
    }
  }

  getProductRows(): (ProductCategory | null)[][] {
    const rows: (ProductCategory | null)[][] = [];
    
    for (let i = 0; i < this.filteredProductsCategories.length; i += this.productsPerRow) {
      const row = this.filteredProductsCategories.slice(i, i + this.productsPerRow);
      // Pad the row with null values if it's not full
      while (row.length < this.productsPerRow) {
        row.push(null);
      }
      rows.push(row);
    }
    
    return rows;
  }
}