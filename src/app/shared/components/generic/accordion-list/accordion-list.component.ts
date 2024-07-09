import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AccordionList } from './accordion-list.model';

@Component({
  selector: 'app-accordion-list',
  templateUrl: './accordion-list.component.html',
  styleUrls: ['./accordion-list.component.scss']
})
export class AccordionListComponent {

  @Input()
  accordionList!:AccordionList;
  @Output() onButtonClick: EventEmitter<{ buttonId: string;rowIndex: number }> = new EventEmitter();
  @Output() onAccordionOpen: EventEmitter<{rowIndex: number }> = new EventEmitter();

  
  protected displayValue = (section:string | undefined , code: string | undefined) => {
    if (this.accordionList.refData && section && code) {
      return this.accordionList.refData[section]?.find(f => f.key == code)?.displayValue;
    }
    return code;
  }

}
