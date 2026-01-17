import { ActivatedRouteSnapshot, ResolveFn, RouterStateSnapshot } from '@angular/router';
import { AccountService } from './service/account.service';
import { inject } from '@angular/core';
import { AccountDefaultValue, accountTab, DonationDefaultValue, donationTab, ExpenseDefaultValue, expenseTab, TransactionDefaultValue } from './finance.const';
import { Account, PagedAccounts, PagedDonations, PagedExpenses, PagedTransactions } from './model';
import { DonationService } from './service/donation.service';
import { AccountRefDataDto, DonationRefDataDto } from 'src/app/core/api-client/models';

export const accountDashboardResolver: ResolveFn<PagedAccounts | undefined> = (route, state) => {
  const tab = (route.queryParams['tab'] || AccountDefaultValue.tabName) as accountTab;
  const id = route.queryParams['id'] as string;

  if (tab === 'my_accounts') {
    return inject(AccountService).fetchMyAccounts(
      AccountDefaultValue.pageNumber,
      AccountDefaultValue.pageSize,
      { accountId: id ? atob(id) : undefined }
    );
  } else if (tab === 'all_accounts') {
    return inject(AccountService).fetchAccounts({
      pageIndex: AccountDefaultValue.pageNumber,
      pageSize: AccountDefaultValue.pageSize,
      accountId: id ? atob(id) : undefined
    });
  }
  return;
};

export const expenseDashboardResolver: ResolveFn<PagedExpenses | undefined> = (route, state) => {
  const tab = (route.queryParams['tab'] || ExpenseDefaultValue.tabName) as expenseTab;
  const id = route.queryParams['id'] as string;
  const activityId = route.queryParams['activityId'] as string;

  if (tab === 'my_expenses') {
    return inject(AccountService).fetchMyExpenses(
      AccountDefaultValue.pageNumber,
      AccountDefaultValue.pageSize,
      { expenseId: id ? atob(id) : undefined, expenseRefId: activityId }
    );
  } else if (tab === 'expense_list') {
    return inject(AccountService).fetchExpenses(
      AccountDefaultValue.pageNumber,
      AccountDefaultValue.pageSize,
      { expenseId: id ? atob(id) : undefined, expenseRefId: activityId }
    );
  }
  return;
};

export const accountTransactionResolver: ResolveFn<PagedTransactions> = (route, state) => {
  const self = route.queryParams['self'] as string;
  const accountId = atob(route.params['id']);

  if (self === 'Y') {
    return inject(AccountService).fetchMyTransactions(
      accountId,
      TransactionDefaultValue.pageNumber,
      TransactionDefaultValue.pageSize
    );
  } else {
    return inject(AccountService).fetchTransactions(
      accountId,
      TransactionDefaultValue.pageNumber,
      TransactionDefaultValue.pageSize
    );
  }
};

export const accountInfoResolver: ResolveFn<PagedAccounts> = (route, state) => {
  const self = route.queryParams['self'] as string;
  const accountId = atob(route.params['id']);

  if (self === 'Y') {
    return inject(AccountService).fetchMyAccounts(undefined, undefined, { accountId });
  } else {
    return inject(AccountService).fetchAccounts({ accountId });
  }
};


export const accountRefDataResolver: ResolveFn<AccountRefDataDto> = (route, state) => {
  return inject(AccountService).getReferenceData();
};



export const donationDashboardResolverNew: ResolveFn<any> = (route, state) => {
  const tab = (route.queryParams['tab'] || DonationDefaultValue.tabName) as donationTab;
  const id = route.queryParams['id'] as string;

  if (tab === 'member_donation') {
    return;
  }
  else if (tab === 'guest_donation') {
    return inject(DonationService).fetchGuestDonations({
      pageIndex: DonationDefaultValue.pageNumber,
      pageSize: DonationDefaultValue.pageSize
    });
  }
  else {
    return inject(DonationService).fetchMyDonations({
      pageIndex: DonationDefaultValue.pageNumber,
      pageSize: DonationDefaultValue.pageSize
    });
  }
};

export const donationDashboardResolver: ResolveFn<any> =
  async (route, state) => {
    let tab = (route.queryParams['tab'] || DonationDefaultValue.tabName) as donationTab;
    //console.log(route.queryParams, tab)
    if (tab == 'member_donation') {
      return await inject(DonationService).fetchMembers({
        pageIndex: DonationDefaultValue.pageNumber,
        pageSize: DonationDefaultValue.pageSize
      });
    }
    else if (tab == 'guest_donation') {
      //console.log("fetching guest donations");
      return await inject(DonationService).fetchMembers({
        pageIndex: DonationDefaultValue.pageNumber,
        pageSize: DonationDefaultValue.pageSize
      });

    } else {
      ////console.log("fetching my donations");
      return await inject(DonationService).fetchMyDonations({
        pageIndex: DonationDefaultValue.pageNumber,
        pageSize: DonationDefaultValue.pageSize
      });
    }
  };

export const donationRefDataResolverNew: ResolveFn<DonationRefDataDto> =
  (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    return inject(DonationService).fetchRefData();
  };
