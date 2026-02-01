
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { ShowAuthedDirective } from './directive/show-authed.directive';
import { PageTitleComponent } from './component/page-title/page-title.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NotificationModalComponent, SnackComponent } from './component/notification-modal/notification-modal.component';
import { environment } from 'src/environments/environment';
import { ApiModule as ApiClientModule } from './api-client/api.module';
import { HttpErrorIntercepterService } from './intercepter/http-error-intercepter.service';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { RouterModule } from '@angular/router';
import { CommonLayoutComponent } from './layout/common-layout/common-layout.component';
import { SecuredLayoutComponent } from './layout/secured-layout/secured-layout.component';
import { ModalComponent } from './component/modal/modal.component';
import { DateDiffPipe } from './pipe/date-diff.pipe';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { BaseModalComponent } from './component/base-modal/base-modal.component';
import { GenericToastPromptComponent } from './component/toast-prompt/generic-toast-prompt.component';
import { NotificationPromptComponent } from './component/toast-prompt/notification-prompt/notification-prompt.component';
import { PwaInstallPromptComponent } from './component/toast-prompt/pwa-install-prompt/pwa-install-prompt.component';
import { NotificationBellComponent } from './component/notification-bell/notification-bell.component';
import { ClickOutsideDirective } from './directive/click-outside.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ShowAuthedDirective,
    PageTitleComponent,
    NotificationModalComponent,
    SnackComponent,
    CommonLayoutComponent,
    SecuredLayoutComponent,
    ModalComponent,
    DateDiffPipe,
    BaseModalComponent,
    GenericToastPromptComponent,
    NotificationPromptComponent,
    PwaInstallPromptComponent,
    NotificationBellComponent,
    ClickOutsideDirective,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    AuthModule.forRoot(environment.auth_config),
    MatDialogModule,
    ApiClientModule.forRoot({
      rootUrl: environment.api_base_url2
    }),
    NgHttpLoaderModule.forRoot(),
    RouterModule,
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
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorIntercepterService,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthHttpInterceptor,
      multi: true
    },
  ]
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error(
        'CoreModule is already loaded. Import it in the AppModule only.');
    }
  }
}
