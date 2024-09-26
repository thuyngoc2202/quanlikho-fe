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
  isConfirmDeletePopupOpen = false;
  showFileUploadPopup = false;
  selectedFile: File | null = null;
  searchTerm: string = '';
  filteredCategories: Category[] = [];

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

    if (this.formProduct.valid) {
      this.adminService.createCategory(this.formProduct.value).subscribe({
        next: (response) => {
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
        this.loadCategory();
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

  // Thêm phương thức này để xử lý sự kiện nhấn vào category
  selectCategoryForUpdate(category: Category) {
    this.formProduct.patchValue({
      category_name: category.category_name,
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

  isMatchingSearch(category_name: string): boolean {
    return this.searchTerm ? category_name.toLowerCase().includes(this.searchTerm.toLowerCase()) : false;
  }

  // searchCategories() {
  //   if (!this.searchTerm) {
  //     this.filteredCategories = this.categories;
  //   } else {
  //     this.filteredCategories = this.categories.filter(category =>
  //       category.category_name.toLowerCase().includes(this.searchTerm.toLowerCase())
  //     );
  //   }
  // }
}
