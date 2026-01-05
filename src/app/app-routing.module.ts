import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from './core/constant/app-routing.const';
import { CommonLayoutComponent } from './core/layout/common-layout/common-layout.component';
import { NoAuthGuardService } from './core/guards/no-auth-guard.service';
import { SecuredLayoutComponent } from './core/layout/secured-layout/secured-layout.component';
import { AuthGuardService } from './core/guards/auth-guard.service';
import { UserGuardService } from './core/guards/user-guard.service';

const route_data = AppRoute;

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
    canActivate: [
      NoAuthGuardService
    ]
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
      // {
      //   path: route_data.secured_notice_notices_page.feature,
      //   loadChildren: () => import('./feature/notice/notice.module').then(m => m.NoticeModule),
      // },
      {
        path: route_data.secured_admin_dashboard_page.feature,
        loadChildren: () => import('./feature/admin/admin.module').then(m => m.AdminModule),
      },
      // {
      //   path: route_data.secured_event_list_page.feature,
      //   loadChildren: () => import('./feature/social-event/social-event.module').then(m => m.SocialEventModule),
      // },
    ],
    canActivate: [
      AuthGuardService,
      UserGuardService
    ],
    runGuardsAndResolvers: 'always'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
