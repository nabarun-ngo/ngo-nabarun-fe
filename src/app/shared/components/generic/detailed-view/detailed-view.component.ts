import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { KeyValue } from 'src/app/core/api/models';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';

@Component({
  selector: 'app-detailed-view',
  templateUrl: './detailed-view.component.html',
  styleUrls: ['./detailed-view.component.scss']
})
export class DetailedViewComponent {


  detailed_views: DetailedView[] = [];
  @Input({ required: true, alias: 'refData' })
  refData!: { [name: string]: KeyValue[] };


  @Input({ required: true, alias: 'detailedViews' }) set detailedViews(view: DetailedView[]) {
   // console.log(view)
    this.detailed_views = view;
    this.detailed_views.map(m => {
      m.content?.filter(f1 => f1.editable).map(m1 => {
        m.section_form?.setControl(m1.form_control_name!, new FormControl(m1.field_value, m1.form_input_validation));
      })
      return m;
    })
  };

  protected displayValue = (section: string | undefined, code: string | undefined) => {
    if (this.refData && section && code) {
      return this.refData[section]?.find(f => f.key == code)?.displayValue;
    }
    return code;
  }


  // @Output() accordionOpened: EventEmitter<{rowIndex: number;}> = new EventEmitter();
  // @Output() buttonClick: EventEmitter<{buttonId: string;rowIndex: number;}> = new EventEmitter();


}
