import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { SegmenetdController } from 'src/app/shared/components/generic/segmented-controller/segmented-controller.model';

@Component({
  selector: 'app-segmented-controller',
  template: `
  jjj
  <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="center" (selectedTabChange)="onClickOrChange($event)" [(selectedIndex)]="selectedTabIndex">
  <mat-tab label="OMSA">khj</mat-tab>
  <ng-content></ng-content>  
  </mat-tab-group>
  `
})
export class SegmentedControllerComponent {

  @Input('tabIndex')
  selectedTabIndex: number = 0;

  @Output() onTabClick = new EventEmitter<number>();

  onClickOrChange(event?: MatTabChangeEvent) {
    this.onTabClick.emit(event ? event.index : this.selectedTabIndex)
  }




}
