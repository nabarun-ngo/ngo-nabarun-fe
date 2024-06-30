import { Component, Inject, TemplateRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal',
  template: `
    <h1 mat-dialog-title class="font-bold" *ngIf="data.headerText!=null">{{data.headerText}}</h1>
  <div mat-dialog-title *ngIf="data.headerTemplate!=null">
    <ng-container [ngTemplateOutlet]="data.headerTemplate" [ngTemplateOutletContext]="data.headerContext"></ng-container>
  </div>
  <mat-dialog-content class="mat-typography">
    <ng-container [ngTemplateOutlet]="data.template"  [ngTemplateOutletContext]="data.context"></ng-container>
  </mat-dialog-content>
  <mat-dialog-actions *ngIf="data.buttonTemplate!=null" class="overflow-hidden" align="end">
    <ng-container [ngTemplateOutlet]="data.buttonTemplate" [ngTemplateOutletContext]="data.buttonContext"></ng-container>
  </mat-dialog-actions> 
  <mat-dialog-actions *ngIf="data.buttonTemplate==null"  class="overflow-hidden" align="end">
  <div class="mx-2 px-2">
        <button mat-raised-button [mat-dialog-close]="false" class="bg-white text-base font-medium text-gray-600 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ">
        Okay</button>
        <button mat-raised-button class="text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ">Cancel</button>
    </div>
  </mat-dialog-actions> 
  `,
  styleUrls: ['./modal.component.scss']
})
export class ModalComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: DialogData
  ) { }

}


export class DialogData {
  headerText?: string;
  headerTemplate?: TemplateRef<any>;
  headerContext?: any
  template!: TemplateRef<any>;
  buttonTemplate?: TemplateRef<any>;
  context?: any;
  buttonContext?: any
}