import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SegmenetdController } from 'src/app/shared/components/generic/segmented-controller/segmented-controller.model';

@Component({
  selector: 'control-segment',
  template: `
    <mat-tab [id]="segment_html_id" [label]="segment_name">
    hhk
    <ng-content></ng-content>
    </mat-tab>
  `
})
export class ControlSegmentComponent {
  @Input('name')
  segment_name: string = '';

  @Input('html_id')
  segment_html_id!: string;
}
