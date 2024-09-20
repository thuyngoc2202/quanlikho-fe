import { Component, OnInit } from '@angular/core';

interface Category {
  id: string;
  category_name: string;
  category_parent_id: string;
  catagory_type: string;
  display_status: string;
  display_position: number;
 }

@Component({
  selector: 'app-category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent implements OnInit {
      categories: Category[] = [
        {
          id: 'C1123',
          category_name: 'Thực phẩm',
          category_parent_id: 'C123',
          catagory_type: 'PRODUCT',
          display_status: 'ACTIVE',
          display_position: 1
        },
        {
          id: 'C1124',
          category_name: 'Thực phẩm',
          category_parent_id: 'C123',
          catagory_type: 'PRODUCT',
          display_status: 'ACTIVE',
          display_position: 1
        },  
      ];

  constructor() { }

  ngOnInit(): void {
  }

  isPopupOpen = false;

  openAddCategoryPopup() {
    this.isPopupOpen = true;
  }

  closePopup() {
    this.isPopupOpen = false;
  }

  addCategory() {

  }
}
