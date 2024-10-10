import { ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { CartService } from 'src/app/util/Cart.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserServiceService } from 'src/app/service/user-service.service';
import { Category } from 'src/app/model/category.model';
import { ActiveMenuService } from 'src/app/util/active-menu-service';
import { SelectedCategoryService } from 'src/app/util/categoryService';
import { filter, Subscription } from 'rxjs';
import { AdminServiceService } from 'src/app/service/admin-service.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { Product } from 'src/app/model/product.model';
import { LoginServiceService } from 'src/app/service/login-service.service';
import { User } from 'src/app/model/user.model';
import { ProductCheckService } from 'src/app/util/ProductCheckService';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit, OnDestroy {
  currentRoute: string = '';
  getCurrentRoute: string = '';
  cartCount: number = 0;
  isAdmin: boolean = false;
  isLoggedIn: boolean = false;
  userName: string = '';
  categories: Category[] = [];
  cartItems: any[] = [];
  totalAmount: number = 0;
  productQuantities: { [key: string]: number } = {};
  private cartSubscription!: Subscription;

  showEditCategoryPopup = false;
  isConfirmUpdatePopupOpen = false;
  showAddCategoryPopup = false;
  isAddCategoryConfirmPopupOpen = false;
  editingCategory!: Category;
  newCategory: Category = new Category();
  isConfirmDeletePopupOpen: boolean = false;
  idCategory: string = '';
  categoryName: string = '';

  showOrderManagementPopup = false;
  showReportPopup: boolean = false;
  private subscriptions: Subscription[] = [];

  private categorySubscription: Subscription | null = null;
  selectedFile: File | null = null;
  selectedCategoryId: string | null = null;
  isCreatePopupOpen: boolean = false;
  isConfirmCreatePopupOpen: boolean = false;
  selectedCategoryCreate: any;
  selectedProductCreate: any;
  showFileUploadProductPopup: boolean = false;
  isCreateProductCategoryPopupOpen: boolean = false;
  isConfirmCreateProductCategoryPopupOpen: boolean = false;
  showFileUploadPopup: boolean = false;
  newProducts: any[] = [];
  categoryNameImport: string = '';
  showNewProductsPopup = false;
  formProduct!: FormGroup;
  editForm!: FormGroup;
  newKeywords: string[] = [];
  newGenericNames: string[] = [];
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  paginatedProducts: any[] = []; // Danh sách sản phẩm đã phân trang
  isAddAccountPopupOpen: boolean = false;
  products: Product[] = [];

  showValidationErrors: boolean = false;

  showDeleteAllConfirmPopup: boolean = false;

  isChangePasswordPopupOpen = false;
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  email: string | null = null;
  showOldPassword = false;
  showNewPassword = false;
  showConfirmPassword = false;
  newAccount: User = new User();
  accountForm!: FormGroup;
  changePasswordForm!: FormGroup;
  showValidation = false; // Thêm biến này



  constructor(private activeMenuService: ActiveMenuService,
    public router: Router,
    private cartService: CartService, private authService: AuthService,
    private userService: UserServiceService,
    private sltCategory: SelectedCategoryService,
    private adminService: AdminServiceService,
    private toastr: ToastrService,
    private categoryService: SelectedCategoryService,
    private fb: FormBuilder,
    private loginService: LoginServiceService,
    private cdr: ChangeDetectorRef,
    private productCheckService: ProductCheckService
  ) { }

  ngOnInit(): void {
    this.updateRouteInfo();
    this.cartService.cartCount$.subscribe(count => {
      this.cartCount = count;
      this.updateAuthStatus();
    });

    this.getCategory();
    this.loadCartFromLocalStorage();
    this.cartSubscription = this.cartService.cartUpdated.subscribe(() => {
      this.loadCartFromLocalStorage();
    });

    this.authService.isLoggedIn$.subscribe(
      (isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;
      }
    );

    this.subscriptions.push(
      this.cartService.cartCount$.subscribe(count => {
        this.cartCount = count;
        this.updateAuthStatus();
      }),

      this.cartService.cartUpdated.subscribe(() => {
        this.loadCartFromLocalStorage();
      }),

      this.authService.isLoggedIn$.subscribe(
        (isLoggedIn: boolean) => {
          this.isLoggedIn = isLoggedIn;
        }
      ),

      this.categoryService.selectedCategory$.subscribe(category => {
        this.categoryName = category ? category.category_name : null;
        this.selectedCategoryId = category ? category.category_id : null;
      }),

      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        this.resetBreadcrumb();
        this.updateRouteInfo();
      })
    );
    this.validateAccount();
    this.validate();
    this.validateProduct();
    this.loadProduct();
    this.initChangePasswordForm();
  }

  initChangePasswordForm() {
    this.changePasswordForm = this.fb.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required,]],
      confirmPassword: ['', Validators.required]
    }, { validator: this.passwordMatchValidator });
  }


  validateAccount() {
    this.accountForm = this.fb.group({
      email: ['', Validators.required],
      password: ['', Validators.required],
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
    });
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
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

  resetBreadcrumb() {
    this.categoryName = '';
  }

  updateRouteInfo() {
    const urlSegments = this.router.url.split('/').filter(segment => segment !== '');
    if (urlSegments.length > 0) {
      switch (urlSegments[0]) {
        case 'login':
          this.currentRoute = 'ĐĂNG NHẬP';
          break;
        case 'cart':
          this.currentRoute = 'GIỎ HÀNG';
          break;
        case 'home':
        case '':
          this.currentRoute = 'DANH MỤC SẢN PHẨM';
          break;
        default:
          this.currentRoute = urlSegments[0].toUpperCase();
      }
    } else {
      this.currentRoute = 'TRANG CHỦ';
    }
  }

  updateAuthStatus() {
    this.isLoggedIn = this.authService.isLoggedIn();
    if (this.isLoggedIn) {
      const role = this.authService.getRole();
      this.userName = this.authService.getUserName() || '';
      this.isAdmin = role === '1';
    } else {
      this.isAdmin = false;
      this.userName = '';
      this.isLoggedIn = false;
    }
  }

  gerRouter() {
    this.getCurrentRoute = this.router.url.split('/').pop() || '';
    if (this.getCurrentRoute === 'login') {
      this.currentRoute = 'ĐĂNG NHẬP';
    }
    if (this.getCurrentRoute === 'register') {
      this.currentRoute = 'ĐĂNG KÍ';
    }
    if (this.getCurrentRoute === '' || this.getCurrentRoute === 'home') {
      this.currentRoute = 'DANH MỤC SẢN PHẨM';
    }
    if (this.getCurrentRoute === 'cart') {
      this.currentRoute = 'GIỎ HÀNG';
    }
  }

  loadCartFromLocalStorage() {
    const cartData = localStorage.getItem('cart');
    if (cartData) {
      this.cartItems = JSON.parse(cartData);
      this.updateCartSummary();
    } else {
      this.cartItems = [];
      this.cartCount = 0;
      this.totalAmount = 0;
    }
  }

  updateCartSummary() {
    this.cartCount = this.cartItems.reduce((total, item) => total + item.quantity, 0);
  }

  removeItem(item: any) {
    const index = this.cartItems.indexOf(item);
    if (index > -1) {
      this.cartItems.splice(index, 1);
    }
    this.updateLocalStorage();
    this.updateCartCount();
  }

  updateCartCount(): void {
    let cart = JSON.parse(localStorage.getItem('cart') || '[]');
    this.cartCount = cart.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
    this.cartService.updateCartCount(this.cartCount);
  }

  updateLocalStorage() {
    const cart = this.cartItems.map(item => ({
      ...item,
      quantity: this.productQuantities[item.product_category_id] || item.quantity
    }));
    localStorage.setItem('cart', JSON.stringify(cart));
  }

  logout() {
    this.updateAuthStatus();
    this.categoryName = '';
    this.authService.logout();
    this.updateAuthStatus();
  }

  getCategory() {
    this.userService.getCategory().subscribe((data: any) => {
      this.categories = data.result_data;
    });
  }

  selectCategory(category: any) {
    this.categoryName = category.category_name;
    this.sltCategory.setSelectedCategory(category);
    this.router.navigate(['/home']);
  }

  closeConfirmPopup() {
    this.isConfirmUpdatePopupOpen = false;
    this.isAddCategoryConfirmPopupOpen = false;
    this.isConfirmDeletePopupOpen = false;
  }

  openAddCategoryConfirmPopup() {
    this.cdr.detectChanges();
    if (this.newCategory.category_name && this.newCategory.category_name.trim()) {
      this.isAddCategoryConfirmPopupOpen = true;
      this.cdr.detectChanges(); // Thêm dòng này
    } else {
      this.toastr.error('Tên danh mục không được để trống', 'Lỗi');
    }
  }

  openEditCategoryConfirmPopup() {
    this.isConfirmUpdatePopupOpen = true;
    this.cdr.detectChanges();
  }

  openEditCategoryPopup(category: any) {
    this.editingCategory = { ...category };
    this.showEditCategoryPopup = true;
    this.cdr.detectChanges();

  }

  cancelEditCategory() {
    this.showEditCategoryPopup = false;
    this.cdr.detectChanges();
  }

  saveEditCategory() {
    // Implement the logic to save the edited category

    this.adminService.updateCategory(this.editingCategory).subscribe({
      next: (response: any) => {
        if (response.result_msg === 'SUCCESS') {
          this.getCategory();
          this.showEditCategoryPopup = false;
          this.isConfirmUpdatePopupOpen = false;
          this.toastr.success('Sửa loại hàng thành công', 'Thành công');
        }
        if (response.result_msg === 'FAILURE') {
          this.toastr.error('Sửa loại hàng thất bại', 'Thất bại');
        }
      },
      error: (error) => {
        this.toastr.error('Sửa loại hàng thất bại', 'Thất bại');
      }
    });
  }

  openAddCategoryPopup() {
    this.showAddCategoryPopup = true;
    this.newCategory = new Category();
    this.cdr.detectChanges();
  }

  cancelAddCategory() {
    this.showAddCategoryPopup = false;
    this.newCategory = new Category();
  }

  saveNewCategory() {
    if (!this.newCategory.category_name || !this.newCategory.category_name.trim()) {
      this.toastr.error('Tên danh mục không được để trống', 'Lỗi');
      return;
    }

    this.adminService.createCategory(this.newCategory).subscribe({
      next: (response) => {
        this.getCategory();
        this.showAddCategoryPopup = false;
        this.isAddCategoryConfirmPopupOpen = false;
        this.newCategory = new Category();
        this.toastr.success('Thêm loại hàng thành công', 'Thành công');
      },
      error: (error) => {
        console.error('Failed to create category', error);
        this.isAddCategoryConfirmPopupOpen = false;
        if (error.error && error.error.result_data && error.error.result_data.msg) {
          this.toastr.error(error.error.result_data.msg, 'Thất bại');
        } else {
          this.toastr.error('Có lỗi xảy ra khi thêm danh mục', 'Thất bại');
        }
      }
    });
  }

  openDeleteCategoryPopup(categoryId: string) {
    this.isConfirmDeletePopupOpen = true;
    this.idCategory = categoryId;
    this.cdr.detectChanges(); // Thêm dòng này
  }

  openDeleteConfirmCategoryPopup() {
    this.adminService.deleteCategory(this.idCategory).subscribe({
      next: (response) => {
        this.getCategory();
        this.toastr.success('Xoá danh mục hàng thành công', 'Thành công');
        this.idCategory = '';
        this.isConfirmDeletePopupOpen = false;
      },
      error: (error) => {
        console.error('Failed to delete category', error);
        this.toastr.error(`Xoá danh mục hàng thất bại`, 'Thất bại');
      }
    });
  }

  openOrderManagementPopup() {
    this.showOrderManagementPopup = true;
    this.cdr.detectChanges(); // Thêm dòng này
  }

  closeOrderManagementPopup() {
    this.showOrderManagementPopup = false;
  }

  openReportPopup() {
    this.showReportPopup = true;
    this.cdr.detectChanges(); // Thêm dòng này
  }

  closeReportPopup() {
    this.showReportPopup = false;
  }

  openAddProductCategoryPopup() {
    this.isCreateProductCategoryPopupOpen = true;
    this.cdr.detectChanges(); // Thêm dòng này
  }
  closeAddProductCategoryPopup() {
    this.isCreateProductCategoryPopupOpen = false;
  }
  openFileUploadProductPopup() {
    this.showFileUploadProductPopup = true;
    this.cdr.detectChanges(); // Thêm dòng này
  }
  closeFileUploadProductPopup() {
    this.showFileUploadProductPopup = false;
    this.selectedFile = null;
  }
  confirmCreate() {
    this.isConfirmCreatePopupOpen = true;
    this.cdr.detectChanges(); // Thêm dòng này
  }
  closePopupCreate() {
    this.isConfirmCreatePopupOpen = false;
  }

  confirmCreateProductCategory() {
    this.isConfirmCreateProductCategoryPopupOpen = true;
    this.cdr.detectChanges(); // Thêm dòng này
  }
  closePopupCreateProductCategory() {
    this.isConfirmCreateProductCategoryPopupOpen = false;
  }

  openAddProductPopup() {
    this.isCreatePopupOpen = true;
    this.cdr.detectChanges(); // Thêm dòng này
  }
  closeAddProductPopup() {
    this.isCreatePopupOpen = false;
    this.formProduct.reset();
    this.newKeywords = [];
    this.newGenericNames = [];
  }
  openFileUploadPopup() {
    this.showFileUploadPopup = true;
    this.cdr.detectChanges(); // Thêm dòng này
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


  closeFilePopup() {
    this.showFileUploadPopup = false;
    this.selectedFile = null;
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
        // this.loadProductCategoryByCategoryId(this.idCategory);
        this.toastr.success('Nhập sản phẩm thành công', 'Thành công');
      },
      error: (error) => {
        console.error('Error importing product', error);
        this.toastr.error('Nhập sản phẩm thất bại', 'Thất bại');
      }
    });
  }

  closeNewProductsPopup() {
    this.showNewProductsPopup = false;
    this.newProducts = [];
    this.showFileUploadPopup = false;
    // this.loadProductCategoryByCategoryId(this.selectedCategoryId);
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
    const importNewProducts = this.newProducts.map(({ filteredProducts, showDropdown, ...rest }) => ({
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
        // this.loadProductCategoryByCategoryId(this.selectedCategoryId);
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
          // this.loadProductCategoryByCategoryId(this.idCategory);
          this.formProduct.reset();
          this.newKeywords = [];
          this.newGenericNames = [];
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

  loadProduct() {
    this.adminService.getProduct().subscribe({
      next: (response: any) => {
        this.products = response.result_data;
      },
      error: (error) => {
        console.error('Failed to load products', error);
      }
    });
  }


  openChangePasswordPopup() {
    this.isChangePasswordPopupOpen = true;
    this.cdr.detectChanges();

  }

  closeChangePasswordPopup() {
    this.isChangePasswordPopupOpen = false;
    this.changePasswordForm.reset();
    this.cdr.detectChanges();

  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null : {'mismatch': true};
  }

  onChangePassword() {
    this.showValidation = true; // Thêm biến này
    this.changePassword();
  }

  changePassword() {
    this.email = this.authService.getUserName()

    if (this.changePasswordForm.valid) {
      const { confirmPassword, ...changePasswordData } = this.changePasswordForm.value;
      changePasswordData.email = this.email;
  
      this.loginService.changePassword(changePasswordData).subscribe({
        next: (response: any) => {
          if (response.result_msg === 'SUCCESS') {
            this.closeChangePasswordPopup();
            this.changePasswordForm.reset();
            this.toastr.success('Đổi mật khẩu thành công', 'Thành công');
          }
          if (response.result_msg === 'FAILURE') {
            this.toastr.error('Đổi mật khẩu thất bại', 'Thất bại');
          }
        },
        error: (error) => {
          console.error('Failed to change password', error);
          this.toastr.error('Đổi mật khẩu thất bại', 'Thất bại');
        }
      });
    }
  }


  toggleOldPasswordVisibility() {
    this.showOldPassword = !this.showOldPassword;
    this.cdr.detectChanges();

  }

  toggleNewPasswordVisibility() {
    this.showNewPassword = !this.showNewPassword;
    this.cdr.detectChanges();

  }

  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
    this.cdr.detectChanges();

  }

  openAddAccountPopup() {
    this.isAddAccountPopupOpen = true;
    this.cdr.detectChanges();
  }

  closeAddAccountPopup() {
    this.isAddAccountPopupOpen = false;
    this.accountForm.reset();
    this.showValidationErrors = false;
    this.cdr.detectChanges();
  }

  onSubmit() {
    this.showValidationErrors = true;
    if (this.accountForm.valid) {
      this.addAccount();
    }
  }

  addAccount() {

    // Set role_id
    const accountData = this.accountForm.value;
    accountData.role_id = "1";

    this.loginService.register(accountData).subscribe({
      next: (response) => {
        if (response.result_msg === 'SUCCESS') {
          this.closeAddAccountPopup();
          this.toastr.success('Thêm tài khoản thành công', 'Thành công');
          // Reset the form
          this.accountForm.reset();
          this.showValidationErrors = false;
          this.newAccount = new User();
        }
        if (response.result_msg === 'FAILURE') {
          this.toastr.error('Thêm tài khoản thất bại', 'Thất bại');
        }
      },
      error: (error) => {
        console.error('Registration failed', error);
        if (error.error && error.error.result_data && error.error.result_data.msg) {
          this.toastr.error(error.error.result_data.msg, 'Thất bại');
        } else {
          this.toastr.error('Thêm tài khoản thất bại', 'Thất bại');
        }
      }
    });
  }

  openDeleteAllConfirmPopup() {
    this.showDeleteAllConfirmPopup = true;
  }

  cancelDeleteAll() {
    this.showDeleteAllConfirmPopup = false;
  }

  deleteProductCategoryAll(categoryId: string) {
    this.adminService.deleteProductCategoryByCategoryId(categoryId).subscribe({
      next: (response: any) => {
        if (response.result_msg === 'SUCCESS') {
          this.toastr.success('Xóa toàn bộ sản phẩm thành công', 'Thành công');
          this.showDeleteAllConfirmPopup = false;
          this.showEditCategoryPopup = false;
        }
        if (response.result_msg === 'FAILURE') {
          this.toastr.error('Xóa toàn bộ sản phẩm thất bại', 'Thất bại');
        }
      },
      error: (error) => {
        this.toastr.error('Xóa toàn bộ sản phẩm thất bại', 'Thất bại');
      }
    });
  }
  checkProduct() {
    this.productCheckService.toggleCheck();
  }
}



