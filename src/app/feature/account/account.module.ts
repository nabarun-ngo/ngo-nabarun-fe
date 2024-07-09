import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountDashboardComponent } from './account-dashboard/account-dashboard.component';
import { AccountTransactionComponent } from './account-transaction/account-transaction.component';
import { AccountRoutingModule } from './account-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { MyAccountTabComponent } from './my-account-tab/my-account-tab.component';
import { AllAccountTabComponent } from './all-account-tab/all-account-tab.component';



@NgModule({
  declarations: [
    AccountDashboardComponent,
    AccountTransactionComponent,
    MyAccountTabComponent,
    AllAccountTabComponent
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    SharedModule
  ]
})
export class AccountModule { }
