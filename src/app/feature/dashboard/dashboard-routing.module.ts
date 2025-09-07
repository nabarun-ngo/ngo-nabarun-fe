import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecuredDashboardComponent } from './secured-dashboard/secured-dashboard.component';
import { NeedHelpComponent } from './need-help/need-help.component';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { helpResolver } from './dashboard.resolver';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_dashboard_page.path,
    component: SecuredDashboardComponent
  },
  {
    path: route_data.secured_dashboard_help_page.path,
    component: NeedHelpComponent,
    resolve:{
      data: helpResolver,
    }  
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
