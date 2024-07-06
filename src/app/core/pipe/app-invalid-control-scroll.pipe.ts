import { ElementRef, HostListener, Pipe, PipeTransform } from '@angular/core';
import { FormGroupDirective } from '@angular/forms';
import { debounceTime, fromEvent, take } from 'rxjs';

@Pipe({
  name: 'appInvalidControlScroll'
})
export class AppInvalidControlScrollPipe  {

  constructor(
    private el: ElementRef,
    private formGroupDir: FormGroupDirective
  ) {}

  @HostListener("ngSubmit") onSubmit() {
    if (this.formGroupDir.control.invalid) {
      //this.scrollToFirstInvalidControl();
    }
  }

  
  

}
