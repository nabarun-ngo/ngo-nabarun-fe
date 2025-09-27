import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { AccountService } from '../account.service';
import { AccountDefaultValue, accountTab } from '../account.const';
import {
  AccountDetail,
  KeyValue,
  PaginateAccountDetail,
} from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { accountSearchInput } from '../account.field';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { removeNullFields } from 'src/app/core/service/utilities.service';
import { MyAccountsTabComponent } from './my-accounts-tab/my-accounts-tab.component';
import { ManageAccountsTabComponent } from './manage-accounts-tab/manage-accounts-tab.component';
import { SearchEvent, TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
@Component({
  selector: 'app-account-dashboard',
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss'],
})
export class AccountDashboardComponent extends StandardTabbedDashboard<accountTab, PaginateAccountDetail> {

  @ViewChild(MyAccountsTabComponent) myAccountsTab!: MyAccountsTabComponent;
  @ViewChild(ManageAccountsTabComponent) manageAccountsTab!: ManageAccountsTabComponent;

  protected AppRoute = AppRoute;
  protected permissions!: {
    canManageAccounts: boolean;
  };
  
  protected tabMapping: accountTab[] = ['my_accounts', 'all_accounts'];
  
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];
  
  protected searchInput!: SearchAndAdvancedSearchModel;

  // Implement abstract properties
  protected get tabComponents(): { [key in accountTab]?: TabComponentInterface<PaginateAccountDetail> } {
    return {
      my_accounts: this.myAccountsTab,
      all_accounts: this.manageAccountsTab
    };
  }

  protected get defaultTab(): accountTab {
    return this.tabMapping[0]; // 'my_accounts'
  }

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
    private identityService: UserIdentityService
  ) {
    super(route);
    this.sharedDataService.setPageName(AccountDefaultValue.pageTitle);

    // Setup permissions
    this.permissions = {
      canManageAccounts: this.identityService.isAccrediatedToAny(
        SCOPE.create.expense_final,
        SCOPE.create.expense_settle,
        SCOPE.create.account
      ),
    };
  }

  protected override onHandleRouteData(): void {
    // Set reference data in shared service
    if (this.refData) {
      this.sharedDataService.setRefData('ACCOUNT', this.refData);
    }

    // Initialize search input
    this.searchInput = this.getSearchInput();
  }

  protected override onTabChangedHook(): void {
    // Update search input for the new tab
    this.searchInput = this.getSearchInput();
    
    // Trigger data loading for the active tab (lazy loading)
    this.triggerTabDataLoad();
  }

  private getSearchInput(): SearchAndAdvancedSearchModel {
    return accountSearchInput(this.tabMapping[this.tabIndex], this.refData!);
  }

  onSearch(event: SearchEvent): void {
    // Forward search to the active tab component
    this.forwardSearchToActiveTab(event);
  }

  /**
   * Get the current active tab type based on tabIndex
   */
  private get currentTab(): accountTab {
    return this.tabMapping[this.tabIndex];
  }

  /**
   * Check if current tab is my accounts
   */
  private get isMyAccountsTab(): boolean {
    return this.currentTab === 'my_accounts';
  }

  /**
   * Check if current tab is manage accounts  
   */
  private get isManageAccountsTab(): boolean {
    return this.currentTab === 'all_accounts';
  }

  /**
   * Get initial data for a specific tab from resolver data
   * Returns data only if resolver data matches the requested tab
   */
  override getInitialDataForTab(tabType: accountTab): PaginateAccountDetail | undefined {
    return super.getInitialDataForTab(tabType);
  }

  /**
   * Trigger data loading for the currently active tab
   */
  private triggerTabDataLoad(): void {
    // Use setTimeout to ensure ViewChild components are ready
    setTimeout(() => {
      if (this.isMyAccountsTab && this.myAccountsTab) {
        this.myAccountsTab.triggerDataLoad();
      } else if (this.isManageAccountsTab && this.manageAccountsTab) {
        this.manageAccountsTab.triggerDataLoad();
      }
    });
  }

}
