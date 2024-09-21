import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/model/product.model';
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

  constructor(private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.createForm();
    this.validate();

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
    if (this.isConfirmCreatePopupOpen || this.isConfirmUpdatePopupOpen) {
      this.isConfirmCreatePopupOpen = false;
      this.isConfirmUpdatePopupOpen = false
    }
  }

  closePopup() {
    if (this.isCreatePopupOpen || this.isUpdatePopupOpen) {
      this.isCreatePopupOpen = false;
      this.isUpdatePopupOpen = false
    }
  }
  addProduct() {
    throw new Error('Method not implemented.');
  }

  openFileUploadPopup() {
    this.showFileUploadPopup = true;
  }

  closeFileUploadPopup() {
    this.showFileUploadPopup = false;
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadFile(): void {
    if (!this.selectedFile) {
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = (e: any) => {
      const data = new Uint8Array(e.target.result);
      let categories;

      if (this.selectedFile!.name.endsWith('.xlsx')) {
        const workbook = XLSX.read(data, { type: 'array' });
        categories = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
      } else if (this.selectedFile!.name.endsWith('.csv')) {
        const csvContent = e.target.result;
        categories = this.parseCSV(csvContent);
      }

      // if (categories) {
      //   this.categoryService.importCategories(categories).subscribe(
      //     response => {
      //       console.log('Categories imported successfully', response);
      //       // Thêm xử lý thành công ở đây (ví dụ: hiển thị thông báo, đóng popup)
      //     },
      //     error => {
      //       console.error('Error importing categories', error);
      //       // Thêm xử lý lỗi ở đây
      //     }
      //   );
      // }
    };

    fileReader.readAsArrayBuffer(this.selectedFile);
  }

  private parseCSV(content: string): any[] {
    // Implement CSV parsing logic here
    // This is a simple example and may need to be adjusted based on your CSV structure
    const lines = content.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map(line => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        obj[header.trim()] = values[index].trim();
        return obj;
      }, {} as any);
    });
  }
}
