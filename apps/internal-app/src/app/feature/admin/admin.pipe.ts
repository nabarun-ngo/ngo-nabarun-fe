import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'admin',
    standalone: false
})
export class AdminPipe implements PipeTransform {

  transform(value: unknown, ...args: unknown[]): unknown {
    return null;
  }

}
