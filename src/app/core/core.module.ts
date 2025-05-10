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
import { ApiModule } from './api/api.module';
import { HttpErrorIntercepterService } from './intercepter/http-error-intercepter.service';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { RouterModule } from '@angular/router';
import { CommonLayoutComponent } from './layout/common-layout/common-layout.component';
import { SecuredLayoutComponent } from './layout/secured-layout/secured-layout.component';
import { ModalComponent } from './component/modal/modal.component';
import { DateDiffPipe } from './pipe/date-diff.pipe';
import {MatSnackBarModule} from '@angular/material/snack-bar';
import { MatNativeDateModule } from '@angular/material/core';
import { IonicModule } from '@ionic/angular';
import { AuthHttpInterceptor, AuthModule } from '@auth0/auth0-angular';
import { BaseModalComponent } from './component/base-modal/base-modal.component';



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
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    AuthModule.forRoot(environment.auth_config),
    IonicModule.forRoot(),
    MatDialogModule,
    ApiModule.forRoot({
      rootUrl : environment.api_base_url
    }),
    NgHttpLoaderModule.forRoot(),
    RouterModule,
    MatSnackBarModule,
    MatNativeDateModule,
  ],
  exports:[
    FooterComponent,
    PageTitleComponent,
    NotificationModalComponent,
    CommonLayoutComponent,
    SecuredLayoutComponent,
  ],
  providers:[
    {
      provide: HTTP_INTERCEPTORS,
      useClass: HttpErrorIntercepterService,
      multi: true
  },{
    provide: HTTP_INTERCEPTORS,
    useClass: AuthHttpInterceptor,
    multi: true
  }
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

