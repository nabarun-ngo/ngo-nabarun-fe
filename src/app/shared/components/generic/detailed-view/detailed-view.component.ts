import { Component, Input } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';

@Component({
  selector: 'app-detailed-view',
  templateUrl: './detailed-view.component.html',
  styleUrls: ['./detailed-view.component.scss']
})
export class DetailedViewComponent {
  detailed_views: DetailedView[]=[];

  @Input({ required: true }) set detailedViews(view: DetailedView[]) {
    //console.log(view)
    this.detailed_views = view;
    this.detailed_views.map(m => { 
      //console.log(m)
      m.section_form=new FormGroup({});
      m.content?.filter(f1=>f1.editable).map(m1 => {
        //console.log(m1)
        m.section_form?.setControl(m1.form_control_name!, new FormControl(m1.field_value,m1.form_input_validation));
        //return m1;
      })
      return m;
    })
    //console.log(vart)
  };

  //  @Input() viewForm:boolean=false;

}
