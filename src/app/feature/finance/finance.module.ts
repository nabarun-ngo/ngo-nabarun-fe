import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountDashboardComponent } from './account-dashboard/account-dashboard.component';
import { AccountTransactionComponent } from './account-transaction/account-transaction.component';
import { FinanceRoutingModule } from './finance-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ManageExpenseTabComponent } from './expense-dashboard/manage-expense-tab/manage-expense-tab.component';
import { MyAccountsTabComponent } from './account-dashboard/my-accounts-tab/my-accounts-tab.component';
import { MyExpensesTabComponent } from './expense-dashboard/my-expenses-tab/my-expenses-tab.component';
import { ExpenseDashboardComponent } from './expense-dashboard/expense-dashboard.component';
import { ManageAccountsTabComponent } from './account-dashboard/manage-accounts-tab/manage-accounts-tab.component';
import { TransactionAccordionComponent } from './account-transaction/transaction-accordion/transaction-accordion.component';
import { DonationDashboardComponent } from './donation-dashboard/donation-dashboard.component';
import { SelfDonationTabComponent } from './donation-dashboard/self-donation-tab/self-donation-tab.component';
import { GuestDonationTabComponent } from './donation-dashboard/guest-donation-tab/guest-donation-tab.component';
import { MemberDonationTabComponent } from './donation-dashboard/member-donation-tab/member-donation-tab.component';



@NgModule({
  declarations: [
    AccountDashboardComponent,
    AccountTransactionComponent,
    ManageExpenseTabComponent,
    MyAccountsTabComponent,
    ManageAccountsTabComponent,
    MyExpensesTabComponent,
    ExpenseDashboardComponent,
    TransactionAccordionComponent,
    DonationDashboardComponent,
    SelfDonationTabComponent,
    GuestDonationTabComponent,
    MemberDonationTabComponent,
  ],
  imports: [
    CommonModule,
    FinanceRoutingModule,
    SharedModule
  ]
})
export class FinanceModule { }
