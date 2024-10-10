import { ChangeDetectorRef, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Order, OrderManagement } from 'src/app/model/cart-detail.model';
import { CustomCurrencyPipe } from 'src/app/pipe/custom-currency.pipe';
import { StatusOrderPipe } from 'src/app/pipe/status-order.pipe';
import { AdminServiceService } from 'src/app/service/admin-service.service';

import { ToastrService } from 'ngx-toastr';
import { HighlightPipe } from 'src/app/pipe/highlight.pipe';
import { AuthService } from 'src/app/auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-order-management',
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.css'],
  providers: [CustomCurrencyPipe, StatusOrderPipe, HighlightPipe],
  encapsulation: ViewEncapsulation.None

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

  paginatedProducts: any[] = [];
  currentPage: number = 1;
  pageSize: number = 12; // Số lượng sản phẩm trên mỗi trang
  totalPages: number = 1;
  originalQuantities: { [key: string]: number } = {};

  isCustomerInfoPopupOpen: boolean = false;
  isProductListPopupOpen: boolean = false;
  totalProducts: number = 0;


  constructor(private adminService: AdminServiceService, 
    private toastr: ToastrService,
    private authService: AuthService, 
    public router: Router,
    private changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.getAllOrder();
  }
  isStatusDropdownOpen = false;
  
  toggleStatusDropdown() {
    this.isStatusDropdownOpen = !this.isStatusDropdownOpen;
  }

  selectStatus(status: string) {
    this.selectedOrder.status = status;
    this.isStatusDropdownOpen = false;
  }
  getAllOrder() {
    this.adminService.getAllOrder().subscribe((res) => {
      this.orders = res.result_data.productOrderListResponse;
      this.filteredOrders = this.orders;
    });
  }

  isMatchingSearch(fullName: string): boolean {
    return this.searchTerm ? fullName.toLowerCase().includes(this.searchTerm.toLowerCase()) : false;
  }

  private removeAccents(str: string): string {
    return str.normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/đ/g, 'd').replace(/Đ/g, 'D');
  }
  
  onSearchChange() {
    if (!this.searchTerm.trim()) {
      this.filteredOrders = [...this.orders]; // Hiển thị tất cả đơn hàng nếu ô tìm kiếm trống
    } else {
      const searchTermLower = this.removeAccents(this.searchTerm.toLowerCase().trim());
      this.filteredOrders = this.orders.filter(order => 
        this.removeAccents(order.full_name.toLowerCase()).includes(searchTermLower) || 
        order.phone_number.includes(searchTermLower)
      );
    }
  }
  

  openDetailPopup(order: any) {
    this.isDetailPopupOpen = true;
  }

  openDetailOrder(product_order_id: string) {
    this.adminService.getOrderDetail(product_order_id).subscribe((res) => {

      this.selectedOrder = res.result_data;
      this.selectedOrder.product_order_detail_list_responses.forEach(item => {
        this.originalQuantities[item.product_name] = item.quantity;
      });
      this.updatePaginatedProducts();
      this.totalProducts = Number(this.selectedOrder.product_order_detail_list_responses[0]?.subtotal) || 0;
      this.currentStatus = res.result_data.status;
    });
  }

  openUpdatePopup(order: any) {
    this.isUpdatePopupOpen = true;
    this.adminService.getOrderStatus(order.product_order_id).subscribe((res) => {
      this.selectedOrder = res.result_data;
      this.currentStatus = res.result_data.status;
    });
  }

  closePopup() {
    if (this.isUpdatePopupOpen || this.isDetailPopupOpen) {
      this.isUpdatePopupOpen = false;
      this.isDetailPopupOpen = false;
    }
    this.currentPage = 1
  }
  closeConfirmPopup() {
    if (this.isConfirmUpdatePopupOpen || this.isConfirmDeletePopupOpen) {
      this.isConfirmUpdatePopupOpen = false;
      this.isConfirmDeletePopupOpen = false;
    }
  }

 updateOrderStatus() {
  let invalidItems: any[] = [];

  this.selectedOrder.product_order_detail_list_responses.forEach(item => {
    this.originalQuantities[item.product_order_id] = item.quantity;
  });
  if (this.selectedOrder.status === 'PENDING') {
    invalidItems = this.selectedOrder.product_order_detail_list_responses.filter(
      item => item.quantity > item.stock
    );
  } else if (this.selectedOrder.status === 'SHIPPING') {
    invalidItems = this.selectedOrder.product_order_detail_list_responses.filter(
      item => item.quantity > (item.stock + this.originalQuantities[item.product_name])
    
    );
  }

  if (invalidItems.length > 0) {
    const itemNames = invalidItems.map(item => item.product_name).join(', ');
    let errorMessage = 'Không thể cập nhật. ';
    if (this.selectedOrder.status === 'PENDING') {
      errorMessage += `Số lượng vượt quá tồn kho cho sản phẩm: ${itemNames}`;
    } else if (this.selectedOrder.status === 'SHIPPING') {
      errorMessage += `Số lượng vượt quá tổng của tồn kho và số lượng ban đầu cho sản phẩm: ${itemNames}`;
    }
    this.toastr.error(errorMessage);
    return;
  }
  const order = {
    product_order_id: this.selectedOrder.product_order_id,
    status: this.selectedOrder.status,
    product_order_details: this.selectedOrder.product_order_detail_list_responses
  }

  this.adminService.updateOrder(order).subscribe({
    next: (response: any) => {
      this.getAllOrder();
      this.closeProductListPopup();
      this.isConfirmUpdatePopupOpen = false;
      this.toastr.success('Cập nhật đơn hàng thành công');
    },
    error: (error) => {
      console.error('Error updating order:', error);
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

  startShipping() {
  
    const detail_requests = {
      detail_requests: this.selectedOrder.product_order_detail_list_responses
    }

    this.adminService.startShipping(detail_requests).subscribe({
      next: (response: any) => {
        this.getAllOrder();
        this.closePopup();
        this.toastr.success('Xuất đơn thành công');
      },
      error: (error) => {
        this.toastr.error('Xuất đơn thất bại');
      }
    });
  }

  readonly orderStatuses = [
    'PENDING',
    'SHIPPING',
  ];

  currentStatus: string = '';

  getAvailableStatuses(): string[] {
    return this.getAllowedStatuses(this.currentStatus);
  }

  private getAllowedStatuses(currentStatus: string): string[] {
    switch (currentStatus) {
      case 'PENDING':
        return this.orderStatuses;
      case 'SHIPPING':
        return ['SHIPPING'];
      default:
        return this.orderStatuses;
    }
  }

  updateQuantity(index: number, event: Event) {
    const input = event.target as HTMLInputElement;
    let newQuantity = parseInt(input.value, 10);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
      newQuantity = 1;
      input.value = '1';
    }

    // Update the quantity in the paginatedProducts array
    if (this.paginatedProducts[index]) {
      this.paginatedProducts[index].quantity = newQuantity;
    }
    
    // Also update the quantity in the original array
    const originalIndex = (this.currentPage - 1) * this.pageSize + index;
    if (this.selectedOrder.product_order_detail_list_responses[originalIndex]) {
      this.selectedOrder.product_order_detail_list_responses[originalIndex].quantity = newQuantity;
    }
    
    // Force change detection
    this.changeDetectorRef.detectChanges();
  }

  preventNegativeInput(event: KeyboardEvent) {
    if (event.key === '-' || event.key === 'e') {
      event.preventDefault();
    }
  }

  updatePaginatedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProducts = this.selectedOrder.product_order_detail_list_responses.slice(start, end);
    this.totalPages = Math.ceil(this.selectedOrder.product_order_detail_list_responses.length / this.pageSize);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedProducts();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedProducts();
    }
  }

  isOrderEditable(): boolean {
    if (!this.selectedOrder || !this.selectedOrder.order_date) {
      return false;
    }

    const orderDate = new Date(this.selectedOrder.order_date);
    const currentDate = new Date();
    const diffInHours = (currentDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60);

    return diffInHours <= 48;
  }

  openCustomerInfoPopup(order_id: string) {
    this.isCustomerInfoPopupOpen = true;
    this.openDetailOrder(order_id);
  }

  closeCustomerInfoPopup() {
    this.isCustomerInfoPopupOpen = false;
  }

  openProductListPopup(order_id: string) {
    this.isProductListPopupOpen = true;
    this.openDetailOrder(order_id);
  }

  closeProductListPopup() {
    this.isProductListPopupOpen = false;
    this.currentPage = 1;
  }
}