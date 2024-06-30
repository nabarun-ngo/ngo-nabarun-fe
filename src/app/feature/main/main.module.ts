import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { WelcomeComponent } from './welcome-page/welcome.component';
import { LoginCallbackComponent } from './login-page/login-callback.component';
import { LoginComponent } from './login-page/login.component';
import { SharedModule } from 'src/app/shared/shared.module';


@NgModule({
  declarations: [
    WelcomeComponent,
    LoginCallbackComponent,
    LoginComponent,
  ],
  imports: [
    CommonModule,
    MainRoutingModule,
    SharedModule,
  ]
})
export class MainModule { }
