import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customCurrency'
})
export class CustomCurrencyPipe implements PipeTransform {

  transform(value: number): string {
    if (value != null) {
      return value.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });
    }
    return '';
  }

}
