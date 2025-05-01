import { Component } from '@angular/core';
import { PaginateAccountDetail, PaginateExpenseDetail } from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { AccountDefaultValue, accountTab } from '../account.const';
import { TabbedPage } from 'src/app/shared/utils/tab';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../account.service';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { accountSearchInput } from '../account.field';

@Component({
  selector: 'app-manage-account',
  templateUrl: './manage-account.component.html',
  styleUrls: ['./manage-account.component.scss']
})
export class ManageAccountComponent extends TabbedPage<accountTab> {
  protected permissions!: {
    canViewTransactions: boolean;
    canUpdateAccount: boolean;
    canCreateAccount: boolean;
    canViewAccounts: boolean;
  };
  protected expenseList!: PaginateExpenseDetail;
  protected accountList!: PaginateAccountDetail;
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Accounts & Expense',
      routerLink: AppRoute.secured_account_list_page.url,
    },
  ];
  protected searchInput: SearchAndAdvancedSearchModel= {
    normalSearchPlaceHolder:'Search anything here'
  };
  private refData: any;

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
    private accountService: AccountService,
    private identityService: UserIdentityService
  ) {
    super(route);
    this.sharedDataService.setPageName('Manage '+AccountDefaultValue.pageTitle);

    // Setup permissions
    this.permissions = {
      canViewAccounts: this.identityService.isAccrediatedTo(
        SCOPE.read.accounts
      ),
      canCreateAccount: this.identityService.isAccrediatedTo(
        SCOPE.create.account
      ),
      canUpdateAccount: this.identityService.isAccrediatedTo(
        SCOPE.update.account
      ),
      canViewTransactions: this.identityService.isAccrediatedTo(
        SCOPE.read.transactions
      )
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
  }

  protected tabMapping: accountTab[] = [
    'all_accounts',
    'expense_list',
  ];
  protected override onTabChanged(): void {
    if (this.tabMapping[this.tabIndex] == 'all_accounts') {
      this.searchInput = accountSearchInput(this.refData);
      this.accountService
        .fetchAccounts(
          AccountDefaultValue.pageNumber,
          AccountDefaultValue.pageSize
        )
        .subscribe((s) => {
          this.accountList = s!;
        });
    } else if (this.tabMapping[this.tabIndex] == 'expense_list') {
      this.searchInput = accountSearchInput(this.refData);
      this.accountService
        .fetchExpenses(
          AccountDefaultValue.pageNumber,
          AccountDefaultValue.pageSize,
          {}
        )
        .subscribe((s) => {
          this.expenseList = s!;
        });
    }
  }

  onSearch($event: { advancedSearch: boolean; reset: boolean; value: any }) {
    if ($event.advancedSearch && !$event.reset) {
      console.log($event.value);
      this.accountService
        .fetchAccounts(undefined, undefined, {
          accountNo: $event.value.accountNo,
          status: $event.value.status,
          type: $event.value.type,
        })
        .subscribe((s) => {
          this.accountList = s!;
        });
    } else if ($event.advancedSearch && $event.reset) {
      this.onTabChanged();
    }
  }
}