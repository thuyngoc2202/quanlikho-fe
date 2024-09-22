import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Category } from 'src/app/model/category.model';
import { AdminServiceService } from 'src/app/service/admin-service.service';
import { ToastrService } from 'ngx-toastr';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
  categories: Category[] = [];
  formProduct!: FormGroup;
  form: any;
  isCreatePopupOpen = false;
  isUpdatePopupOpen = false;
  idCategory: string = '';
  isConfirmUpdatePopupOpen = false;
  isConfirmCreatePopupOpen = false;
  isConfirmDeletePopupOpen = false;
  showFileUploadPopup = false;
  selectedFile: File | null = null;

  constructor(private formBuilder: FormBuilder,
    private adminService: AdminServiceService,
    private toastr: ToastrService,
  ) {

  }

  ngOnInit(): void {
    this.createForm();
    this.loadCategory();
  }

  createForm() {
    this.formProduct = this.formBuilder.group({
      category_name: ['', Validators.required],
      category_type: [''],
    });
  }

  openAddCategoryPopup() {
    this.isCreatePopupOpen = true;
    this.createForm();
  }

  openUpdateCategoryPopup() {
    this.isUpdatePopupOpen = true;
  }

  openDeleteCategoryPopup(categoryId: string){
    this.isConfirmDeletePopupOpen = true;
    this.idCategory = categoryId;
  }

  closePopup() {
    if (this.isCreatePopupOpen || this.isUpdatePopupOpen || this.showFileUploadPopup) {
      this.isCreatePopupOpen = false;
      this.isUpdatePopupOpen = false;
      this.showFileUploadPopup = false;
    }
  }

  addCategory() {
    console.log(this.formProduct.value);

    if (this.formProduct.valid) {
      this.adminService.createCategory(this.formProduct.value).subscribe({
        next: (response) => {
          console.log('Category created successfully', response);
          this.isConfirmCreatePopupOpen = false;
          this.isCreatePopupOpen = false;
          this.loadCategory();
          this.createForm();
          this.toastr.success('Thêm loại hàng thành công', 'Thành công');
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

  openFileUploadPopup() {
    this.showFileUploadPopup = true;
  }

  closeFileUploadPopup() {
    this.showFileUploadPopup = false;
  }

  loadCategory() {
    this.adminService.getCategory().subscribe({
      next: (response: any) => {
        console.log('Category loaded successfully', response.result_data);
        this.categories = response.result_data;
      },
      error: (error) => {
        console.error('Failed to load category', error);
      }
    });
  }
  updateCategory() {
    const categoryData = {
      ...this.formProduct.value,
      category_id: this.idCategory
    }

    this.adminService.updateCategory(categoryData).subscribe({
      next: (response) => {
        console.log('Category updated successfully', response);
        this.loadCategory();
        this.isConfirmUpdatePopupOpen = false;
        this.isUpdatePopupOpen = false;
        this.idCategory = '';
        this.toastr.success('Sửa loại hàng thành công', 'Thành công');
      },
      error: (error) => {
        console.error('Failed to update category', error);
        this.isConfirmUpdatePopupOpen = false;
        this.toastr.error(`${error.error.result_data.msg}`, 'Thất bại');
      }
    });
  }

  deleteCategory() {
    this.adminService.deleteCategory(this.idCategory).subscribe({
      next: (response) => {
        console.log('Category deleted successfully', response);
        this.loadCategory();
        this.toastr.success('Sửa loại hàng thành công', 'Thành công');
        this.idCategory = '';
        this.isConfirmDeletePopupOpen = false;
      },
      error: (error) => {
        console.error('Failed to delete category', error);
        this.toastr.error(`${error.error.result_data.msg}`, 'Thất bại');
      }
    });
  }

  // Thêm phương thức này để xử lý sự kiện nhấn vào category
  selectCategoryForUpdate(category: Category) {
    this.formProduct.patchValue({
      category_name: category.category_name,
      category_type: category.category_type,
    });
    this.isUpdatePopupOpen = true; // Mở popup cập nhật
    this.idCategory = category.category_id;
  }

  confirmUpdate() {
    this.isConfirmUpdatePopupOpen = true;
  }
  confirmCreate() {
    this.isConfirmCreatePopupOpen = true;
  }
  closeConfirmPopup() {
    if (this.isConfirmUpdatePopupOpen || this.isConfirmCreatePopupOpen || this.isConfirmDeletePopupOpen) {
      this.isConfirmUpdatePopupOpen = false;
      this.isConfirmCreatePopupOpen = false;
      this.isConfirmDeletePopupOpen = false;
    }
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
