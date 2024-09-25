import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusOrder'
})
export class StatusOrderPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ';
      case 'CONFIRMED':
        return 'Đã xác nhận';
      case 'SHIPPING':
        return 'Đang giao hàng';
      case 'DELIVERED':
        return 'Đã giao hàng';
      case 'CANCELLED':
        return 'Đã hủy';
      case 'RETURNED':
        return 'Đã trả hàng';
      case 'COMPLETED':
        return 'Đã hoàn thành';
      default:
        return status;
    }
  }

}
