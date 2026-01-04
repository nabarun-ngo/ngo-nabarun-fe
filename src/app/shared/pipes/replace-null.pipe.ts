import { Pipe, PipeTransform } from '@angular/core';
import { isEmpty } from 'src/app/core/service/utilities.service';

@Pipe({
  name: 'replaceNull'
})
export class ReplaceNullPipe implements PipeTransform {

  transform(value: any, repleceText: string = '-'): any {
    //////console.log(value)
    if (typeof value === 'undefined' || value === null || isEmpty(value)) {
      return repleceText;
    }
    return value;
  }

}

