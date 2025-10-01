import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { RequestDefaultValue, requestTab } from '../request.const';
import { PaginateRequestDetail } from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { MyRequestsTabComponent } from './my-requests-tab/my-requests-tab.component';
import { DelegatedRequestsTabComponent } from './delegated-requests-tab/delegated-requests-tab.component';
import { requestSearchInput } from '../request.field';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';

@Component({
  selector: 'app-request-dashboard',
  templateUrl: './request-dashboard.component.html',
  styleUrls: ['./request-dashboard.component.scss'],
})
export class RequestDashboardComponent extends StandardTabbedDashboard<requestTab, PaginateRequestDetail> {

  @ViewChild(MyRequestsTabComponent) selfRequestTab!: MyRequestsTabComponent;
  @ViewChild(DelegatedRequestsTabComponent) delegatedRequestTab!: DelegatedRequestsTabComponent;

  protected AppRoute = AppRoute;
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;
  protected tabMapping: requestTab[] = ['self_request', 'delegated_request'];

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
  ) {
    super(route);
  }

  protected override onInitHook(): void {
    this.sharedDataService.setPageName(RequestDefaultValue.pageTitle);
    this.searchInput = requestSearchInput(this.getCurrentTab(),this.refData!);
  }

  protected override get tabComponents(): { [key in requestTab]?: TabComponentInterface<PaginateRequestDetail> } {
    return {
      self_request: this.selfRequestTab,
      delegated_request: this.delegatedRequestTab
    };
  }
  protected override get defaultTab(): requestTab {
    return RequestDefaultValue.tabName as requestTab; 
  }

  protected override onTabChangedHook(): void {
    this.searchInput = requestSearchInput(this.getCurrentTab(),this.refData!);
  }

  onSearch($event: SearchEvent) {
    this.forwardSearchToActiveTab($event);
  }
}
