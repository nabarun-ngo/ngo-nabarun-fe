import { Component, ViewChild } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { AdminConstant, AdminDefaultValue, adminTabs } from '../admin.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AdminApikeyTabComponent } from './admin-apikey-tab/admin-apikey-tab.component';
import { AdminServiceTabComponent } from './admin-service-tab/admin-service-tab.component';
import { AdminGlobalConfigTabComponent } from './admin-global-config-tab/admin-global-config-tab.component';
import { AdminOauthTabComponent } from './admin-oauth-tab/admin-oauth-tab.component';
import { AdminBgJobsTabComponent } from './admin-bg-jobs-tab/admin-bg-jobs-tab.component';
import { AdminService } from '../admin.service';
import { KeyValueDto } from 'src/app/core/api-client/models';

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
  @ViewChild(AdminServiceTabComponent) serviceTab!: AdminServiceTabComponent;
  @ViewChild(AdminGlobalConfigTabComponent) configTab!: AdminGlobalConfigTabComponent;
  @ViewChild(AdminOauthTabComponent) oauthTab!: AdminOauthTabComponent;
  @ViewChild(AdminBgJobsTabComponent) jobTab!: AdminBgJobsTabComponent;

  defaultValue = AdminDefaultValue;
  constant = AdminConstant;
  protected tabMapping: adminTabs[] = ['api_keys', 'global_config', 'oauth', 'jobs'];
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
      global_config: this.configTab,
      oauth: this.oauthTab,
      jobs: this.jobTab,
      service_list: this.serviceTab,
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
}
