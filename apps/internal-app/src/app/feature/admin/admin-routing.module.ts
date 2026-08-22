import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { AdminHubComponent } from './admin-hub/admin-hub.component';
import { ApiKeyDashboardComponent } from './platform/api-keys/page/api-key-dashboard.component';
import { NotificationDashboardComponent } from './platform/notifications/page/notification-dashboard.component';
import { CronJobDashboardComponent } from './platform/cron-jobs/page/cron-job-dashboard.component';
import { QueueJobDashboardComponent } from './platform/background-jobs/page/queue-job-dashboard.component';
import { OAuthTokenDashboardComponent } from './platform/oauth/page/oauth-token-dashboard.component';
import { RoleCatalogDashboardComponent } from './governance/roles/page/role-catalog-dashboard.component';
import { CustomFormsConsoleComponent } from './builders/custom-forms/page/custom-forms-console.component';
import { JsonStoreEditorComponent } from './json-store/page/json-store-editor.component';
import { JsonStoreNsRedirectComponent } from './json-store/page/json-store-ns-redirect.component';

const route_data = AppRoute;

const routes: Routes = [
  { path: route_data.secured_admin_hub_page.path, component: AdminHubComponent },
  { path: route_data.secured_admin_dashboard_page.path, redirectTo: '', pathMatch: 'full' },
  { path: route_data.secured_admin_api_keys_page.path, component: ApiKeyDashboardComponent },
  { path: route_data.secured_admin_notifications_page.path, component: NotificationDashboardComponent },
  { path: route_data.secured_admin_cron_jobs_page.path, component: CronJobDashboardComponent },
  { path: route_data.secured_admin_jobs_page.path, component: QueueJobDashboardComponent },
  { path: route_data.secured_admin_oauth_page.path, component: OAuthTokenDashboardComponent },
  { path: route_data.secured_admin_roles_page.path, component: RoleCatalogDashboardComponent },
  { path: route_data.secured_admin_json_store_page.path, component: JsonStoreEditorComponent },
  { path: route_data.secured_admin_master_data_page.path, component: JsonStoreNsRedirectComponent },
  { path: route_data.secured_admin_links_page.path, component: JsonStoreNsRedirectComponent, data: { namespace: 'links' } },
  { path: route_data.secured_admin_help_portal_page.path, component: JsonStoreNsRedirectComponent, data: { namespace: 'help-portal' } },
  { path: route_data.secured_admin_email_templates_page.path, component: JsonStoreNsRedirectComponent, data: { namespace: 'correspondence' } },
  { path: route_data.secured_admin_public_site_page.path, component: JsonStoreNsRedirectComponent, data: { namespace: 'public-site' } },
  { path: route_data.secured_admin_custom_forms_page.path, component: CustomFormsConsoleComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AdminRoutingModule {}
