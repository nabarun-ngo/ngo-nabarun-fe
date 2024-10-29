import { Pipe, PipeTransform } from '@angular/core';
import { KeyValue } from 'src/app/core/api/models';

@Pipe({
  name: 'displayValueFilter'
})
export class DisplayValueFilterPipe implements PipeTransform {

  transform(list: KeyValue[], searchValue: string): KeyValue[] {
    if(!searchValue){
      return list;
    }
    return list.filter(option => option.displayValue!.toLowerCase().includes(searchValue.toLowerCase()));
  }

}
