import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { AccountDashboardComponent } from './account-dashboard/account-dashboard.component';
import { accountDashboardResolver, accountInfoResolver, accountRefDataResolver, accountTransactionResolver, donationDashboardResolver, donationDashboardResolverNew, donationRefDataResolverNew, expenseDashboardResolver } from './finance.resolver';
import { AccountTransactionComponent } from './account-transaction/account-transaction.component';
import { ExpenseDashboardComponent } from './expense-dashboard/expense-dashboard.component';
import { DonationDashboardComponent } from './donation-dashboard/donation-dashboard.component';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_account_list_page.path,
    component: AccountDashboardComponent,
    resolve: {
      data: accountDashboardResolver,
      ref_data: accountRefDataResolver
    }
  },
  {
    path: route_data.secured_manage_account_page.path,
    component: ExpenseDashboardComponent,
    resolve: {
      data: expenseDashboardResolver,
      ref_data: accountRefDataResolver
    }
  },
  {
    path: route_data.secured_account_transaction_page.path,
    component: AccountTransactionComponent,
    resolve: {
      data: accountTransactionResolver,
      ref_data: accountRefDataResolver,
      account: accountInfoResolver
    }
  },
  {
    path: route_data.secured_donation_dashboard_page.path,
    component: DonationDashboardComponent,
    resolve: {
      data: donationDashboardResolverNew,
      ref_data: donationRefDataResolverNew,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FinanceRoutingModule { }
