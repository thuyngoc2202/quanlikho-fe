import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/util/Cart.service';
import { AuthService } from 'src/app/auth/auth.service';
import { UserServiceService } from 'src/app/service/user-service.service';
import { Category } from 'src/app/model/category.model';
import { ActiveMenuService } from 'src/app/util/active-menu-service';
import { SelectedCategoryService } from 'src/app/util/categoryService';
import { Subscription } from 'rxjs';
import { AdminServiceService } from 'src/app/service/admin-service.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit {
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

  constructor(private activeMenuService: ActiveMenuService,
    private router: Router,
    private cartService: CartService, private authService: AuthService,
    private userService: UserServiceService,
    private sltCategory: SelectedCategoryService,
    private adminService: AdminServiceService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.gerRouter();
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
    this.totalAmount = this.cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
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
    this.authService.logout();
    this.updateAuthStatus();
  }

  getCategory() {
    this.userService.getCategory().subscribe((data: any) => {
      this.categories = data.result_data;
    });
  }

  selectCategory(category: any) {
    this.sltCategory.setSelectedCategory(category);
    this.router.navigate(['/home']);
  }

  closeConfirmPopup() {
    this.isConfirmUpdatePopupOpen = false;
    this.isAddCategoryConfirmPopupOpen = false;
  }

  openAddCategoryConfirmPopup() {
    if (this.newCategory.category_name && this.newCategory.category_name.trim()) {
      this.isAddCategoryConfirmPopupOpen = true;
    } else {
      this.toastr.error('Tên danh mục không được để trống', 'Lỗi');
    }
  }

  openEditCategoryConfirmPopup() {
    this.isConfirmUpdatePopupOpen = true;
  }

  openEditCategoryPopup(category: any) {
    this.editingCategory = { ...category };
    this.showEditCategoryPopup = true;
  }

  cancelEditCategory() {
    this.showEditCategoryPopup = false;
  }

  saveEditCategory() {
    // Implement the logic to save the edited category
    console.log('Saving edited category:', this.editingCategory);

    console.log(this.editingCategory);
    this.adminService.updateCategory(this.editingCategory).subscribe({
      next: (response) => {
        this.getCategory();
        this.showEditCategoryPopup = false;
        this.isConfirmUpdatePopupOpen = false;
        this.toastr.success('Sửa loại hàng thành công', 'Thành công');
      },
      error: (error) => {
        console.error('Failed to update category', error);
        this.isConfirmUpdatePopupOpen = false;
        this.toastr.error(`${error.error.result_data.msg}`, 'Thất bại');
      }
    });
  }

  openAddCategoryPopup() {
    this.showAddCategoryPopup = true;
    this.newCategory = new Category();
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
}
