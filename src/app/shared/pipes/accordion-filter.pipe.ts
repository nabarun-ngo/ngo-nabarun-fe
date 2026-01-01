import { Pipe, PipeTransform } from '@angular/core';
import { AccordionRow } from '../model/accordion-list.model';
import { concatMapTo } from 'rxjs';

@Pipe({
  name: 'accordionFilter'
})
export class AccordionFilterPipe implements PipeTransform {

  transform(rows: AccordionRow[], searchValue: string): AccordionRow[] {
    if (!rows) {
      return [];
    }
    if (!searchValue) {
      return rows;
    }
    return rows.filter(f => {
      let all_values_in_row: string[] = [];
      f.columns.forEach(f1 => {
        all_values_in_row.push(f1.value);
      })
      f.detailed.forEach(f1 => {
        f1.content?.forEach(f2 => {
          ////console.log(f2.field_name+' '+f2.field_value,searchValue)
          if (f2.field_value) {
            all_values_in_row.push(f2.field_value.toString());
          }
        })
      })
      return all_values_in_row.find(s => s && s.toString().toLowerCase().includes(searchValue.toLowerCase()))
    })
  }

}
