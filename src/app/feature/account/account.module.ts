import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountDashboardComponent } from './account-dashboard/account-dashboard.component';
import { AccountTransactionComponent } from './account-transaction/account-transaction.component';
import { AccountRoutingModule } from './account-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ManageExpenseTabComponent } from './manage-account/manage-expense-tab/manage-expense-tab.component';
import { MyAccountsTabComponent } from './account-dashboard/my-accounts-tab/my-accounts-tab.component';
import { MyExpensesTabComponent } from './account-dashboard/my-expenses-tab/my-expenses-tab.component';
import { ManageAccountsTabComponent } from './manage-account/manage-accounts-tab/manage-accounts-tab.component';
import { ManageAccountComponent } from './manage-account/manage-account.component';



@NgModule({
  declarations: [
    AccountDashboardComponent,
    AccountTransactionComponent,
    ManageExpenseTabComponent,
    MyAccountsTabComponent,
    ManageAccountsTabComponent,
    MyExpensesTabComponent,
    ManageAccountComponent,
  ],
  imports: [
    CommonModule,
    AccountRoutingModule,
    SharedModule
  ]
})
export class AccountModule { }
