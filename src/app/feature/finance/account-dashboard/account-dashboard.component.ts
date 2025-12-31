import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { AccountDefaultValue, accountTab } from '../finance.const';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { accountSearchInput } from '../fields/account.field';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { MyAccountsTabComponent } from './my-accounts-tab/my-accounts-tab.component';
import { ManageAccountsTabComponent } from './manage-accounts-tab/manage-accounts-tab.component';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { PagedAccounts } from '../model';
import { AccountService } from '../service/account.service';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { User } from '../../member/models/member.model';

@Component({
  selector: 'app-account-dashboard',
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss'],
})
export class AccountDashboardComponent extends StandardTabbedDashboard<accountTab, PagedAccounts> {

  @ViewChild(MyAccountsTabComponent) myAccountsTab!: MyAccountsTabComponent;
  @ViewChild(ManageAccountsTabComponent) manageAccountsTab!: ManageAccountsTabComponent;

  /**
   * Declaring variables
   */
  protected permissions!: {
    canManageAccounts: boolean;
  };
  protected navigations: NavigationButtonModel[] = [

    // {
    //   displayName: 'Visit Expenses',
    //   routerLink: AppRoute.secured_manage_account_page.url,
    // },
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
    // {
    //   displayName: 'Visit Donations',
    //   routerLink: AppRoute.secured_donation_dashboard_page.url,
    // }
  ];

  /**
   * Overriding variables from StandardTabbedDashboard
   */
  protected tabMapping: accountTab[] = ['my_accounts', 'all_accounts'];
  protected searchInput!: SearchAndAdvancedSearchModel;

  protected override get tabComponents(): { [key in accountTab]?: TabComponentInterface<PagedAccounts> } {
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
    private identityService: UserIdentityService,
    private accountService: AccountService
  ) { super(route); }

  protected override onInitHook(): void {
    this.searchInput = this.getSearchInput();
    this.sharedDataService.setPageName(AccountDefaultValue.pageTitle);

    // Setup permissions
    this.permissions = {
      canManageAccounts: this.identityService.isAccrediatedToAny(
        SCOPE.update.account,
        SCOPE.create.account,
        SCOPE.read.transactions
      ),
    };
  }

  protected override onTabChangedHook(): void {
    this.searchInput = this.getSearchInput();

    if (this.getCurrentTab() == 'all_accounts') {
      this.accountService.fetchUsers().subscribe((data) => {
        this.searchInput.advancedSearch!.searchFormFields.find(f => f.inputModel.html_id == 'account_Owner')!
          .inputModel.selectList = data.map((m: User) => {
            return { key: m.id, displayValue: m.fullName } as KeyValue;
          });
      });
    }
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
