import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { AccountDashboardComponent } from './account-dashboard/account-dashboard.component';
import { accountDashboardResolver, accountRefDataResolver, accountTransactionResolver } from './account.resolver';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_account_list_page.path,
    component: AccountDashboardComponent,
    resolve:{
      data:accountDashboardResolver,
      ref_data:accountRefDataResolver
    }
  },
  {
    path: route_data.secured_account_list_page.path,
    component: AccountDashboardComponent,
    resolve:{
      data:accountTransactionResolver,
      ref_data:accountRefDataResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule { }
