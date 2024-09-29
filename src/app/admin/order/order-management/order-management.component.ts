import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Order, OrderManagement } from 'src/app/model/cart-detail.model';
import { CustomCurrencyPipe } from 'src/app/pipe/custom-currency.pipe';
import { StatusOrderPipe } from 'src/app/pipe/status-order.pipe';
import { AdminServiceService } from 'src/app/service/admin-service.service';

import { ToastrService } from 'ngx-toastr';
import { HighlightPipe } from 'src/app/pipe/highlight.pipe';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css'],
  providers: [CustomCurrencyPipe, StatusOrderPipe, HighlightPipe]
})
export class OrderManagementComponent implements OnInit {
  searchTerm: string = '';
  formProduct!: FormGroup;
  isUpdatePopupOpen: any;
  isCreatePopupOpen: any;
  newKeywords: any;
  selectedFile: any;
  isConfirmUpdatePopupOpen: any;
  isConfirmCreatePopupOpen: any;
  isConfirmDeletePopupOpen: any;
  filteredOrders: any[] = [];
  showFileUploadPopup: any;
  orders: OrderManagement[] = [];
  isDetailPopupOpen: boolean = false;
  selectedOrder: OrderManagement = new OrderManagement();
  idOrder: string = '';
  isUpdating: boolean = false;

  constructor(private adminService: AdminServiceService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.getAllOrder();
  }

  getAllOrder() {
    this.adminService.getAllOrder().subscribe((res) => {
      this.orders = res.result_data.productOrderListResponse;
    });
  }

  isMatchingSearch(fullName: string): boolean {
    return this.searchTerm ? fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) : false;
  }

  openFileUploadPopup() {
    throw new Error('Method not implemented.');
  }
  openAddProductPopup() {
    throw new Error('Method not implemented.');
  }

  addKeyword(arg0: string) {
    throw new Error('Method not implemented.');
  }
  removeKeyword(_t73: number) {
    throw new Error('Method not implemented.');
  }
  confirmCreate() {
    throw new Error('Method not implemented.');
  }

  onFileSelected($event: Event) {
    throw new Error('Method not implemented.');
  }
  uploadFile() {
    throw new Error('Method not implemented.');
  }

  addProduct() {
    throw new Error('Method not implemented.');
  }

  openDetailPopup(order: any) {
    this.isDetailPopupOpen = true;
  }

  openDetailOrder(product_order_id: string) {
    this.isDetailPopupOpen = true;
    this.adminService.getOrderDetail(product_order_id).subscribe((res) => {
      this.selectedOrder = res.result_data;
      console.log('réa', this.selectedOrder);
    });
  }

  openUpdatePopup(order: any) {
    console.log('order', order);
    this.isUpdatePopupOpen = true;
    this.adminService.getOrderStatus(order.product_order_id).subscribe((res) => {
      this.selectedOrder = res.result_data;
      this.currentStatus = res.result_data.status; 
      console.log('Current status:', this.currentStatus);
    });
  }

  closePopup() {
    if (this.isUpdatePopupOpen || this.isDetailPopupOpen) {
      this.isUpdatePopupOpen = false;
      this.isDetailPopupOpen = false;
    }
  }
  closeConfirmPopup() {
    if (this.isConfirmUpdatePopupOpen || this.isConfirmDeletePopupOpen) {
      this.isConfirmUpdatePopupOpen = false;
      this.isConfirmDeletePopupOpen = false;
    }
  }

  updateOrderStatus() {

    this.adminService.updateOrder(this.selectedOrder).subscribe({
      next: (response: any) => {
        this.getAllOrder();
        this.closePopup();
        this.isConfirmUpdatePopupOpen = false;
        this.toastr.success('Cập nhật đơn hàng thành công');
      },
      error: (error) => {

        this.toastr.error('Cập nhật đơn hàng thất bại');
      }
    });
  }

  confirmUpdate() {
    this.isConfirmUpdatePopupOpen = true;
  }

  openDeleteProductPopup(product: string) {
    this.isConfirmDeletePopupOpen = true;
    this.idOrder = product;
  }
  deleteOrder() {
    this.adminService.deleteOrder(this.idOrder).subscribe({
      next: (response: any) => {
        this.getAllOrder();
        this.closePopup();
        this.idOrder = '';
        this.isConfirmDeletePopupOpen = false;
        this.toastr.success('Xoá đơn hàng thành công');
      },
      error: (error) => {
        this.toastr.error('Xoá đơn hàng thất bại');
      }
    });
  }

  readonly orderStatuses = [
    'PENDING',
    'CONFIRMED',
    'SHIPPING',
    'DELIVERED',
    'CANCELLED',
    'RETURNED',
    'COMPLETED'
  ];

  currentStatus: string = ''; 

  getAvailableStatuses(): string[] {
    return this.getAllowedStatuses(this.currentStatus);
  }

  private getAllowedStatuses(currentStatus: string): string[] {
    switch (currentStatus) {
      case 'PENDING':
        return this.orderStatuses; 
      case 'CONFIRMED':
        return ['CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED', 'COMPLETED'];
      case 'SHIPPING':
        return ['SHIPPING', 'DELIVERED', 'CANCELLED', 'RETURNED', 'COMPLETED'];
      case 'DELIVERED':
        return ['DELIVERED', 'CANCELLED', 'RETURNED', 'COMPLETED'];
      case 'CANCELLED':
        return ['CANCELLED', 'RETURNED', 'COMPLETED'];
      case 'RETURNED':
        return ['RETURNED', 'COMPLETED'];
      case 'COMPLETED':
        return ['COMPLETED'];
      default:
        return this.orderStatuses;
    }
  }

}
