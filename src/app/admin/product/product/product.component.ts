import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from 'src/app/model/product.model';


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
}
