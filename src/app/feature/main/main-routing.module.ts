import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { WelcomeComponent } from './welcome-page/welcome.component';
import { LoginCallbackComponent } from './login-page/login-callback.component';
import { LoginComponent } from './login-page/login.component';

const route_data = AppRoute;

const routes: Routes = [
  // {
  //   path: route_data.welcome_page.path,
  //   component: WelcomeComponent
  // },
  {
    path: route_data.welcome_page.path,
    redirectTo:route_data.login_page.url,
    pathMatch:'full'
  },
  {
    path: route_data.login_page.path,
    component: LoginComponent
  },
  {
    path:route_data.login_callback_page.path,
    component: LoginCallbackComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
