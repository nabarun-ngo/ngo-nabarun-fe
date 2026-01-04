import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { isEmpty } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-notification-modal',
  templateUrl: './notification-modal.component.html',
  styleUrls: ['./notification-modal.component.scss']
})
export class NotificationModalComponent implements OnInit {

  protected details!: NotificationData;

  protected acceptEvent = new Subject<NotificationModalComponent>();
  onAccept$ = this.acceptEvent.asObservable();

  protected declineEvent = new Subject<NotificationModalComponent>();
  onDecline$ = this.declineEvent.asObservable();

  constructor(
    private dialogRef: MatDialogRef<NotificationModalComponent>,
    @Inject(MAT_DIALOG_DATA) data: NotificationData
  ) {

    this.details = data;
    this.details.buttons.accept = isEmpty(this.details.buttons.accept) ? 'Yes' : this.details.buttons.accept;
    this.details.buttons.decline = isEmpty(this.details.buttons.decline) ? 'No' : this.details.buttons.decline;
    this.details.buttons.okay = isEmpty(this.details.buttons.okay) ? 'Okay' : this.details.buttons.okay;
    //////console.log(this.details)
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

  close() {
    this.dialogRef.close();
  }

  protected onAccept() {
    this.acceptEvent.next(this);
    this.dialogRef.close();
  }
  protected onDecline() {
    this.declineEvent.next(this);
    this.dialogRef.close();
  }

}

export type AlertType = 'error' | 'info' | 'warning' | 'success';
export type AlertMode = 'notification' | 'confirmation';



export interface NotificationData {
  title: string;
  type: AlertType;
  mode: AlertMode;
  description: string;
  moreDetails: any | string;
  buttons: { accept: string; decline: string; okay: string; };
}

@Component({
  selector: 'app-notification-modal',
  template: `
    <div id="toast-success" class="flex items-center w-full max-w-xs p-4 mb-4 text-gray-500 bg-white rounded-lg shadow dark:text-gray-400 dark:bg-gray-800" role="alert">
    <div class="inline-flex items-center justify-center flex-shrink-0 w-8 h-8 text-green-500 bg-green-100 rounded-lg dark:bg-green-800 dark:text-green-200">
        <svg class="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 8.207-4 4a1 1 0 0 1-1.414 0l-2-2a1 1 0 0 1 1.414-1.414L9 10.586l3.293-3.293a1 1 0 0 1 1.414 1.414Z"/>
        </svg>
        <span class="sr-only">Check icon</span>
    </div>
    <div class="ms-3 text-sm font-normal">Item moved successfully.</div>
    <button type="button" class="ms-auto -mx-1.5 -my-1.5 bg-white text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex items-center justify-center h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:bg-gray-800 dark:hover:bg-gray-700" data-dismiss-target="#toast-success" aria-label="Close">
        <span class="sr-only">Close</span>
        <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
        </svg>
    </button>
</div>
    `,
})
export class SnackComponent {

}





