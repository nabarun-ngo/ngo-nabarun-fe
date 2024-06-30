import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecuredDashboardComponent } from './secured-dashboard/secured-dashboard.component';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_dashboard_page.path,
    component: SecuredDashboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
