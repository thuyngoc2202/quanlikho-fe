import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup , Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Category } from 'src/app/model/category.model';
import { ProductCategory } from 'src/app/model/product-category.model';
import { Product } from 'src/app/model/product.model';
import { AdminServiceService } from 'src/app/service/admin-service.service';
import { Observable, of, Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { ActiveMenuService } from '../../../util/active-menu-service';
import { Subscription } from 'rxjs';
import { CustomCurrencyPipe } from 'src/app/pipe/custom-currency.pipe';

@Component({
  selector: 'app-product-category',
  templateUrl: './product-category.component.html',
  styleUrls: ['./product-category.component.css'],
  providers: [CustomCurrencyPipe]
})
export class ProductCategoryComponent implements OnInit, OnDestroy {

  private categorySubscription!: Subscription;
  selectedCategoryId: string | null = null;

  productsCategories: ProductCategory[] = [];
  products: Product[] = [];
  categories: Category[] = [];
  isCreatePopupOpen = false;
  formProduct!: FormGroup;
  isUpdatePopupOpen = false;
  isConfirmUpdatePopupOpen = false;
  isConfirmCreatePopupOpen = false;
  isConfirmDeletePopupOpen = false;
  idProduct: string = '';
  idCategory: string = '';
  idProductCategory: string = '';
  showFileUploadPopup = false;
  selectedFile: File | null = null;
  keywords: string[] = [];
  newKeywords: string[] = [];

  selectedProduct: any;
  selectedCategory: any;
  showProductDropdown = false;
  showCategoryDropdown = false;
  filteredProducts: any[] = [];
  filteredCategories: any[] = [];

  filteredProductCategories: any[] = []; 
  searchTerm: string = '';

  constructor(private formBuilder: FormBuilder,
    private adminService: AdminServiceService,
    private toastr: ToastrService,
    private activeMenuService: ActiveMenuService
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.loadProductCategory();
    this.loadProduct();
    this.loadCategory();
    this.categorySubscription = this.activeMenuService.selectedCategoryId$.subscribe(
      categoryId => {
        this.selectedCategoryId = categoryId;
        if (categoryId !== null) {
          this.loadProductCategoryByCategoryId(categoryId);
        } else {
          this.loadProductCategory();
        }
      }
    );
  }

  ngOnDestroy() {
    if (this.categorySubscription) {
      this.categorySubscription.unsubscribe();
    }
  }

  resetProductForm() {
    this.formProduct.reset();
    this.idProduct = '';
    this.idCategory = '';
    this.idProductCategory = '';
    this.selectedProduct = null;
    this.selectedCategory = null;
  }

  createForm() {
    this.formProduct = this.formBuilder.group({
      product_name: ['', Validators.required],
      price: ['', Validators.required],
      quantity: ['', Validators.required],
      min_limit: ['', Validators.required],
      max_limit: ['', Validators.required],
    });
  }

  openAddProductPopup() {
    this.isCreatePopupOpen = true;
    this.createForm();
  }
  selectProductForUpdate(productsCategory: ProductCategory) {
    this.resetProductForm();
    this.isUpdatePopupOpen = true;
    this.formProduct.patchValue({
      product_name: productsCategory.product_name,
      price: productsCategory.price,
      quantity: productsCategory.quantity,
      min_limit: productsCategory.min_limit,
      max_limit: productsCategory.max_limit,
    });
  
    this.idProduct = productsCategory.product_id;
    this.idCategory = productsCategory.category_id;
    this.idProductCategory = productsCategory.product_category_id;

    // Find the corresponding product and category
    this.selectedProduct = this.products.find(p => p.product_id === this.idProduct);
    this.selectedCategory = this.categories.find(c => c.category_id === this.idCategory);

    // Update the form with product and category names
    if (this.selectedProduct) {
      this.formProduct.patchValue({ product_name: this.selectedProduct.product_name });
    }
    if (this.selectedCategory) {
      this.formProduct.patchValue({ category_name: this.selectedCategory.category_name });
    }
  }

  confirmUpdate() {
    this.isConfirmUpdatePopupOpen = true;
  }
  confirmCreate() {
    this.isConfirmCreatePopupOpen = true;
  }
  updateProductCategory() {
    const productCategoryData = this.formProduct.value;
    productCategoryData.product_id = this.idProduct;
    productCategoryData.category_id = this.idCategory;
    productCategoryData.product_category_id = this.idProductCategory;

    console.log('productData', productCategoryData);

    if (this.formProduct.valid) {
      this.adminService.updateProductCategory(productCategoryData).subscribe({
        next: (response) => {
          console.log('Category created successfully', response);
          this.isConfirmUpdatePopupOpen = false;
          this.isUpdatePopupOpen = false;
          this.loadProductCategory();
          this.createForm();
          this.resetProductForm();
          this.toastr.success('Sửa sản phẩm thành công', 'Thành công');
        },
        error: (error) => {
          console.error('Failed to create category', error);
          this.isConfirmCreatePopupOpen = false;
          this.toastr.error(`${error.error.result_data.msg}`, 'Thất bại');
        }
      });
    } else {
      console.log('form in not valid')
      this.isConfirmCreatePopupOpen = false;
      this.toastr.error(`Thiếu trường`, 'Thất bại');
    }
  }
  closeConfirmPopup() {
    if (this.isConfirmCreatePopupOpen || this.isConfirmUpdatePopupOpen || this.isConfirmDeletePopupOpen) {
      this.isConfirmCreatePopupOpen = false;
      this.isConfirmUpdatePopupOpen = false;
      this.isConfirmDeletePopupOpen = false;
    }
  }

  closePopup() {
    if (this.isCreatePopupOpen || this.isUpdatePopupOpen || this.showFileUploadPopup) {
      this.resetProductForm();
      this.isCreatePopupOpen = false;
      this.isUpdatePopupOpen = false;
      this.showFileUploadPopup = false;
      if (this.selectedFile) {
        this.selectedFile = null;
      }
    }
  }
  addProductCategory() {
    const productCategorytData = this.formProduct.value;
    productCategorytData.product_id = this.idProduct;
    productCategorytData.category_id = this.idCategory;
    
    console.log('producCategorytData', productCategorytData);
    if (this.formProduct.valid) {
      this.adminService.createProductCategory(productCategorytData).subscribe({
        next: (response) => {
          console.log('Category created successfully', response);
          this.isConfirmCreatePopupOpen = false;
          this.isCreatePopupOpen = false;
          this.loadProductCategory();
          this.createForm();
          this.resetProductForm();
          this.toastr.success('Thêm sản phẩm thành công', 'Thành công');
        },
        error: (error) => {
          console.error('Failed to create category', error);
          this.isConfirmCreatePopupOpen = false;
          this.toastr.error(`${error.error.result_data.msg}`, 'Thất bại');
        }
      });
    } else {
      console.log('form in not valid')
      this.isConfirmCreatePopupOpen = false;
      this.toastr.error(`Thiếu trường`, 'Thất bại');
    }
  }

  loadProductCategory() {
    this.adminService.getProductCategory().subscribe({
      next: (response: any) => {
        console.log('Product loaded successfully', response.result_data);
        this.productsCategories = response.result_data;
        this.filteredProductCategories = this.productsCategories;
      },
      error: (error) => {
        console.error('Failed to load category', error);
      }
    });
  }

  deleteProductCategory() {
    this.adminService.deleteProductCategory(this.idProductCategory).subscribe({
      next: (response) => {
        console.log('Product deleted successfully', response);
        this.loadProductCategory();
        this.toastr.success('Xóa sản phẩm thành công', 'Thành công');
        this.idProductCategory = '';
        this.isConfirmDeletePopupOpen = false
      },
      error: (error) => {
        console.error('Failed to delete product', error);
        this.toastr.error('Xóa sản phẩm thất bại', 'Thất bại');
      }
    });
  }

  openDeleteProductPopup(productCategoryId: string){
    this.isConfirmDeletePopupOpen = true;
    this.idProductCategory = productCategoryId;
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
      console.log('Selected file:', this.selectedFile);
    } else {
      console.log('No file selected');
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

    console.log('FormData:', formData);
    this.adminService.importProduct(formData).subscribe({
      next: (response) => {
        console.log('Product imported successfully', response);
        // Add success handling here (e.g., display a message, close popup)
        this.closeFileUploadPopup();
        this.toastr.success('Nhập File thành công', 'Thành công');

      },
      error: (error) => {
        console.error('Error importing product', error);
        // Add error handling here
        this.toastr.error('Nhập File thất bại', 'Thất bại');

      }
    });
  }

  // lấy dữ liệu từ product và category

  loadProduct() {
    this.adminService.getProduct().subscribe({
      next: (response: any) => {
        console.log('Products loaded successfully', response.result_data);
        this.products = response.result_data;
        this.filteredProducts = this.products;
      },
      error: (error) => {
        console.error('Failed to load products', error);
      }
    });
  }

  loadCategory() {
    this.adminService.getCategory().subscribe({
      next: (response: any) => {
        console.log('Category loaded successfully', response.result_data);
        this.categories = response.result_data;
        this.filteredCategories = this.categories;
      },
      error: (error) => {
        console.error('Failed to load category', error);
      }
    });
  }

  loadProductCategoryByCategoryId(categoryId: string) {
    this.adminService.getProductCategoryByCategoryId(categoryId).subscribe({
      next: (response: any) => {
        console.log('Product loaded successfully', response.result_data);
        this.productsCategories = response.result_data;
        this.filteredProductCategories = this.productsCategories;
      },
      error: (error) => {
        console.error('Failed to load products', error);
      }
    });
  }

  addKeyword(keyword: string) {
    if (keyword && keyword.trim() !== '') {
      this.newKeywords.push(keyword.trim());
    }
    console.log('newKeywords', this.newKeywords);

  }

  removeKeyword(index: number) {
    this.newKeywords.splice(index, 1);
  }

  @HostListener('document:click', ['$event'])
  clickout(event: any) {
    if (!event.target.closest('.relative')) {
      this.showProductDropdown = false;
      this.showCategoryDropdown = false;
    }
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

  selectProduct(product: any) {
    this.selectedProduct = product;
    this.idProduct = product.product_id;
    this.showProductDropdown = false;
  }

  selectCategory(category: any) {
    this.selectedCategory = category;
    this.idCategory = category.category_id;
    this.showCategoryDropdown = false;
  }

  clearProductSelection() {
    this.selectedProduct = null;
    this.idProduct='';
  }
  
  clearCategorySelection() {
    this.selectedCategory = null;
    this.idCategory = '';
  }

  searchProductCategories() {
    if (!this.searchTerm) {
      this.filteredProductCategories = this.productsCategories;
    } else {
      this.filteredProductCategories = this.productsCategories.filter(category =>
        category.product_name.toLowerCase().includes(this.searchTerm.toLowerCase()) 
      );
    }
  }
}
