import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { AccountService } from '../account.service';
import { AccountDefaultValue, accountTab } from '../account.const';
import {
  KeyValue,
  PaginateAccountDetail,
  PaginateExpenseDetail,
} from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { accountSearchInput } from '../account.field';
import { TabbedPage } from 'src/app/shared/utils/tab';
import { expenseSearchInput } from '../expense.field';
import { removeNullFields } from 'src/app/core/service/utilities.service';
@Component({
  selector: 'app-account-dashboard',
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss'],
})
export class AccountDashboardComponent extends TabbedPage<accountTab> {
  protected AppRoute = AppRoute;
  protected permissions!: {
    canManageAccounts: boolean;
  };
  protected expenseList!: PaginateExpenseDetail;
  protected accountList!: PaginateAccountDetail;
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;
  private refData: any;

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
    private accountService: AccountService,
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

  override handleRouteData(): void {
    if (this.route.snapshot.data['data']) {
      this.accountList = this.route.snapshot.data[
        'data'
      ] as PaginateAccountDetail;
    }
    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
    }
    this.searchInput = accountSearchInput('my_accounts', this.refData);
  }

  protected tabMapping: accountTab[] = ['my_accounts', 'my_expenses'];
  protected override onTabChanged(): void {
    if (this.tabMapping[this.tabIndex] == 'my_accounts') {
      this.searchInput = accountSearchInput('my_accounts', this.refData);
      this.accountService
        .fetchMyAccounts(
          AccountDefaultValue.pageNumber,
          AccountDefaultValue.pageSize
        )
        .subscribe((s) => {
          this.accountList = s!;
        });
    } else if (this.tabMapping[this.tabIndex] == 'my_expenses') {
      this.searchInput = expenseSearchInput(this.tabMapping[this.tabIndex],this.refData);
      this.accountService
        .fetchMyExpenses(
          AccountDefaultValue.pageNumber,
          AccountDefaultValue.pageSize,
          {}
        )
        .subscribe((s) => {
          this.expenseList = s!;
        });
    }
  }

  onSearch($event: {
    advancedSearch: boolean;
    reset: boolean;
    value: any;
  }) {
    if ($event.advancedSearch && !$event.reset) {
      console.log($event.value);
      if (this.tabMapping[this.tabIndex] == 'my_accounts') {
        this.accountService
        .fetchMyAccounts(undefined, undefined, $event.value)
        .subscribe((s) => {
          this.accountList = s!;
        });
      }
      else if (this.tabMapping[this.tabIndex] == 'my_expenses') {
        this.accountService
        .fetchMyExpenses(undefined, undefined, removeNullFields($event.value))
        .subscribe((s) => {
          this.expenseList = s!;
        });
      }
    } else if ($event.advancedSearch && $event.reset) {
      this.onTabChanged();
    } 
  }
}
