import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MainRoutingModule } from './main-routing.module';
import { LoginCallbackComponent } from './page/login-callback.component';
import { LoginComponent } from './page/login.component';
import { SharedModule } from 'src/app/shared/shared.module';
 

@NgModule({
  declarations: [
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
