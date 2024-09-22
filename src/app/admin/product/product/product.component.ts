import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/model/product.model';
import { AdminServiceService } from 'src/app/service/admin-service.service';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit {
 

  products: Product[] = [ ];
  isCreatePopupOpen: any;
  formProduct!: FormGroup<any>;
  categories: any;
  isUpdatePopupOpen: any;
  isConfirmUpdatePopupOpen: any;
  isConfirmCreatePopupOpen: any;
  showFileUploadPopup = false;
  selectedFile: File | null = null;

  constructor(private formBuilder: FormBuilder,
        private adminService: AdminServiceService,
  ) { }

  ngOnInit(): void {
    this.createForm();
    this.validate();
    this.loadProduct();
  }
  
  validate() {
    this.formProduct = this.formBuilder.group({
      product_name: ['', Validators.required],
      product_code: ['', Validators.required],
      bar_code: ['', Validators.required],
      description_short: ['', Validators.required],
      description_long: ['', Validators.required],
      price: ['', Validators.required],
      promotional_price: ['', Validators.required],
      quantity: ['', Validators.required],
    });
  }
  createForm() {
    this.formProduct = this.formBuilder.group({
      product_name: '',
      product_code: '',
      bar_code: '',
      description_short: '',
      description_long: '',
      price: '',
      promotional_price: '',
      quantity: '',
    });
  }

  openAddProductPopup() {
    this.isCreatePopupOpen = true;
    this.createForm();
  }
  selectProductForUpdate(_t83: any) {
    throw new Error('Method not implemented.');
  }
  deleteProduct(arg0: any) {
    throw new Error('Method not implemented.');
  }
  confirmUpdate() {
    this.isConfirmUpdatePopupOpen = true;
  }
  confirmCreate() {
    this.isConfirmCreatePopupOpen = true;
  }
  updateProduct() {
    throw new Error('Method not implemented.');
  }
  closeConfirmPopup() {
    if (this.isConfirmCreatePopupOpen || this.isConfirmUpdatePopupOpen ) {
      this.isConfirmCreatePopupOpen = false;
      this.isConfirmUpdatePopupOpen = false;
    }
  }

  closePopup() {
    if (this.isCreatePopupOpen || this.isUpdatePopupOpen || this.showFileUploadPopup) {
      this.isCreatePopupOpen = false;
      this.isUpdatePopupOpen = false;
      this.showFileUploadPopup = false;
      if (this.selectedFile) {
        this.selectedFile = null;
      }
    }
  }
  addProduct() {
    throw new Error('Method not implemented.');
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

  // uploadFile(): void {
  //   if (!this.selectedFile) {
  //     return;
  //   }

  //   const fileReader = new FileReader();
  //   fileReader.onload = (e: any) => {
  //     let product;

  //     if (this.selectedFile!.name.endsWith('.xlsx')) {
  //       const data = new Uint8Array(e.target.result);
  //       const workbook = XLSX.read(data, { type: 'array' });
  //       product = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
  //     } else if (this.selectedFile!.name.endsWith('.csv')) {
  //       const csvContent = e.target.result as string;
  //       product = this.parseCSV(csvContent);
  //     }

  //     if (product) {
  //       this.adminService.importProduct(this.selectedFile).subscribe({
  //         next: (response) => {
  //           console.log('Product imported successfully', response);
  //           // Thêm xử lý thành công ở đây (ví dụ: hiển thị thông báo, đóng popup)
  //         },
  //         error: (error) => {
  //           console.error('Error importing product', error);
  //           // Thêm xử lý lỗi ở đây
  //         },
  //         complete: () => {
  //           // Xử lý khi observable hoàn thành (nếu cần)
  //         }
  //       });
  //     }
  //   };

  //   if (this.selectedFile!.name.endsWith('.xlsx')) {
  //     fileReader.readAsArrayBuffer(this.selectedFile);
  //   } else if (this.selectedFile!.name.endsWith('.csv')) {
  //     fileReader.readAsText(this.selectedFile);
  //   }
  // }

  // private parseCSV(content: string): any[] {
  //   const lines = content.split('\n');
  //   const headers = lines[0].split(',');
  //   return lines.slice(1).map(line => {
  //     const values = line.split(',');
  //     return headers.reduce((obj, header, index) => {
  //       obj[header.trim()] = values[index] ? values[index].trim() : '';
  //       return obj;
  //     }, {} as any);
  //   }).filter(obj => Object.values(obj).some(value => value !== '')); // Lọc bỏ các dòng trống
  // }
}
