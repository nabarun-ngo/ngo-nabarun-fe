import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SecuredDashboardComponent } from './secured-dashboard/secured-dashboard.component';
import { NeedHelpComponent } from './need-help/need-help.component';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { helpResolver } from './dashboard.resolver';
import { DocumentViewerComponent } from './document-viewer/document-viewer.component';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_dashboard_page.path,
    component: SecuredDashboardComponent,
    pathMatch: 'full'
  },
  {
    path: route_data.secured_dashboard_help_page.path,
    component: NeedHelpComponent,
    resolve: {
      data: helpResolver,
    }
  },
  {
    path: route_data.secured_dashboard_help_viewer_page.path,
    component: DocumentViewerComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
