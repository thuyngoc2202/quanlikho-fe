import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/model/product.model';
import { AdminServiceService } from 'src/app/service/admin-service.service';
import * as XLSX from 'xlsx';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
  // Properties
  products: Product[] = [];
  filteredProducts: Product[] = [];
  formProduct!: FormGroup;
  idProduct: string = '';
  keywords: string[] = [];
  newKeywords: string[] = [];
  selectedFile: File | null = null;
  searchTerm: string = '';

  // Popup control flags
  isCreatePopupOpen = false;
  isUpdatePopupOpen = false;
  isConfirmUpdatePopupOpen = false;
  isConfirmCreatePopupOpen = false;
  isConfirmDeletePopupOpen = false;
  showFileUploadPopup = false;

  constructor(
    private formBuilder: FormBuilder,
    private adminService: AdminServiceService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.loadProducts();
  }

  // Form Management
  createForm() {
    this.formProduct = this.formBuilder.group({
      product_name: ['', Validators.required],
    });
  }

  resetProductForm() {
    this.formProduct.reset();
    this.newKeywords = [];
    this.idProduct = '';
  }

  // Popup Management
  openAddProductPopup() {
    this.isCreatePopupOpen = true;
    this.createForm();
  }

  selectProductForUpdate(product: Product) {
    this.resetProductForm();
    this.isUpdatePopupOpen = true;
    this.formProduct.patchValue({
      product_name: product.product_name,
    });
    this.newKeywords = [...product.keywords];
    this.idProduct = product.product_id;
  }

  confirmUpdate() {
    this.isConfirmUpdatePopupOpen = true;
  }

  confirmCreate() {
    this.isConfirmCreatePopupOpen = true;
  }

  closeConfirmPopup() {
    this.isConfirmCreatePopupOpen = false;
    this.isConfirmUpdatePopupOpen = false;
    this.isConfirmDeletePopupOpen = false;
  }

  closePopup() {
    if (this.isCreatePopupOpen || this.isUpdatePopupOpen || this.showFileUploadPopup) {
      this.resetProductForm();
      this.isCreatePopupOpen = false;
      this.isUpdatePopupOpen = false;
      this.showFileUploadPopup = false;
      this.selectedFile = null;
    }
  }

  // Product CRUD Operations
  addProduct() {
    const productData = this.formProduct.value;
    productData.keywords = this.newKeywords;

    if (this.formProduct.valid) {
      this.adminService.createProduct(productData).subscribe({
        next: (response) => {
          console.log('Product created successfully', response);
          this.isConfirmCreatePopupOpen = false;
          this.isCreatePopupOpen = false;
          this.loadProducts();
          this.resetProductForm();
          this.toastr.success('Thêm sản phẩm thành công', 'Thành công');
        },
        error: (error) => {
          console.error('Failed to create product', error);
          this.isConfirmCreatePopupOpen = false;
          this.toastr.error(`${error.error.result_data.msg}`, 'Thất bại');
        }
      });
    } else {
      console.log('Form is not valid');
      this.isConfirmCreatePopupOpen = false;
      this.toastr.error(`Thiếu trường`, 'Thất bại');
    }
  }

  updateProduct() {
    const productData = this.formProduct.value;
    productData.keywords = this.newKeywords;
    productData.product_id = this.idProduct;

    if (this.formProduct.valid) {
      this.adminService.updateProduct(productData).subscribe({
        next: (response) => {
          console.log('Product updated successfully', response);
          this.isConfirmUpdatePopupOpen = false;
          this.isUpdatePopupOpen = false;
          this.loadProducts();
          this.resetProductForm();
          this.toastr.success('Sửa sản phẩm thành công', 'Thành công');
        },
        error: (error) => {
          console.error('Failed to update product', error);
          this.isConfirmUpdatePopupOpen = false;
          this.toastr.error(`${error.error.result_data.msg}`, 'Thất bại');
        }
      });
    } else {
      console.log('Form is not valid');
      this.isConfirmUpdatePopupOpen = false;
      this.toastr.error(`Thiếu trường`, 'Thất bại');
    }
  }

  loadProducts() {
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

  openDeleteProductPopup(productId: string) {
    this.isConfirmDeletePopupOpen = true;
    this.idProduct = productId;
  }

  deleteProduct() {
    this.adminService.deleteProduct(this.idProduct).subscribe({
      next: (response) => {
        console.log('Product deleted successfully', response);
        this.loadProducts();
        this.toastr.success('Xóa sản phẩm thành công', 'Thành công');
        this.idProduct = '';
        this.isConfirmDeletePopupOpen = false;
      },
      error: (error) => {
        console.error('Failed to delete product', error);
        this.toastr.error('Xóa sản phẩm thất bại', 'Thất bại');
      }
    });
  }

  // File Upload Management
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
        this.closeFileUploadPopup();
        this.loadProducts();
        this.toastr.success('Nhập sản phẩm thành công', 'Thành công');
      },
      error: (error) => {
        console.error('Error importing product', error);
        this.toastr.error('Nhập sản phẩm thất bại', 'Thất bại');
      }
    });
  }

  // Keyword Management
  addKeyword(keyword: string) {
    if (keyword && keyword.trim() !== '') {
      this.newKeywords.push(keyword.trim());
    }
    console.log('newKeywords', this.newKeywords);
  }

  removeKeyword(index: number) {
    this.newKeywords.splice(index, 1);
  }

  // Search Products
  searchProducts() {
    if (!this.searchTerm) {
      this.filteredProducts = this.products;
    } else {
      this.filteredProducts = this.products.filter(product =>
        product.product_name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }
}
