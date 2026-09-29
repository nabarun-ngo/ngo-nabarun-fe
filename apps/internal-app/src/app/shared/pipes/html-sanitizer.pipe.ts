import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'htmlSanitizer',
    standalone: false
})
export class HtmlSanitizerPipe implements PipeTransform {

  constructor(
    public sanitizer: DomSanitizer

  ) {
  
  }
  transform(v:string):SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(v);
  }

}
