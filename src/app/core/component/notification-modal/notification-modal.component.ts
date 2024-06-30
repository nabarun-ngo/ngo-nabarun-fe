import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { isEmpty } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent implements OnInit{

  protected details!:NotificationData;

  protected acceptEvent = new Subject<NotificationModalComponent>();
  onAccept$ = this.acceptEvent.asObservable();

  protected declineEvent = new Subject<NotificationModalComponent>();
  onDecline$ = this.declineEvent.asObservable();
  
  constructor(
    private dialogRef: MatDialogRef<NotificationModalComponent>,
    @Inject(MAT_DIALOG_DATA) data:NotificationData
  ) {
    
    this.details = data;
    this.details.buttons.accept =  isEmpty(this.details.buttons.accept) ?'Yes':this.details.buttons.accept;
    this.details.buttons.decline =  isEmpty(this.details.buttons.decline) ?'No':this.details.buttons.decline;
    this.details.buttons.okay =  isEmpty(this.details.buttons.okay) ?'Okay':this.details.buttons.okay; 
   //console.log(this.details)
  }
  ngOnInit(): void {
    
  }

  /**
   * Allowed modes => notification, confirmation
   * Allowed types => error (color=red), info (color=indigo), warning (color=yellow), success (color=green)
   * Available buttons => decline, accept  //button visible text can be configured  // declined will act as closed
   * In notification mode => display decline button only | button color should follow the 'type' color convension
   * In confirmation mode => display accept(convensioned color based on info) & decline(normal color) 
   */

  close(){
    this.dialogRef.close();
  }

  protected onAccept(){
    this.acceptEvent.next(this);
    this.dialogRef.close();
  }
  protected onDecline(){
    this.declineEvent.next(this);
    this.dialogRef.close();
  }

}

export type AlertType= 'error' | 'info' | 'warning' | 'success';
export type AlertMode= 'notification' | 'confirmation';



export interface NotificationData{
    title: string;
    type: AlertType;
    mode: AlertMode;
    description: string;
    moreDetails: any| string;
    buttons: { accept: string ; decline: string; okay: string; };
  }





