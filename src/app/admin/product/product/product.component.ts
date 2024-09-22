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


  products: Product[] = [];
  isCreatePopupOpen = false;
  formProduct!: FormGroup;
  isUpdatePopupOpen = false;
  isConfirmUpdatePopupOpen = false;
  isConfirmCreatePopupOpen = false;
  isConfirmDeletePopupOpen = false;
  idProduct: string = '';
  showFileUploadPopup = false;
  selectedFile: File | null = null;
  keywords: string[] = [];
  newKeywords: string[] = [];

  constructor(private formBuilder: FormBuilder,
    private adminService: AdminServiceService,
    private toastr: ToastrService,
  ) { }

  ngOnInit(): void {
    this.createForm();

    this.loadProduct();
  }

  createForm() {
    this.formProduct = this.formBuilder.group({
      product_name: ['', Validators.required],
    });
  }

  openAddProductPopup() {
    this.isCreatePopupOpen = true;
    this.createForm();
  }
  selectProductForUpdate(product: Product) {
    this.isUpdatePopupOpen = true;
    this.formProduct.patchValue({
      product_name: product.product_name,
    });
    this.newKeywords = product.keywords;
    this.idProduct = product.product_id;
  }

  confirmUpdate() {
    this.isConfirmUpdatePopupOpen = true;
  }
  confirmCreate() {
    this.isConfirmCreatePopupOpen = true;
  }
  updateProduct() {
    const productData = this.formProduct.value;
    productData.keywords = this.newKeywords;
    productData.product_id = this.idProduct;
    console.log('productData', productData);

    if (this.formProduct.valid) {
      this.adminService.updateProduct(productData).subscribe({
        next: (response) => {
          console.log('Category created successfully', response);
          this.isConfirmUpdatePopupOpen = false;
          this.isUpdatePopupOpen = false;
          this.loadProduct();
          this.createForm();
          this.newKeywords = [];
          this.idProduct = '';
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
      this.isCreatePopupOpen = false;
      this.isUpdatePopupOpen = false;
      this.showFileUploadPopup = false;
      this.newKeywords = [];
      if (this.selectedFile) {
        this.selectedFile = null;
      }
    }
  }
  addProduct() {
    const productData = this.formProduct.value;
    productData.keywords = this.newKeywords;

    if (this.formProduct.valid) {
      this.adminService.createProduct(productData).subscribe({
        next: (response) => {
          console.log('Category created successfully', response);
          this.isConfirmCreatePopupOpen = false;
          this.isCreatePopupOpen = false;
          this.loadProduct();
          this.createForm();
          this.newKeywords = [];
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

  loadProduct() {
    this.adminService.getProduct().subscribe({
      next: (response: any) => {
        console.log('Product loaded successfully', response.result_data);
        this.products = response.result_data;
      },
      error: (error) => {
        console.error('Failed to load category', error);
      }
    });
  }

  deleteProduct() {
    this.adminService.deleteProduct(this.idProduct).subscribe({
      next: (response) => {
        console.log('Product deleted successfully', response);
        this.loadProduct();
        this.toastr.success('Xóa sản phẩm thành công', 'Thành công');
        this.idProduct = '';
        this.isConfirmDeletePopupOpen = false
      },
      error: (error) => {
        console.error('Failed to delete product', error);
        this.toastr.error('Xóa sản phẩm thất bại', 'Thất bại');
      }
    });
  }

  openDeleteProductPopup(productId: string){
    this.isConfirmDeletePopupOpen = true;
    this.idProduct = productId;
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
      },
      error: (error) => {
        console.error('Error importing product', error);
        // Add error handling here
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


}
