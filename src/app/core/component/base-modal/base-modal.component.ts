import { ComponentType } from '@angular/cdk/portal';
import { Component, ComponentFactoryResolver, ComponentRef, EventEmitter, Inject, OnInit, Output, ViewChild, ViewContainerRef } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-base-modal',
  templateUrl: './base-modal.component.html',
  styleUrls: ['./base-modal.component.scss']
})
export class BaseModalComponent<T extends object> implements OnInit {

  @ViewChild('bodyContainer', { read: ViewContainerRef, static: true }) bodyContainer!: ViewContainerRef;
  
  @Output() onbuttonClick: EventEmitter<string> = new EventEmitter();
  @Output() onConpomentInit: EventEmitter<T> = new EventEmitter();

  bodyComponentInstance!: T;
  
  constructor(
    public dialogRef: MatDialogRef<BaseModalComponent<T>>,
    @Inject(MAT_DIALOG_DATA) public data: ModalData<T>,
  ) {}

  ngOnInit(): void {
    if (this.data.bodyComponent) {
      const componentRef = this.bodyContainer.createComponent(this.data.bodyComponent);
      if (this.data.bodyInputs) {
        Object.assign(componentRef.instance, this.data.bodyInputs);
        this.bodyComponentInstance=componentRef.instance;
        this.onConpomentInit.emit(this.bodyComponentInstance)
      }
    }
  }
}

export interface ModalData<T> {
  headerText?: string;
  bodyComponent?: ComponentType<T>;
  bodyInputs?: Partial<T>;
  buttons?: ModalButton[]
}

export interface ModalButton {
  button_id:string;
  button_name:string;
  is_primary?:boolean;
}
