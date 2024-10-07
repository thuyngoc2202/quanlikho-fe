import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
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
  newGenericNames: string[] = [];
  formProduct!: FormGroup;
  categoryName: string = '';
  showFileUploadPopup: boolean = false;
  newProducts: any[] = [];
  showNewProductsPopup = false;
  selectedFile: File | null = null;
  selectedCategoryId: string | null = null;
  isCreatePopupOpen: boolean = false;
  isConfirmCreatePopupOpen: boolean = false;
  selectedCategoryCreate: any;
  selectedProductCreate: any;
  showFileUploadProductPopup: boolean = false;
  isCreateProductCategoryPopupOpen: boolean = false;
  isConfirmCreateProductCategoryPopupOpen: boolean = false;
  
  selectedProductImport: any;
  paginatedProducts: any[] = []; // Danh sách sản phẩm đã phân trang
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  categoryNameImport: string = '';
  typeLogin: string = '';

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
    private cdr: ChangeDetectorRef
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
        this.selectedCategoryId = category.category_id;
        this.setActiveCategory(category);
      }
    });
    this.validate();
    this.validateProduct();
    this.initializeProducts();
    this.updatePagination();

  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }

  }

  validate() {
    this.editForm = this.fb.group({
      quantity: ['', [Validators.required]],
      min_limit: ['', [Validators.required]],
      max_limit: ['', [Validators.required]],
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
      return; 
    }
    
  
    let currentQuantity = Number(this.productQuantities[product.product_category_id]);
    const minQuantity = Number(product.min_quantity) || 1;
    
 
    let newQuantity = currentQuantity - minQuantity;
    
 
    newQuantity = Math.max(0, Math.floor(newQuantity / minQuantity) * minQuantity);
    
 
    this.productQuantities[product.product_category_id] = newQuantity;
  
  }

  increaseQuantity(product: any) {
    if (!this.productQuantities[product.product_category_id]) {
      this.productQuantities[product.product_category_id] = 0;
    }
    
    const currentQuantity = Number(this.productQuantities[product.product_category_id]);
    const stock = Number(product.quantity) || 0;
    const minQuantity = Number(product.min_quantity) || 1;
    
    let newQuantity = currentQuantity + minQuantity;
    
    newQuantity = Math.floor(newQuantity / minQuantity) * minQuantity;
    
    if (newQuantity <= stock) {
      this.productQuantities[product.product_category_id] = newQuantity;
    } else {
      this.productQuantities[product.product_category_id] = Math.floor(stock / minQuantity) * minQuantity;
    }
  
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

    if (quantity > product.inventory_quantity) {
      return;
    }
    const orderProduct = orderCart.find((item: any) => item.product_category_id === product.product_category_id);
    if (orderProduct) {
      if (orderProduct.quantity + quantity > product.inventory_quantity) {
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
      orderDetail.min_quantity = product.min_quantity;
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
      if (this.isLoggedIn) {
        this.typeLogin = 'admin';
      } else {
        this.typeLogin = 'user';
      }
      this.userService.getProductCategoryByCategoryId(categoryId, this.typeLogin).subscribe({
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
      return;
    }

    const orderProduct = orderCart.find((item: any) => item.product_category_id === product.product_category_id);
    if (orderProduct) {
      if (orderProduct.quantity + quantity > product.inventory_quantity) {
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
      orderDetail.min_quantity = product.min_quantity;
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
    console.log('productsCategory', productsCategory);
    
    this.formProduct.patchValue({
      product_name: productsCategory.product_name,
    });
    this.newKeywords = [...productsCategory.keywords];
    this.newGenericNames = [...productsCategory.generic_name];

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
        generic_name: this.newGenericNames,
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
    this.selectedProductCreate = '';
    this.idProduct = '';
  }

  clearCategorySelection() {
    this.selectedCategoryUpdate = null;
    this.selectedCategoryCreate = null;
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


  addGenericName(genericName: string) {
    if (genericName && genericName.trim() !== '') {
      this.newGenericNames.push(genericName.trim());
    }
  }

  removeGenericName(index: number) {
    this.newGenericNames.splice(index, 1);
  }
  // Không cần setupBreakpointObserver() nữa, vì Tailwind sẽ xử lý responsive

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

  openFileUploadPopup() {
    this.showFileUploadPopup = true;
  }

  closeFileUploadPopup() {
    this.showFileUploadPopup = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }
  uploadFile(): void {
    if (!this.selectedFile) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);
    if (this.selectedCategoryId !== null) {
      this.adminService.importVerifyProductCategory(this.selectedCategoryId, formData).subscribe({
        next: (response) => {
          // Add success handling here (e.g., display a message, close popup)
          this.toastr.success('Nhập File thành công', 'Thành công');
          // Check if there are new products
          if (response.result_data.import_data && response.result_data.import_data.length > 0) {
            this.newProducts = response.result_data.import_data;
            this.categoryNameImport = response.result_data.category_name;
            this.showNewProductsPopup = true;
            this.updatePagination();
          }
        },
        error: (error) => {
          console.error('Error importing product', error);
          // Add error handling here
          this.toastr.error('Nhập File thất bại', 'Thất bại');

        }
      });
    } else {
      this.toastr.error('Chọn danh mục trước khi nhập file', 'Thất bại');
    }

  }

  updatePagination() {
    this.totalPages = Math.ceil(this.newProducts.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.paginatedProducts = this.newProducts.slice(startIndex, startIndex + this.itemsPerPage);

  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  isNewProduct(product: Product): boolean {
    return !product.system_name;
  }

  getProductDisplayValue(product: any): string {
    return product.system_name || '';
  }

  updateInputValue(product: any, value: string): void {
    product.system_name = value;
    this.filterProductsImport(product);
  }

  updateProductValue(product: any, event: any): void {
    product.system_name = event.target.value;
    this.filterProductsImport(product);
  }

  showProductImportDropdown(index: number): void {
    const product = this.paginatedProducts[index];
    product.showDropdown = true;
    this.showAllProducts(product);
  }

  showAllProducts(product: any): void {
    product.filteredProducts = [...this.products]; // Show all products
  }

  filterProductsImport(product: any): void {
    const searchTerm = product.system_name.toLowerCase();
    product.filteredProducts = this.products.filter(p => 
      p.product_name.toLowerCase().includes(searchTerm)
    );
  }

  selectProductImport(existingProduct: any, product: any) {
    product.system_name = existingProduct.product_name;
    product.showDropdown = false;
  }

  clearProductSelectionImport(product: any): void {
    product.system_name = '';
  }
  onBlur(product: any): void {
    setTimeout(() => {
      product.showDropdown = false;
    }, 200);
  }

  importNewProducts() {
    const importNewProducts= this.newProducts.map(({ filteredProducts, showDropdown, ...rest }) => ({
      ...rest,
      system_name: rest.system_name,
      import_name: rest.import_name,
      quantity: rest.quantity,
    }));
    const importData = {
      import_data: importNewProducts,
      category_id: this.selectedCategoryId,
      category_name: this.categoryName,
    }
    this.adminService.importProductCategory(importData).subscribe({
      next: (response) => {
        this.toastr.success('Nhập sản phẩm thành công', 'Thành công');
        this.closeNewProductsPopup();
        this.loadProductCategoryByCategoryId(this.selectedCategoryId);
        this.newProducts = [];
        this.initializeProducts();
        this.showFileUploadPopup = false;
        this.selectedFile = null;
      },
      error: (error) => {
        this.toastr.error('Nhập sản phẩm thất bại', 'Thất bại');
      }
    });
  }

  
  initializeProducts() {
    this.newProducts = this.newProducts.map(product => ({
      ...product,
      system_name: product.system_name || product.import_name || '',
      filteredProducts: [],
      showDropdown: false
    }));
    this.updatePagination();
  }



  closeFilePopup() {
    this.showFileUploadPopup = false;
    this.selectedFile = null;
  }
  closeNewProductsPopup() {
    this.showNewProductsPopup = false;
    this.newProducts = [];
    this.showFileUploadPopup = false;
    this.loadProductCategoryByCategoryId(this.selectedCategoryId);
  }
  openAddProductPopup() {
    this.isCreatePopupOpen = true;
  }
  closeAddProductPopup() {
    this.isCreatePopupOpen = false;
    this.formProduct.reset();
    this.newKeywords = [];
  }
  addProduct() {
    const productData = this.formProduct.value;
    productData.keywords = this.newKeywords;
    productData.generic_name = this.newGenericNames;

    if (this.formProduct.valid) {
      this.adminService.createProduct(productData).subscribe({
        next: (response) => {
          this.isConfirmCreatePopupOpen = false;
          this.isCreatePopupOpen = false;
          this.loadProduct();
          this.loadProductCategoryByCategoryId(this.idCategory);
          this.formProduct.reset();
          this.toastr.success('Thêm sản phẩm thành công', 'Thành công');
        },
        error: (error) => {
          console.error('Failed to create product', error);
          this.isConfirmCreatePopupOpen = false;
          this.toastr.error(`${error.error.result_data.msg}`, 'Thất bại');
        }
      });
    } else {
      this.isConfirmCreatePopupOpen = false;
      this.toastr.error(`Thiếu trường`, 'Thất bại');
    }
  }
  uploadProductCategoryFile(): void {
    if (!this.selectedFile) {
      console.error('No file selected');
      return;
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.adminService.importProduct(formData).subscribe({
      next: (response) => {
        this.closeFileUploadProductPopup();
        this.loadProductCategoryByCategoryId(this.idCategory);
        this.toastr.success('Nhập sản phẩm thành công', 'Thành công');
      },
      error: (error) => {
        console.error('Error importing product', error);
        this.toastr.error('Nhập sản phẩm thất bại', 'Thất bại');
      }
    });
  }
  openAddProductCategoryPopup() {
    this.isCreateProductCategoryPopupOpen = true;
  }
  closeAddProductCategoryPopup() {
    this.isCreateProductCategoryPopupOpen = false;
  }
  openFileUploadProductPopup() {
    this.showFileUploadProductPopup = true;
  }
  closeFileUploadProductPopup() {
    this.showFileUploadProductPopup = false;
    this.selectedFile = null;
  }
  confirmCreate() {
    this.isConfirmCreatePopupOpen = true;
  }
  closePopupCreate() {
    this.isConfirmCreatePopupOpen = false;
  }

  confirmCreateProductCategory() {
    this.isConfirmCreateProductCategoryPopupOpen = true;
  }
  closePopupCreateProductCategory() {
    this.isConfirmCreateProductCategoryPopupOpen = false;
  }
  selectProductCreate(product: any) {
    this.selectedProductCreate = product;
    this.idProduct = product.product_id;
    this.showProductDropdown = false;

  }

  selectCategoryCreate(category: any) {
    this.selectedCategoryCreate = category;
    this.idCategory = category.category_id;
    this.showCategoryDropdown = false;
  }
  openCreateProductCategoryPopup() {
    this.isCreateProductCategoryPopupOpen = true;
  }
  closeCreateProductCategoryPopup() {
    this.isCreateProductCategoryPopupOpen = false;
  }

  addProductCategory() {
    const productCategorytData = this.editForm.value;
    productCategorytData.product_id = this.idProduct;
    productCategorytData.category_id = this.idCategory;

    if (this.editForm.valid) {
      this.adminService.createProductCategory(productCategorytData).subscribe({
        next: (response) => {
          this.isCreateProductCategoryPopupOpen = false;
          this.isConfirmCreateProductCategoryPopupOpen = false;
          this.loadProductCategoryByCategoryId(this.selectedCategoryId);
          this.editForm.reset();
          this.toastr.success('Thêm danh mục thành công', 'Thành công');
        },
        error: (error) => {
          console.error('Failed to create category', error);
          this.isConfirmCreatePopupOpen = false;
          this.toastr.error(`${error.error.result_data.msg}`, 'Thất bại');
        }
      });
    } else {
      this.isConfirmCreatePopupOpen = false;
      this.toastr.error(`Thiếu trường`, 'Thất bại');
    }
  }


  getColumnCount(): number {
    const width = window.innerWidth;
    if (width >= 1920) return 14; // 3xl
    if (width >= 1536) return 12; // 2xl
    if (width >= 1280) return 10; // xl
    if (width >= 1024) return 8;  // lg
    if (width >= 768) return 6;   // md
    if (width >= 640) return 4;   // sm
    return 2; // Default for xs
  }


  trackByProduct(index: number, product: any): any {
    return product.id; // hoặc bất kỳ thuộc tính duy nhất nào của sản phẩm
  }
  
  isBottomHalf(product: any): boolean {
    // Implement logic to determine if the product is in the bottom half of the screen
    // This might involve getting the element's position relative to the viewport
    const element = document.getElementById(product.id); // Assume each product has a unique id
    if (element) {
      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      return rect.top > windowHeight / 2;
    }
    return false;
  }

}