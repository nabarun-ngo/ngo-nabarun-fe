import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceRoutingModule } from './finance-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { ExpenseDashboardComponent } from './expense/page/expense-dashboard.component';
import { DonorDashboardComponent } from './donors/page/donor-dashboard.component';
import { EarningDashboardComponent } from './earning/page/earning-dashboard.component';
import { FinanceHubComponent } from './finance-hub/finance-hub.component';
import { SharedFormsModule } from 'src/app/shared/modules/forms.module';
import { AccountDashboardComponent } from './accounts/page/account-dashboard/account-dashboard.component';
import { AccountTransactionsComponent } from './accounts/page/account-transactions/account-transactions.component';
import {
  provideExpenseDataSource,
  provideAccountDataSource,
  provideEarningDataSource,
  provideDonorDataSource,
} from './finance.providers';

@NgModule({
  declarations: [
    FinanceHubComponent,
  ],
  imports: [
    CommonModule,
    ExpenseDashboardComponent,
    DonorDashboardComponent,
    EarningDashboardComponent,
    AccountDashboardComponent,
    AccountTransactionsComponent,
    FinanceRoutingModule,
    SharedModule,
    SharedFormsModule,
  ],
  providers: [
    ...provideExpenseDataSource(),
    ...provideAccountDataSource(),
    ...provideEarningDataSource(),
    ...provideDonorDataSource(),
  ],
})
export class FinanceModule { }
