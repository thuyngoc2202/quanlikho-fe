import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'priceDisplay'
})
export class PriceDisplayPipe implements PipeTransform {
  transform(value: number):  any {
    return value === 0 ? "Liên hệ" : value;
  }
} 