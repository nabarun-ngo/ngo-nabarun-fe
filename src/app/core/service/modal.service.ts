import { EventEmitter, Injectable, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AlertMode, AlertType, NotificationModalComponent } from '../component/notification-modal/notification-modal.component';
import { ModalComponent } from '../component/modal/modal.component';



@Injectable({
  providedIn: 'root'
})
export class ModalService {
   modalClosed = new EventEmitter();

  constructor(private dialog: MatDialog) { }

 

  openNotificationModal(content:{title: string; description: string ;}, mode: AlertMode,type: AlertType, options?: {
    moreDetails?: any | string;
    acceptButtonText?: string;
    declineButtonText?: string;
    okayButtonText?: string;
  }): NotificationModalComponent {
     let dialogRef=this.dialog.open(NotificationModalComponent, {
      data: {
        title: content.title,
        type: type,
        mode: mode,
        description: content.description,
        moreDetails: options?.moreDetails,
        buttons: {
          decline: options?.declineButtonText ,
          accept: options?.acceptButtonText ,
          okay: options?.okayButtonText,
        }
      }
    });
    return dialogRef.componentInstance;
  }

  openDialog(options:{
    headers:{headerText?:string, headerTemplate?: TemplateRef<any>,headerContext?: any},
    body:{template: TemplateRef<any>,context?: any},
    action?:{buttonTemplate?: TemplateRef<any>,buttonContext?: any},
    dimention?:{width?: number, height?: number}
    config?:{fullScreen?:boolean}
  }): MatDialogRef<ModalComponent> {
    const config = new MatDialogConfig();
    config.panelClass = ['bg-white', 'rounded-lg'];
    config.disableClose = true;
    config.data={
      headerText: options.headers?.headerText,
      headerTemplate: options.headers?.headerTemplate,
      headerContext: options.headers?.headerContext,
      template: options.body.template,
      context: options.body.context,
      buttonTemplate: options.action?.buttonTemplate,
      buttonContext: options.action?.buttonContext
    };


    if ( options.dimention?.width != null || options.dimention?.width != undefined) {
      config.width =  options.dimention?.width + 'px';
    }
    if ( options.dimention?.height != null ||  options.dimention?.height != undefined) {
      config.height = options.dimention?.height + 'px';
    }

    if ( (options.config?.fullScreen != null || options.config?.fullScreen != undefined) && options.config?.fullScreen == true) {
      config.panelClass='fullscreen-dialog';
      config.width='100%';
      config.height='100%';
      config.maxWidth= '100vw';
      config.maxHeight= '100vh';
    }
    return this.dialog.open<ModalComponent>(ModalComponent,config);
  }


  
}
