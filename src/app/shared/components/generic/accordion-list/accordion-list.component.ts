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

}
