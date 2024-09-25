import { Component, HostListener, Output, EventEmitter, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from 'src/app/model/category.model';
import { AdminServiceService } from 'src/app/service/admin-service.service';
import { ChangeDetectorRef } from '@angular/core';
import { ActiveMenuService } from '../../../util/active-menu-service';
import { ProductCategory } from 'src/app/model/product-category.model';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output() sidebarToggled = new EventEmitter<boolean>();
  
  isDropdownOpen = false;
  isSidebarCollapsed = false;
  isCategoryMenuOpen = true;
  categories : Category[]=[];
  selectedCategory: any = null;
  activeMenu: string = '';

  constructor(private router: Router, private adminService: AdminServiceService, private activeMenuService: ActiveMenuService, private authService: AuthService) {}

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkScreenSize();
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: Event) {
    if (!(event.target as HTMLElement).closest('.relative')) {
      this.isDropdownOpen = false;
    }
  }

  ngOnInit() {
    this.checkScreenSize();
    this.loadCategory();
    this.activeMenu = this.activeMenuService.getActiveMenu();
  }

  checkScreenSize() {
    this.isSidebarCollapsed = window.innerWidth < 1024; // Changed to 1024px
    this.sidebarToggled.emit(this.isSidebarCollapsed);
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    this.sidebarToggled.emit(this.isSidebarCollapsed);
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleCategoryMenu() {
    this.activeMenuService.clearSelectedCategory();
    this.isCategoryMenuOpen = !this.isCategoryMenuOpen;
  }


  isRouteActive(route: string): boolean {
    return this.router.isActive(route, false);
  }
  
  loadCategory() {
    this.adminService.getCategory().subscribe({
      next: (response: any) => {
        this.categories = response.result_data;
      },
      error: (error) => {
        console.error('Failed to load category', error);
      }
    });
  }
  
  selectCategory(productCategory: any) {
    this.setActiveMenu('category-' + productCategory.id);
    this.activeMenuService.setSelectedCategoryId(productCategory.category_id);
    this.activeMenuService.setSelectedCategoryName(productCategory.category_name);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/home']);
  }

  setActiveMenu(menuItem: string) {
    this.activeMenu = menuItem;
    this.activeMenuService.setActiveMenu(menuItem);
  }
}
