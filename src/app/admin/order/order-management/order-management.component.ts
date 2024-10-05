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
  pageSize: number = 5; // Số lượng sản phẩm trên mỗi trang
  totalPages: number = 1;

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
    this.isDetailPopupOpen = true;
    this.adminService.getOrderDetail(product_order_id).subscribe((res) => {

      this.selectedOrder = res.result_data;
      console.log(this.selectedOrder);
      this.updatePaginatedProducts();

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
    // Kiểm tra số lượng trước khi cập nhật
    const invalidItems = this.selectedOrder.product_order_detail_list_responses.filter(
      item => item.quantity > 0 && item.stock === 0
    );
  
    if (invalidItems.length > 0) {
      // Có ít nhất một sản phẩm có số lượng > 0 nhưng stock = 0
      const itemNames = invalidItems.map(item => item.product_name).join(', ');
      this.toastr.error(`Không thể cập nhật. Sản phẩm đã hết hàng: ${itemNames}`);
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
        this.closePopup();
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
    const newQuantity = parseInt(input.value, 10);
    
    if (isNaN(newQuantity) || newQuantity < 1) {
      console.error('Invalid quantity input');
      return;
    }
  
    // Update the quantity in the paginatedProducts array
    if (this.paginatedProducts[index]) {
      this.paginatedProducts[index].quantity = newQuantity;
    } else {
    }
    
    // Also update the quantity in the original array
    const originalIndex = (this.currentPage - 1) * this.pageSize + index;
    if (this.selectedOrder.product_order_detail_list_responses[originalIndex]) {
      this.selectedOrder.product_order_detail_list_responses[originalIndex].quantity = newQuantity;
    } 
  
    // Force change detection
    this.changeDetectorRef.detectChanges();
  }

 

  updatePaginatedProducts() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedProducts = this.selectedOrder.product_order_detail_list_responses.slice(start, end);
    this.totalPages = Math.ceil(this.selectedOrder.product_order_detail_list_responses.length / this.pageSize);
    console.log(this.paginatedProducts);
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
}
