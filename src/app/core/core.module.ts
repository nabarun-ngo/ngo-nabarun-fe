import { NgModule, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { OAuthModule } from 'angular-oauth2-oidc';
import { HeaderComponent } from './component/header/header.component';
import { FooterComponent } from './component/footer/footer.component';
import { ShowAuthedDirective } from './directive/show-authed.directive';
import { PageTitleComponent } from './component/page-title/page-title.component';
import { MatDialogModule } from '@angular/material/dialog';
import { NotificationModalComponent } from './component/notification-modal/notification-modal.component';
import { environment } from 'src/environments/environment';
import { ApiModule } from './api/api.module';
import { HttpErrorIntercepterService } from './intercepter/http-error-intercepter.service';
import { NgHttpLoaderModule } from 'ng-http-loader';
import { RouterModule } from '@angular/router';
import { CommonLayoutComponent } from './layout/common-layout/common-layout.component';
import { SecuredLayoutComponent } from './layout/secured-layout/secured-layout.component';
import { ModalComponent } from './component/modal/modal.component';
import { DateDiffPipe } from './pipe/date-diff.pipe';



@NgModule({
  declarations: [
    HeaderComponent,
    FooterComponent,
    ShowAuthedDirective,
    PageTitleComponent,
    NotificationModalComponent,
    CommonLayoutComponent,
    SecuredLayoutComponent,
    ModalComponent,
    DateDiffPipe,    
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    OAuthModule.forRoot({
      resourceServer:{
        sendAccessToken:true,
        allowedUrls:[environment.api_base_url]
      }
    }),
    MatDialogModule,
    ApiModule.forRoot({
      rootUrl : environment.api_base_url
    }),
    NgHttpLoaderModule.forRoot(),
    RouterModule,
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

