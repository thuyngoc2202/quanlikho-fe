import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusOrder'
})
export class StatusOrderPipe implements PipeTransform {
  transform(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'Đang chờ';
      case 'SHIPPING':
        return 'Đã xuất kho';
      default:
        return status;
    }
  }

}
