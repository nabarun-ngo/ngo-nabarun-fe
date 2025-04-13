import { Component, EventEmitter, Input, Output } from '@angular/core';
import { AccordionList, AccordionRow } from '../../../model/accordion-list.model';
import { SharedDataService } from 'src/app/core/service/shared-data.service';

@Component({
  selector: 'app-accordion-list',
  templateUrl: './accordion-list.component.html',
  styleUrls: ['./accordion-list.component.scss']
})
export class AccordionListComponent {

  Math = Math;
  @Input({alias:'accordionList'}) accordionList!: AccordionList;

  constructor(private sharedDataService: SharedDataService){
    sharedDataService.searchValue.subscribe((value)=>{
      this.accordionList.searchValue= value || '';
    })
  }

  @Output() onButtonClick: EventEmitter<{ buttonId: string;rowIndex: number }> = new EventEmitter();
  @Output() onAccordionOpen: EventEmitter<{rowIndex: number }> = new EventEmitter();

  
  protected displayValue = (section:string | undefined , code: string | undefined) => {
    if (this.accordionList.refData && section && code) {
      return this.accordionList.refData[section]?.find(f => f.key == code)?.displayValue;
    }
    return code;
  }


  accordionOpened(row: AccordionRow) {
    //console.log(this.accordionList,row)
    let rowIndex=this.accordionList.contents.findIndex(f=>f.detailed == row.detailed);
    //console.log(rowIndex)
    this.onAccordionOpen.emit({rowIndex:rowIndex})
  }

  buttonClicked(row: AccordionRow,buttonnId: string) {
    let rowIndex=this.accordionList.contents.findIndex(f=>f.detailed == row.detailed);
    this.onButtonClick.emit({buttonId:buttonnId,rowIndex:rowIndex})
  }

}
