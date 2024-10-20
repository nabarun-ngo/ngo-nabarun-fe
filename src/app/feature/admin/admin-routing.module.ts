import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { adminDashboardResolver, adminRefData } from './admin.resolver';

const route_data = AppRoute;
const routes: Routes = [
  {
    path: route_data.secured_admin_dashboard_page.path,
    component: AdminDashboardComponent,
    resolve:{
      data:adminDashboardResolver,
      ref_data:adminRefData
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
