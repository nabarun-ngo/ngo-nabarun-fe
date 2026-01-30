import { Component, ViewChild } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { ActivatedRoute } from '@angular/router';
import { PolicyHubTabComponent } from './policy-hub-tab/policy-hub-tab.component';
import { UserGuideTabComponent } from './user-guide-tab/user-guide-tab.component';

type helpTabs = 'policy_hub' | 'user_guide';

@Component({
  selector: 'app-need-help',
  templateUrl: './need-help.component.html',
  styleUrls: ['./need-help.component.scss']
})
export class NeedHelpComponent extends StandardTabbedDashboard<helpTabs, KeyValue[]> {
  protected override tabMapping: helpTabs[] = ['user_guide', 'policy_hub'];

  @ViewChild(PolicyHubTabComponent) policyHubTab!: PolicyHubTabComponent;
  @ViewChild(UserGuideTabComponent) userGuideTab!: UserGuideTabComponent;

  protected AppRoutes = AppRoute;

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];

  constructor(
    private sharedData: SharedDataService,
    protected override route: ActivatedRoute,
  ) { super(route) }

  protected override get tabComponents(): { policy_hub?: TabComponentInterface<KeyValue[]> | undefined; user_guide?: TabComponentInterface<KeyValue[]> | undefined; } {
    return {
      policy_hub: this.policyHubTab,
      user_guide: this.userGuideTab,
    };
  }
  protected override get defaultTab(): helpTabs {
    return 'user_guide';
  }
  protected override onTabChangedHook(): void { }

  protected override onAfterViewInitHook(): void {
    console.log(this.getActiveComponent(this.getCurrentTab()))
    this.getActiveComponent(this.getCurrentTab())?.loadData();
  }


  protected override onInitHook(): void {
    this.sharedData.setPageName('Help & Support');
  }





}
