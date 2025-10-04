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

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent extends StandardTabbedDashboard<adminTabs> {

  /**
     * Declariring variables
     */
  @ViewChild(AdminApikeyTabComponent) apiKeyTab!: AdminApikeyTabComponent;
  @ViewChild(AdminServiceTabComponent) serviceTab!: AdminServiceTabComponent;
  @ViewChild(AdminGlobalConfigTabComponent) configTab!: AdminGlobalConfigTabComponent;

  defaultValue = AdminDefaultValue;
  constant = AdminConstant;
  protected tabMapping: adminTabs[] = ['service_list', 'api_keys', 'global_config', 'app_logs',];
  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];

  constructor(
    private sharedDataService: SharedDataService,
    public override route: ActivatedRoute,
  ) {
    super(route);
  }

  protected override get tabComponents(): { [tab in adminTabs]: TabComponentInterface } {
    return {
      service_list: this.serviceTab,
      api_keys: this.apiKeyTab,
      app_logs: this.apiKeyTab,
      global_config: this.apiKeyTab,
    };
  }
  protected override get defaultTab(): adminTabs {
    return this.defaultValue.tabName as adminTabs;
  }

  protected override onInitHook(): void {
    this.sharedDataService.setPageName(this.defaultValue.pageTitle);
  }

  protected override onTabChangedHook(): void {
  }
}
