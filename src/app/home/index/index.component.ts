import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { SelectedCategoryService } from 'src/app/util/categoryService';
import { Category } from 'src/app/model/category.model';
import { ProductCategory } from 'src/app/model/product-category.model';
import { UserServiceService } from 'src/app/service/user-service.service';
import { ActiveMenuService } from 'src/app/util/active-menu-service';
import { CustomCurrencyPipe } from 'src/app/pipe/custom-currency.pipe';
import { CartService } from 'src/app/util/Cart.service';
import { OrderDetails } from 'src/app/model/cart-detail.model';
import { Router } from '@angular/router';
import { retry, Subscription, forkJoin } from 'rxjs';
import { PriceDisplayPipe } from 'src/app/pipe/price-display-pipe.pipe';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { AuthService } from 'src/app/auth/auth.service';
import { Product } from 'src/app/model/product.model';
import { AdminServiceService } from 'src/app/service/admin-service.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-index',
  templateUrl: './index.component.html',
  styleUrls: ['./index.component.css'],
  providers: [CustomCurrencyPipe, PriceDisplayPipe]
})
export class IndexComponent implements OnInit, OnDestroy {

  categories: Category[] = [];
  products: Product[] = [];
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
  isLoggedIn: boolean = false;
  showEditPopup: boolean = false;
  editingProduct: ProductCategory = new ProductCategory();
  filteredProducts: any[] = [];
  filteredCategories: any[] = [];
  selectedCategoryUpdate: any;
  showProductDropdown = false;
  showCategoryDropdown = false;
  idProduct: string = '';
  selectedProductUpdate: any;
  editForm!: FormGroup;
  idProductCategory: string = '';
  isConfirmUpdatePopupOpen: boolean = false;
  newKeywords: string[] = [];
  formProduct!: FormGroup;
  categoryName: string = '';
  constructor(
    private userService: UserServiceService,
    private activeMenuService: ActiveMenuService,
    private cartService: CartService,
    private router: Router,
    private sltCategory: SelectedCategoryService,
    private authService: AuthService,
    private adminService: AdminServiceService,
    private fb: FormBuilder,
    private toastr: ToastrService,

  ) { }

  ngOnInit(): void {
    this.updateCartCount();
    this.loadCategory();
    this.loadProduct();
    if (this.idCategory) {
      this.loadProductCategoryByCategoryId(this.idCategory);
    }
    this.authService.isLoggedIn$.subscribe(
      (isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;
      }
    );
    this.getCategory();
    this.getTotalQuantity();
    this.categorySubscription = this.activeMenuService.selectedCategoryId$.subscribe(
      categoryId => {
        this.loadProductCategoryByCategoryId(categoryId);
      }
    );
    this.categorySubscription = this.sltCategory.selectedCategory$.subscribe(category => {
      if (category) {
        this.categoryName = category.category_name;
        this.setActiveCategory(category);
      }
    });
    this.validate();
    this.validateProduct();
  }


  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }

  }

  validate() {
    this.editForm = this.fb.group({
      product_name: ['', Validators.required],
      category_name: ['', Validators.required],
      quantity: ['', [Validators.required, Validators.min(0)]],
      min_limit: ['', [Validators.required, Validators.min(0)]],
      max_limit: ['', [Validators.required, Validators.min(0)]],
    });
  }
  validateProduct() {
    this.formProduct = this.fb.group({
      product_name: ['', Validators.required],
    });
  }

  updateCartCount(): void {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartCount = cart.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
    this.cartService.updateCartCount(this.cartCount);
  }

  decreaseQuantity(product: any) {
    if (!this.productQuantities[product.product_category_id]) {
      this.productQuantities[product.product_category_id] = 0;
    }
    if (this.productQuantities[product.product_category_id] > 1) {
      this.productQuantities[product.product_category_id] = this.productQuantities[product.product_category_id] - 50;
    }
  }

  increaseQuantity(product: any) {
    if (!this.productQuantities[product.product_category_id]) {
      this.productQuantities[product.product_category_id] = 0;
    }
    this.productQuantities[product.product_category_id] = this.productQuantities[product.product_category_id] + 50;
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
      orderDetail.category_id = product.category_id;
      orderDetail.category_name = product.category_name;
      orderDetail.stock = product.inventory_quantity;
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
    return this.productQuantities[product.product_category_id] || 1;
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
      orderDetail.category_id = product.category_id;
      orderDetail.category_name = product.category_name;
      orderDetail.stock = product.inventory_quantity;
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

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.relative')) {
      this.showProductDropdown = false;
      this.showCategoryDropdown = false;
    }
  }

  resetProductForm() {
    this.editForm.reset();
    this.idProduct = '';
    this.idCategory = '';
    this.idProductCategory = '';
    this.selectedProductUpdate = null;
    this.selectedCategoryUpdate = null;
  }

  selectProductUpdate(product: any) {
    this.selectedProductUpdate = product;
    this.idProduct = product.product_id;
    this.showProductDropdown = false;

  }

  selectCategoryUpdate(category: any) {
    this.selectedCategoryUpdate = category;
    this.idCategory = category.category_id;
    this.showCategoryDropdown = false;
  }


  openEditPopup(productsCategory: ProductCategory) {
    this.resetProductForm();
    this.showEditPopup = true;

    this.formProduct.patchValue({
      product_name: productsCategory.product_name,
    });
    this.newKeywords = [...productsCategory.keywords];

    this.editForm.patchValue({
      quantity: productsCategory.quantity,
      min_limit: productsCategory.min_limit,
      max_limit: productsCategory.max_limit,
    });
    this.idProduct = productsCategory.product_id;
    this.idCategory = productsCategory.category_id;
    this.idProductCategory = productsCategory.product_category_id;

    // Find the corresponding product and category
    this.selectedProductUpdate = this.products.find(p => p.product_id === this.idProduct);
    this.selectedCategoryUpdate = this.categories.find(c => c.category_id === this.idCategory);

    // Update the form with product and category names
    if (this.selectedProductUpdate) {
      this.editForm.patchValue({ product_name: this.selectedProductUpdate.product_name });
    }
    if (this.selectedCategoryUpdate) {
      this.editForm.patchValue({ category_name: this.selectedCategoryUpdate.category_name });
    }
  }

  closeEditPopup(event: Event) {
    event.stopPropagation();
    this.showEditPopup = false;
  }
  confirmUpdate() {
    this.isConfirmUpdatePopupOpen = true;
  }

  updateProductCategory() {
    if (this.editForm.valid && this.formProduct.valid) {
      const productCategoryData = {
        ...this.editForm.value,
        product_id: this.idProduct,
        category_id: this.idCategory,
        product_category_id: this.idProductCategory,
      };

      const productData = {
        ...this.formProduct.value,
        keywords: this.newKeywords,
        product_id: this.idProduct,
      };

      forkJoin({
        productCategory: this.adminService.updateProductCategory(productCategoryData),
        product: this.adminService.updateProduct(productData)
      }).subscribe({
        next: (response) => {
          this.showEditPopup = false;
          this.isConfirmUpdatePopupOpen = false;
          this.loadProductCategoryByCategoryId(this.idCategory);
          this.loadProduct();
          this.toastr.success('Sửa sản phẩm và danh mục thành công', 'Thành công');
        },
        error: (error) => {
          this.isConfirmUpdatePopupOpen = false;
          if (error.error && error.error.result_data && error.error.result_data.msg) {
            this.toastr.error(`${error.error.result_data.msg}`, 'Thất bại');
          } else {
            this.toastr.error('Có lỗi xảy ra khi cập nhật', 'Thất bại');
          }
        }
      });
    } else {
      this.isConfirmUpdatePopupOpen = false;
      this.toastr.error('Vui lòng điền đầy đủ thông tin', 'Thất bại');
    }
  }
  loadCategory() {
    this.adminService.getCategory().subscribe({
      next: (response: any) => {
        this.categories = response.result_data;
        this.filteredCategories = this.categories;
      },
      error: (error: any) => {
        console.error('Failed to load category', error);
      }
    });
  }

  loadProduct() {
    this.adminService.getProduct().subscribe({
      next: (response: any) => {
        this.products = response.result_data;
        this.filteredProducts = this.products;
      },
      error: (error) => {
        console.error('Failed to load products', error);
      }
    });
  }

  filterProducts(event: any) {
    const searchTerm = event.target.value.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.product_name.toLowerCase().includes(searchTerm)
    );
  }

  filterCategories(event: any) {
    const searchTerm = event.target.value.toLowerCase();


    this.filteredCategories = this.categories.filter(category =>
      category.category_name.toLowerCase().includes(searchTerm)
    );
  }
  clearProductSelection() {
    this.selectedProductUpdate = '';
    this.idProduct = '';
  }

  clearCategorySelection() {
    this.selectedCategoryUpdate = null;
    this.idCategory = '';
  }
  closePopupUpdate(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.showEditPopup = false;
    this.editForm.reset();
    this.formProduct.reset();
    this.newKeywords = [];

  }
  
  isBottomHalf(productCategory: ProductCategory): boolean {
    const index = this.productsCategories.indexOf(productCategory);
    return index >= this.productsCategories.length / 2;
  }

  // Không cần setupBreakpointObserver() nữa, vì Tailwind sẽ xử lý responsive

  trackByProduct(index: number, productCategory: ProductCategory): string {
    return productCategory.product_category_id;
  }

  addKeyword(keyword: string) {
    if (keyword && keyword.trim() !== '') {
      this.newKeywords.push(keyword.trim());
    }
  }

  removeKeyword(index: number) {
    this.newKeywords.splice(index, 1);
  }

  closeConfirmPopup() {
    this.isConfirmUpdatePopupOpen = false;
  }

  isMatchingSearch(product: any): boolean {
    if (!this.searchQuery) return false; // Không highlight nếu không có từ khóa tìm kiếm

    const searchLower = this.searchQuery.toLowerCase();

    // Kiểm tra tên sản phẩm
    if (product.product_name.toLowerCase().includes(searchLower)) {
      return true;
    }

    // Kiểm tra từ khóa (nếu có)
    if (product.keywords && Array.isArray(product.keywords)) {
      return product.keywords.some((keyword: string) =>
        keyword.toLowerCase().includes(searchLower)
      );
    }

    return false;
  }

}