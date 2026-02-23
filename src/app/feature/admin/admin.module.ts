import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminPipe } from './admin.pipe';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminApikeyTabComponent } from './admin-dashboard/admin-apikey-tab/admin-apikey-tab.component';
import { AdminOauthTabComponent } from './admin-dashboard/admin-oauth-tab/admin-oauth-tab.component';
import { AdminBgJobsTabComponent } from './admin-dashboard/admin-bg-jobs-tab/admin-bg-jobs-tab.component';
import { AdminTasksTabComponent } from './admin-dashboard/admin-tasks-tab/admin-tasks-tab.component';
import { AdminCronJobTabComponent } from './admin-dashboard/admin-cron-job-tab/admin-cron-job-tab.component';
import { AdminCronTriggerTabComponent } from './admin-dashboard/admin-cron-trigger-tab/admin-cron-trigger-tab.component';


@NgModule({
  declarations: [
    AdminPipe,
    AdminDashboardComponent,
    AdminApikeyTabComponent,
    AdminOauthTabComponent,
    AdminBgJobsTabComponent,
    AdminTasksTabComponent,
    AdminCronJobTabComponent,
    AdminCronTriggerTabComponent,
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
  ]
})
export class AdminModule { }
