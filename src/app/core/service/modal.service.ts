import { EventEmitter, Injectable, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogConfig, MatDialogRef } from '@angular/material/dialog';
import { AlertMode, AlertType, NotificationModalComponent, SnackComponent } from '../component/notification-modal/notification-modal.component';
import { ModalComponent } from '../component/modal/modal.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ComponentType } from '@angular/cdk/portal';
import { BaseModalComponent, ModalButton, ModalData } from '../component/base-modal/base-modal.component';



@Injectable({
  providedIn: 'any'
})
export class ModalService {
  modalClosed = new EventEmitter();

  constructor(private dialog: MatDialog,
    private snack: MatSnackBar
  ) { }



  openNotificationModal(content: { title: string; description: string; }, mode: AlertMode, type: AlertType, options?: {
    moreDetails?: any | string;
    acceptButtonText?: string;
    declineButtonText?: string;
    okayButtonText?: string;
  }): NotificationModalComponent {
    let dialogRef = this.dialog.open(NotificationModalComponent, {
      data: {
        title: content.title,
        type: type,
        mode: mode,
        description: content.description,
        moreDetails: options?.moreDetails,
        buttons: {
          decline: options?.declineButtonText,
          accept: options?.acceptButtonText,
          okay: options?.okayButtonText,
        }
      }
    });
    return dialogRef.componentInstance;
  }

  openDialog(options: {
    headers: { headerText?: string, headerTemplate?: TemplateRef<any>, headerContext?: any },
    body: { template: TemplateRef<any>, context?: any },
    action?: { buttonTemplate?: TemplateRef<any>, buttonContext?: any },
    dimention?: { width?: number, height?: number }
    config?: { fullScreen?: boolean }
  }): MatDialogRef<ModalComponent> {
    const config = new MatDialogConfig();
    config.panelClass = ['bg-white', 'rounded-lg'];
    config.disableClose = true;
    config.data = {
      headerText: options.headers?.headerText,
      headerTemplate: options.headers?.headerTemplate,
      headerContext: options.headers?.headerContext,
      template: options.body.template,
      context: options.body.context,
      buttonTemplate: options.action?.buttonTemplate,
      buttonContext: options.action?.buttonContext
    };


    if (options.dimention?.width != null || options.dimention?.width != undefined) {
      config.width = options.dimention?.width + 'px';
    }
    if (options.dimention?.height != null || options.dimention?.height != undefined) {
      config.height = options.dimention?.height + 'px';
    }

    if ((options.config?.fullScreen != null || options.config?.fullScreen != undefined) && options.config?.fullScreen == true) {
      config.panelClass = 'fullscreen-dialog';
      config.width = '90%';
      config.height = '90%';
      config.maxWidth = '90vw';
      config.maxHeight = '90vh';
    }
    return this.dialog.open<ModalComponent>(ModalComponent, config);
  }

  openSnackBar(data: { message: string; actionName?: string }) {
    return this.snack.openFromComponent(SnackComponent, { verticalPosition: 'top' })
  }


  openComponentDialog<T, D>(
    component: ComponentType<T>,
    data: D,
    dimention?: { width?: number, height?: number, fullScreen?: boolean, disableClose?: boolean }
  ) {
    const config = new MatDialogConfig();

    if (dimention?.width != null || dimention?.width != undefined) {
      config.width = dimention?.width + 'px';
    }
    if (dimention?.height != null || dimention?.height != undefined) {
      config.height = dimention?.height + 'px';
    }

    if ((dimention?.fullScreen != null || dimention?.fullScreen != undefined) && dimention?.fullScreen == true) {
      config.panelClass = 'fullscreen-dialog';
      config.width = '100%';
      config.height = '100%';
      config.maxWidth = '100vw';
      config.maxHeight = '100vh';
    }
    config.data = data;
    config.disableClose = dimention?.disableClose;
    return this.dialog.open(component, config);
  }

  // openComponentDialog2<T extends object>(
  //   component: ComponentType<T>,
  //   inputs: Partial<T>,
  //   dimention?: { width?: number; height?: number; fullScreen?: boolean }
  // ) {
  //   const config = new MatDialogConfig();

  //   if (dimention?.width != null) {
  //     config.width = dimention.width + 'px';
  //   }
  //   if (dimention?.height != null) {
  //     config.height = dimention.height + 'px';
  //   }

  //   if (dimention?.fullScreen) {
  //     config.panelClass = 'fullscreen-dialog';
  //     config.width = '100%';
  //     config.height = '100%';
  //     config.maxWidth = '100vw';
  //     config.maxHeight = '100vh';
  //   }

  //   // Open the dialog
  //   const dialogRef = this.dialog.open(component, config);

  //   // Set the inputs dynamically
  //   const instance = dialogRef.componentInstance;
  //   Object.assign(instance, inputs);

  //   return dialogRef;
  // }

  openBaseModal<T extends object>(
    bodyComponent: ComponentType<T>,
    bodyInputs: Partial<T>,
    options: {
      headerText?: string;
      dimention?: { width?: number; height?: number; fullScreen?: boolean };
      buttons?: ModalButton[]
    }
  ) {
    const config = new MatDialogConfig<ModalData<T>>();

    if (options.dimention?.width) {
      config.width = options.dimention.width + 'px';
    }
    if (options.dimention?.height) {
      config.height = options.dimention.height + 'px';
    }
    if (options.dimention?.fullScreen) {
      config.panelClass = 'fullscreen-dialog';
      config.width = '100%';
      config.height = '100%';
      config.maxWidth = '100vw';
      config.maxHeight = '100vh';
    }

    config.data = {
      headerText: options.headerText,
      bodyComponent: bodyComponent,
      bodyInputs: bodyInputs,
      buttons: options.buttons
    };

    return this.dialog.open(BaseModalComponent<T>, config);
  }


}
