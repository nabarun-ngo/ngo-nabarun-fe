import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { AccountDefaultValue, accountTab } from '../account.const';
import { PaginateAccountDetail} from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { accountSearchInput } from '../account.field';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
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

  /**
   * Declaring variables
   */
  protected permissions!: {
    canManageAccounts: boolean;
  };
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];
  
  /**
   * Overriding variables from StandardTabbedDashboard
   */
  protected tabMapping: accountTab[] = ['my_accounts', 'all_accounts'];
  protected searchInput!: SearchAndAdvancedSearchModel;

  protected get tabComponents(): { [key in accountTab]?: TabComponentInterface<PaginateAccountDetail> } {
    return {
      my_accounts: this.myAccountsTab,
      all_accounts: this.manageAccountsTab
    };
  }

  protected get defaultTab(): accountTab {
    return AccountDefaultValue.tabName as accountTab;
  }

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
    private identityService: UserIdentityService
  ) {super(route);}

  protected override onInitHook(): void {
    this.searchInput = this.getSearchInput();
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

  protected override onTabChangedHook(): void {
    this.searchInput = this.getSearchInput();
  }

  private getSearchInput(): SearchAndAdvancedSearchModel {
    return accountSearchInput(this.getCurrentTab(), this.refData!);
  }

  onSearch(event: SearchEvent): void {
    // Forward search to the active tab component
    //i.e., MyAccountsTabComponent or ManageAccountsTabComponent
    this.forwardSearchToActiveTab(event);
  }

}
