import { LayoutModule } from '@angular/cdk/layout';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { PageTitleComponent } from './component/page-title/page-title.component';
import {
  NotificationModalComponent,
  SnackComponent,
} from './component/notification-modal/notification-modal.component';
import { CommonLayoutComponent } from './layout/common-layout/common-layout.component';
import { SecuredLayoutComponent } from './layout/secured-layout/secured-layout.component';
import { ModalComponent } from './component/modal/modal.component';
import { DateDiffPipe } from './pipe/date-diff.pipe';
import { BaseModalComponent } from './component/base-modal/base-modal.component';
import { NotificationBellComponent } from './component/notification-bell/notification-bell.component';
import { PageLoaderComponent } from './component/page-loader/page-loader.component';
import { ClickOutsideDirective } from './directive/click-outside.directive';
import { PUSH_NOTIFICATION_PROVIDER } from './service/push-notification-provider.interface';
import { OneSignalProviderService } from './service/onesignal-provider.service';
import { BottomNavComponent } from './component/bottom-nav/bottom-nav.component';

@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    PageTitleComponent,
    BottomNavComponent,
    NotificationModalComponent,
    SnackComponent,
    CommonLayoutComponent,
    SecuredLayoutComponent,
    ModalComponent,
    DateDiffPipe,
    BaseModalComponent,
    NotificationBellComponent,
    PageLoaderComponent,
    ClickOutsideDirective,
  ],
  imports: [
    CommonModule,
    LayoutModule,
    RouterModule,
    MatDialogModule,
    MatSnackBarModule,
    MatNativeDateModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
  ],
  exports: [
    FooterComponent,
    PageTitleComponent,
    NotificationModalComponent,
    CommonLayoutComponent,
    SecuredLayoutComponent,
    BaseModalComponent,
    ModalComponent,
    PageLoaderComponent,
  ],
  providers: [
    {
      provide: PUSH_NOTIFICATION_PROVIDER,
      useClass: OneSignalProviderService,
    },
  ],
})
export class ShellModule {}
