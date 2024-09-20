import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Category } from 'src/app/model/category.model';
import { AdminServiceService } from 'src/app/service/admin-service.service';
import { ToastrService } from 'ngx-toastr';

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

  constructor(private formBuilder: FormBuilder,
    private adminService: AdminServiceService,
    private toastr: ToastrService
  ) {

  }

  ngOnInit(): void {
    this.validate();
    this.createForm();
    this.loadCategory();
  }
  validate() {
    this.formProduct = this.formBuilder.group({
      category_name: ['', Validators.required],
      category_type: ['', Validators.required],
    });
  }
  createForm() {
    this.formProduct = this.formBuilder.group({
      category_name: '',
      category_parent_id: '',
      category_type: '',
      display_status: '',
      display_position: ''
    });
  }

  openAddCategoryPopup() {
    this.isCreatePopupOpen = true;
    this.createForm();
  }

  openUpdateCategoryPopup() {
    this.isUpdatePopupOpen = true;
  }

  closePopup() {
    if (this.isCreatePopupOpen || this.isUpdatePopupOpen) {
      this.isCreatePopupOpen = false;
      this.isUpdatePopupOpen = false
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
        this.toastr.success('Sửa loại hàng thành công', 'Thành công');
      },
      error: (error) => {
        console.error('Failed to update category', error);
        this.isConfirmUpdatePopupOpen = false;
        this.toastr.error(`${error.error.result_data.msg}`, 'Thất bại');
      }
    });
  }

  deleteCategory(categoryId: string) {
    this.adminService.deleteCategory(categoryId).subscribe({
      next: (response) => {
        console.log('Category deleted successfully', response);
        this.loadCategory();
      },
      error: (error) => {
        console.error('Failed to delete category', error);
      }
    });
  }

  // Thêm phương thức này để xử lý sự kiện nhấn vào category
  selectCategoryForUpdate(category: Category) {
    this.formProduct.patchValue({
      category_name: category.category_name,
      category_parent_id: category.category_parent_id,
      category_type: category.category_type,
      display_status: category.display_status,
      display_position: category.display_position,
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
    if (this.isConfirmUpdatePopupOpen || this.isConfirmCreatePopupOpen) {
      this.isConfirmUpdatePopupOpen = false;
      this.isConfirmCreatePopupOpen = false
    }
  }

}
