import { Component, ViewChild } from '@angular/core';
import { KeyValue, PaginateExpenseDetail } from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { ExpenseDefaultValue, expenseTab } from '../account.const';
import { ActivatedRoute } from '@angular/router';
import { AccountService } from '../account.service';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { expenseSearchInput } from '../expense.field';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { MyExpensesTabComponent } from './my-expenses-tab/my-expenses-tab.component';
import { ManageExpenseTabComponent } from './manage-expense-tab/manage-expense-tab.component';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';

@Component({
  selector: 'app-expense-dashboard',
  templateUrl: './expense-dashboard.component.html',
  styleUrls: ['./expense-dashboard.component.scss'],
})
export class ExpenseDashboardComponent extends StandardTabbedDashboard<expenseTab, PaginateExpenseDetail> {
  /**
   * Declariring variables
   */
  @ViewChild(MyExpensesTabComponent) myExpensesTab!: MyExpensesTabComponent;
  @ViewChild(ManageExpenseTabComponent) expenseListTab!: ManageExpenseTabComponent;

  protected permissions!: {
    canViewTransactions: boolean;
    canUpdateAccount: boolean;
    canCreateAccount: boolean;
    canViewAccounts: boolean;
  };
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;
  protected AppRoute = AppRoute;

  /** 
   * Overriding variables from StandardTabbedDashboard
  */
  protected tabMapping: expenseTab[] = ['my_expenses', 'expense_list'];
  protected override get tabComponents(): { [key in expenseTab]?: TabComponentInterface<PaginateExpenseDetail> } {
    return {
      my_expenses: this.myExpensesTab,
      expense_list: this.expenseListTab
    };
  }
  protected override get defaultTab(): expenseTab {
    return ExpenseDefaultValue.tabName as expenseTab;
  }

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
    private identityService: UserIdentityService,
    private accountService: AccountService
  ) 
  {
    super(route);
  }

  
 protected override onInitHook(): void {
    this.searchInput = expenseSearchInput(this.getCurrentTab(), this.refData!);
    this.sharedDataService.setPageName(ExpenseDefaultValue.pageTitle);

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
  
  protected override onTabChangedHook(): void {
    this.searchInput = expenseSearchInput(this.getCurrentTab(), this.refData!);
  }

  onSearch($event: SearchEvent) {
    // Forward search to the active tab component
    this.forwardSearchToActiveTab($event);

    if ($event.buttonName == 'ADVANCED_SEARCH') {
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
