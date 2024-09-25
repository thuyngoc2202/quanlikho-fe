import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'highlight'
})
export class HighlightPipe implements PipeTransform {

  constructor(private sanitizer: DomSanitizer) {}

  transform(value: string, search: string): SafeHtml {
    if (!search || !value) {
      return value;
    }
    const re = new RegExp(search, 'gi');
    const match = value.match(re);

    if (!match) {
      return value;
    }

    const result = `<td class='highlight'>${value}</td>`;
    return this.sanitizer.bypassSecurityTrustHtml(result);
  }
}
