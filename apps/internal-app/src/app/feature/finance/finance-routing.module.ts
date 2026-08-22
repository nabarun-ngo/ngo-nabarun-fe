import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { permissionGuard } from '@nabarun-ngo/auth-angular';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import {
  accountDashboardResolver,
  accountInfoResolver,
  accountRefDataResolver,
  accountTransactionResolver,
  donorRefDataResolverNew,
  expenseRefDataResolverNew,
} from './finance.resolver';
import { AccountDashboardComponent } from './accounts/page/account-dashboard/account-dashboard.component';
import { AccountTransactionsComponent } from './accounts/page/account-transactions/account-transactions.component';
import { ExpenseDashboardComponent } from './expense/page/expense-dashboard.component';
import { DonationDashboardComponent } from './donation/page/donation-dashboard.component';
import { donationRefDataResolver } from './donation/data/donation.resolver';
import { DonorDashboardComponent } from './donors/page/donor-dashboard.component';
import { EarningDashboardComponent } from './earning/page/earning-dashboard.component';
import { earningRefDataResolver } from './earning/data/earning.resolver';
import { FinanceHubComponent } from './finance-hub/finance-hub.component';
import { reportsRoute } from '../reports/reports.routes';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_finance_hub_page.path,
    component: FinanceHubComponent,
  },
  {
    path: route_data.secured_earning_dashboard_page.path,
    component: EarningDashboardComponent,
    resolve: {
      ref_data: earningRefDataResolver,
    },
  },
  {
    path: route_data.secured_account_list_page.path,
    component: AccountDashboardComponent,
    resolve: {
      data: accountDashboardResolver,
      ref_data: accountRefDataResolver,
    },
  },
  {
    path: route_data.secured_account_transaction_page.path,
    component: AccountTransactionsComponent,
    resolve: {
      data: accountTransactionResolver,
      ref_data: accountRefDataResolver,
      account: accountInfoResolver,
    },
  },
  {
    path: route_data.secured_manage_account_page.path,
    component: ExpenseDashboardComponent,
    resolve: {
      ref_data: expenseRefDataResolverNew,
    },
  },
  {
    path: route_data.secured_donation_dashboard_page.path,
    component: DonationDashboardComponent,
    resolve: {
      ref_data: donationRefDataResolver,
    },
  },
  {
    path: route_data.secured_donor_dashboard_page.path,
    component: DonorDashboardComponent,
    canActivate: [permissionGuard(SCOPE.read.donors)],
    resolve: {
      ref_data: donorRefDataResolverNew,
    },
  },
  reportsRoute({
    path: route_data.secured_finance_reports_page.path,
    backTo: route_data.secured_finance_hub_page.url,
    backLabel: 'Finance',
  }),
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FinanceRoutingModule { }
