import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { AdminHubComponent } from './admin-hub/admin-hub.component';
import { ApiKeyDashboardComponent } from './platform/api-keys/page/api-key-dashboard.component';
import { NotificationDashboardComponent } from './platform/notifications/page/notification-dashboard.component';
import { CronJobDashboardComponent } from './platform/cron-jobs/page/cron-job-dashboard.component';
import { QueueJobDashboardComponent } from './platform/background-jobs/page/queue-job-dashboard.component';
import { OAuthTokenDashboardComponent } from './platform/oauth/page/oauth-token-dashboard.component';
import { RoleCatalogDashboardComponent } from './governance/roles/page/role-catalog-dashboard.component';
import { CustomFormsConsoleComponent } from './builders/custom-forms/page/custom-forms-console.component';
import { provideApiKeyDataSource } from './platform/api-keys/data/api-key.providers';
import { provideNotificationDataSource } from './platform/notifications/data/notification.providers';
import { provideCronJobDataSource } from './platform/cron-jobs/data/cron-job.providers';
import { provideQueueJobDataSource } from './platform/background-jobs/data/queue-job.providers';
import { provideRoleCatalogDataSource } from './governance/roles/data/role-catalog.providers';
import { provideOAuthTokenDataSource } from './platform/oauth/data/oauth-token.providers';
import { provideCustomFormsDataSource } from './builders/custom-forms/data/custom-forms.providers';

@NgModule({
  declarations: [AdminHubComponent],
  imports: [
    CommonModule,
    AdminRoutingModule,
    SharedModule,
    ApiKeyDashboardComponent,
    NotificationDashboardComponent,
    CronJobDashboardComponent,
    QueueJobDashboardComponent,
    OAuthTokenDashboardComponent,
    RoleCatalogDashboardComponent,
    CustomFormsConsoleComponent,
  ],
  providers: [
    ...provideApiKeyDataSource(),
    ...provideNotificationDataSource(),
    ...provideCronJobDataSource(),
    ...provideQueueJobDataSource(),
    ...provideOAuthTokenDataSource(),
    ...provideRoleCatalogDataSource(),
    ...provideCustomFormsDataSource(),
  ],
})
export class AdminModule {}
