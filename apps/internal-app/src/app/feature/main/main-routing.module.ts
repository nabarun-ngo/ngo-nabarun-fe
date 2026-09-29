import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { BYPASS_AUTH } from 'src/environments/environment';
import { LoginCallbackComponent } from './page/login-callback.component';
import { LoginComponent } from './page/login.component';

const route_data = AppRoute;
const dashboardUrl = route_data.secured_dashboard_page.url;

const bypassRoutes: Routes = [
  {
    path: route_data.welcome_page.path,
    redirectTo: dashboardUrl,
    pathMatch: 'full',
  },
  {
    path: route_data.login_page.path,
    redirectTo: dashboardUrl,
    pathMatch: 'full',
  },
  {
    path: route_data.login_callback_page.path,
    redirectTo: dashboardUrl,
    pathMatch: 'full',
  },
];

const productionRoutes: Routes = [
  {
    path: route_data.welcome_page.path,
    redirectTo: route_data.login_page.url,
    pathMatch: 'full',
  },
  {
    path: route_data.login_page.path,
    component: LoginComponent,
  },
  {
    path: route_data.login_callback_page.path,
    component: LoginCallbackComponent,
  },
];

const routes: Routes = BYPASS_AUTH ? bypassRoutes : productionRoutes;

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
