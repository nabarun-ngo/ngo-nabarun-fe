import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountDashboardComponent } from './account-dashboard/account-dashboard.component';
import { AccountTransactionComponent } from './account-transaction/account-transaction.component';
import { AccountRoutingModule } from './account-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExpenseTabComponent } from './account-dashboard/expense-tab/expense-tab.component';



@NgModule({
  declarations: [
    AccountDashboardComponent,
    AccountTransactionComponent,
    ExpenseTabComponent,
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    SharedModule
  ]
})
export class AccountModule { }
