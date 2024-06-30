import { Component, Input } from '@angular/core';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';

@Component({
  selector: 'app-detailed-view',
  templateUrl: './detailed-view.component.html',
  styleUrls: ['./detailed-view.component.scss']
})
export class DetailedViewComponent {

  @Input({required:true}) detailedViews!:DetailedView[];
//  @Input() viewForm:boolean=false;

}
