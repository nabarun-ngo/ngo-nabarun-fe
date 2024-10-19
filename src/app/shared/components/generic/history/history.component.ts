import { Component, Input } from '@angular/core';
import { HistoryDetail } from 'src/app/core/api/models';

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent {

  @Input() histories!:HistoryDetail[]
}
