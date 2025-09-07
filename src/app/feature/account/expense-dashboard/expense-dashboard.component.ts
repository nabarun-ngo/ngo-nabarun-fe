import { Component } from '@angular/core';
import {
  KeyValue,
  PaginateAccountDetail,
  PaginateExpenseDetail,
} from 'src/app/core/api/models';
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
import { expenseSearchInput } from '../expense.field';
import { removeNullFields } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-expense-dashboard',
  templateUrl: './expense-dashboard.component.html',
  styleUrls: ['./expense-dashboard.component.scss'],
})
export class ExpenseDashboardComponent extends TabbedPage<accountTab> {
  protected permissions!: {
    canViewTransactions: boolean;
    canUpdateAccount: boolean;
    canCreateAccount: boolean;
    canViewAccounts: boolean;
  };
  protected expenseList!: PaginateExpenseDetail;
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;
  private refData: any;
  protected AppRoute = AppRoute;

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
    private accountService: AccountService,
    private identityService: UserIdentityService
  ) {
    super(route);
    this.sharedDataService.setPageName("Expenses");

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
      ),
    };
  }

  override handleRouteData(): void {
    if (this.route.snapshot.data['data']) {
      this.expenseList = this.route.snapshot.data[
        'data'
      ] as PaginateAccountDetail;
    }
    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
    }
    this.searchInput = expenseSearchInput(this.tabMapping[this.tabIndex], this.refData);
  }

  protected tabMapping: accountTab[] = ['my_expenses', 'expense_list'];
  protected override onTabChanged(): void {
    this.searchInput = expenseSearchInput(this.tabMapping[this.tabIndex],this.refData);
    if (this.tabMapping[this.tabIndex] == 'my_expenses') {
      this.accountService
        .fetchMyExpenses(
          AccountDefaultValue.pageNumber,
          AccountDefaultValue.pageSize,
          {}
        )
        .subscribe((s) => {
          this.expenseList = s!;
        });
    }else if (this.tabMapping[this.tabIndex] == 'expense_list') {
      this.accountService
        .fetchExpenses(AccountDefaultValue.pageNumber,AccountDefaultValue.pageSize,{
          expenseStatus:['FINALIZED','SUBMITTED','DRAFT']
        })
        .subscribe((s) => {
          this.expenseList = s!;
        });
    }
  }

  onSearch($event: {
    advancedSearch: boolean;
    reset: boolean;
    value: any;
    buttonName?: string;
  }) {
    if ($event.advancedSearch && !$event.reset) {
      console.log($event.value);
      if (this.tabMapping[this.tabIndex] == 'my_expenses') {
        this.accountService
        .fetchMyExpenses(undefined, undefined, removeNullFields($event.value))
        .subscribe((s) => {
          this.expenseList = s!;
        });
      }else if (this.tabMapping[this.tabIndex] == 'expense_list') {
        this.accountService
          .fetchExpenses(undefined, undefined, removeNullFields($event.value))
          .subscribe((s) => {
            this.expenseList = s!;
          });
      }
    } else if ($event.advancedSearch && $event.reset) {
      this.onTabChanged();
    } else if ($event.buttonName == 'ADVANCED_SEARCH') {
      
      this.accountService.fetchEvents().subscribe((s) => {
          let events = s?.content?.map((m) => {
            return { key: m.id, displayValue: m.eventTitle } as KeyValue;
          });
          this.searchInput.advancedSearch!.searchFormFields.find(
            (f) => f.inputModel.html_id == 'event_Id'
          )!.inputModel.selectList = events;
        });
      if (this.tabMapping[this.tabIndex] == 'expense_list') {
        this.accountService.fetchUsers().subscribe((s) => {
        let users = s?.content?.map((m) => {
          return { key: m.id, displayValue: m.fullName } as KeyValue;
        });
        this.searchInput.advancedSearch!.searchFormFields.find(
          (f) => f.inputModel.html_id == 'account_Owner'
        )!.inputModel.selectList = users;
      });
      }
    }
  }
}
