import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard, noAuthGuard } from '@nabarun-ngo/auth-angular';
import { BYPASS_AUTH } from '../environments/environment';
import { AppRoute } from './core/constant/app-routing.const';
import { CommonLayoutComponent } from './core/shell/layout/common-layout/common-layout.component';
import { SecuredLayoutComponent } from './core/shell/layout/secured-layout/secured-layout.component';
import { userGuard } from './core/auth/guards/user-auth.guards';

const route_data = AppRoute;
const publicRouteGuards = BYPASS_AUTH ? [] : [noAuthGuard];
const securedRouteGuards = BYPASS_AUTH ? [] : [authGuard, userGuard];

const routes: Routes = [
  {
    path: route_data.welcome_page.parent,
    component: CommonLayoutComponent,
    children: [
      {
        path: route_data.welcome_page.feature,
        loadChildren: () => import('./feature/main/main.module').then(m => m.MainModule),
      },
    ],
    ...(publicRouteGuards.length ? { canActivate: publicRouteGuards } : {}),
  },
  {
    path: route_data.secured_dashboard_page.parent,
    component: SecuredLayoutComponent,
    children: [
      {
        path: route_data.secured_dashboard_page.feature,
        loadChildren: () => import('./feature/dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: route_data.secured_member_members_page.feature,
        loadChildren: () => import('./feature/member/member.module').then(m => m.MemberModule),
      },
      {
        path: route_data.secured_request_list_page.feature,
        loadChildren: () => import('./feature/workflow/workflow.module').then(m => m.WorkflowModule),
      },

      {
        path: route_data.secured_account_list_page.feature,
        loadChildren: () => import('./feature/finance/finance.module').then(m => m.FinanceModule),
      },
      {
        path: route_data.secured_admin_dashboard_page.feature,
        loadChildren: () => import('./feature/admin/admin.module').then(m => m.AdminModule),
      },
      {
        path: route_data.secured_project_list_page.feature,
        loadChildren: () => import('./feature/project/project.module').then(m => m.ProjectModule),
      },
      {
        path: route_data.secured_meetings_list_page.feature,
        loadChildren: () => import('./feature/communication/communication.module').then(m => m.CommunicationModule),
      },
      {
        path: route_data.secured_assets_hub_page.feature,
        loadChildren: () => import('./feature/assets/assets.module').then(m => m.AssetsModule),
      },
      {
        path: route_data.secured_help_home_page.feature,
        loadChildren: () => import('./feature/help/help.module').then(m => m.HelpModule),
      },
    ],
    ...(securedRouteGuards.length ? { canActivate: securedRouteGuards, runGuardsAndResolvers: 'always' as const } : {}),
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
