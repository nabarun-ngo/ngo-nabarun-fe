import { Component, ViewChild } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { AdminConstant, AdminDefaultValue, adminTabs } from '../admin.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AdminApikeyTabComponent } from './admin-apikey-tab/admin-apikey-tab.component';
import { AdminOauthTabComponent } from './admin-oauth-tab/admin-oauth-tab.component';
import { AdminBgJobsTabComponent } from './admin-bg-jobs-tab/admin-bg-jobs-tab.component';
import { AdminService } from '../admin.service';
import { KeyValueDto } from 'src/app/core/api-client/models';
import { AdminTasksTabComponent } from './admin-tasks-tab/admin-tasks-tab.component';
import { AdminCronJobTabComponent } from './admin-cron-job-tab/admin-cron-job-tab.component';
import { AdminCronTriggerTabComponent } from './admin-cron-trigger-tab/admin-cron-trigger-tab.component';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent extends StandardTabbedDashboard<adminTabs, any> {

  /**
     * Declariring variables
     */
  @ViewChild(AdminApikeyTabComponent) apiKeyTab!: AdminApikeyTabComponent;
  @ViewChild(AdminOauthTabComponent) oauthTab!: AdminOauthTabComponent;
  @ViewChild(AdminBgJobsTabComponent) jobTab!: AdminBgJobsTabComponent;
  @ViewChild(AdminTasksTabComponent) taskTab!: AdminTasksTabComponent;
  @ViewChild(AdminCronJobTabComponent) cronJobTab!: AdminCronJobTabComponent;
  @ViewChild(AdminCronTriggerTabComponent) crontriggerTab!: AdminCronTriggerTabComponent;

  defaultValue = AdminDefaultValue;
  constant = AdminConstant;
  protected tabMapping: adminTabs[] = ['api_keys', 'oauth', 'tasks', 'bg_jobs'];
  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  appLinks: KeyValueDto[] = [];

  constructor(
    private sharedDataService: SharedDataService,
    public override route: ActivatedRoute,
    private adminService: AdminService
  ) {
    super(route);
  }

  protected override get tabComponents(): { [tab in adminTabs]: TabComponentInterface } {
    return {
      api_keys: this.apiKeyTab,
      oauth: this.oauthTab,
      bg_jobs: this.jobTab,
      tasks: this.taskTab,
      cron_jobs: this.cronJobTab,
      cron_trigger: this.crontriggerTab
    };
  }
  protected override get defaultTab(): adminTabs {
    return this.defaultValue.tabName as adminTabs;
  }

  protected override onInitHook(): void {
    this.sharedDataService.setPageName(this.defaultValue.pageTitle);
    this.adminService.getAppLinks().subscribe(m => {
      this.appLinks = m;
    });
  }

  protected override onTabChangedHook(): void {
  }

  protected override onAfterViewInitHook(): void {
    this.getActiveComponent(this.getCurrentTab())?.loadData();
  }
}
