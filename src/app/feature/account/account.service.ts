import { Injectable } from '@angular/core';
import {
  AccountControllerService,
  CommonControllerService,
  SocialEventControllerService,
  UserControllerService,
} from 'src/app/core/api/services';
import { AccountDefaultValue, TransactionDefaultValue } from './account.const';
import { map } from 'rxjs';
import {
  AccountDetail,
  AccountDetailFilter,
  BankDetail,
  DocumentDetailUpload,
  ExpenseDetail,
  ExpenseDetailFilter,
  ExpenseItemDetail,
  RefDataType,
  TransactionDetailFilter,
  UpiDetail,
} from 'src/app/core/api/models';
import { DatePipe } from '@angular/common';
import { date } from 'src/app/core/service/utilities.service';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  constructor(
    private accountController: AccountControllerService,
    private commonController: CommonControllerService,
    private userController: UserControllerService,
    private eventController: SocialEventControllerService
  ) {}

  fetchAllAccounts() {
    return this.accountController
      .getAccounts({ filter: {} })
      .pipe(map((d) => d.responsePayload));
  }
  fetchAccounts(
    pageIndex?: number,
    pageSize?: number,
    filter?: AccountDetailFilter
  ) {
    filter = filter ? filter : {};
    filter.status = filter?.status ? filter.status : ['ACTIVE'];
    filter.includeBalance = filter?.includeBalance
      ? filter.includeBalance
      : true;
    return this.accountController
      .getAccounts({
        pageIndex: pageIndex,
        pageSize: pageSize,
        filter: filter,
      })
      .pipe(map((d) => d.responsePayload));
  }

  fetchMyAccounts(
    pageIndex?: number,
    pageSize?: number,
    filter?: AccountDetailFilter
  ) {
    filter = filter ? filter : {};
    filter.includeBalance = filter?.includeBalance
      ? filter.includeBalance
      : true;
    filter.includePaymentDetail = filter?.includePaymentDetail
      ? filter?.includePaymentDetail
      : true;

    return this.accountController
      .getMyAccounts({
        pageIndex: pageIndex,
        pageSize: pageSize,
        filter: filter,
      })
      .pipe(map((d) => d.responsePayload));
  }

  updateAccountDetail(id: string, value: any) {
    return this.accountController
      .updateAccount({
        id: id,
        body: {
          accountStatus: value.status,
        },
      })
      .pipe(map((d) => d.responsePayload));
  }

  updateBankingAndUPIDetail(id: string, banking: BankDetail, upi: UpiDetail) {
    return this.accountController
      .updateMyAccount({
        id: id,
        body: {
          bankDetail: banking,
          upiDetail: upi,
        },
      })
      .pipe(map((d) => d.responsePayload));
  }

  createAccount(accountDetail: any, banking?: BankDetail, upi?: UpiDetail) {
    let account = {
      accountHolder: { id: accountDetail.accountHolder },
      accountType: accountDetail.accountType,
      currentBalance: accountDetail.openingBalance,
      bankDetail: banking,
      upiDetail: upi,
    } as AccountDetail;
    return this.accountController
      .createAccount({ body: account })
      .pipe(map((d) => d.responsePayload));
  }

  fetchUsers(accountType?: string) {
    if (!accountType) {
      return this.userController
        .getUsers({ filter: { status: ['ACTIVE'] } })
        .pipe(map((d) => d.responsePayload));
    }
    if (accountType == 'PUBLIC_DONATION') {
      return this.userController
        .getUsers({ filter: { status: ['ACTIVE'] } })
        .pipe(map((d) => d.responsePayload));
    }
    return this.userController
      .getUsers({
        filter: {
          status: ['ACTIVE'],
          roles: ['ASSISTANT_CASHIER', 'CASHIER', 'TREASURER'],
        },
      })
      .pipe(map((d) => d.responsePayload));
  }

  fetchTransactions(
    id: string,
    pageIndex?: number,
    pageSize?: number,
    filter?: TransactionDetailFilter
  ) {
    filter = filter ? filter : {};
    if (filter?.endDate) {
      filter.endDate = date(filter?.endDate, 'yyyy-MM-dd');
    }
    if (filter?.startDate) {
      filter.startDate = date(filter?.startDate, 'yyyy-MM-dd');
    }
    return this.accountController
      .getTransactions({
        id: id,
        pageIndex: pageIndex,
        pageSize: pageSize,
        filter: filter,
      })
      .pipe(map((d) => d.responsePayload));
  }

  fetchMyTransactions(
    id: string,
    pageIndex?: number,
    pageSize?: number,
    filter?: TransactionDetailFilter
  ) {
    filter = filter ? filter : {};
    if (filter?.endDate) {
      filter.endDate = date(filter?.endDate, 'yyyy-MM-dd');
    }
    if (filter?.startDate) {
      filter.startDate = date(filter?.startDate, 'yyyy-MM-dd');
    }
    return this.accountController
      .getMyTransactions({
        id: id,
        pageIndex: pageIndex,
        pageSize: pageSize,
        filter: filter,
      })
      .pipe(map((d) => d.responsePayload));
  }

  performTransaction(from: AccountDetail, value: any) {
    return this.accountController
      .createTransaction({
        body: {
          transferFrom: from,
          transferTo: {
            id: value.transferTo,
          },
          txnAmount: value.amount,
          // txnDate: new Date().toDateString(),
          txnDescription: value.description,
          txnType: 'TRANSFER',
          txnRefType: 'NONE',
          txnStatus: 'SUCCESS',
        },
      })
      .pipe(map((d) => d.responsePayload));
  }

  fetchExpenses(
    pageNumber?: number,
    pageSize?: number,
    filter?: ExpenseDetailFilter
  ) {
    filter = filter ? filter : {};
    if (filter?.endDate) {
      filter.endDate = date(filter?.endDate, 'yyyy-MM-dd');
    }
    if (filter?.startDate) {
      filter.startDate = date(filter?.startDate, 'yyyy-MM-dd');
    }
    return this.accountController
      .getExpenses({
        pageIndex: pageNumber,
        pageSize: pageSize,
        filter: filter,
      })
      .pipe(map((d) => d.responsePayload));
  }

  fetchMyExpenses(
    pageNumber?: number,
    pageSize?: number,
    filter?: ExpenseDetailFilter
  ) {
    filter = filter ? filter : {};
    if (filter?.endDate) {
      filter.endDate = date(filter?.endDate, 'yyyy-MM-dd');
    }
    if (filter?.startDate) {
      filter.startDate = date(filter?.startDate, 'yyyy-MM-dd');
    }
    return this.accountController
      .getMyExpenses({
        pageIndex: pageNumber,
        pageSize: pageSize,
        filter: filter,
      })
      .pipe(map((d) => d.responsePayload));
  }

  createExpenses(detail: ExpenseDetail) {
    return this.accountController
      .createExpense({ body: detail })
      .pipe(map((d) => d.responsePayload));
  }

  updateExpense(id: string, expense: ExpenseDetail) {
    if (expense.status == 'FINALIZED') {
      return this.accountController
        .finalizeExpense({ id: id, body: expense })
        .pipe(map((d) => d.responsePayload));
    }
    if (expense.status == 'SETTLED') {
      return this.accountController
        .settleExpense({ id: id, body: expense })
        .pipe(map((d) => d.responsePayload));
    }
    return this.accountController
      .updateExpense({ id: id, body: expense })
      .pipe(map((d) => d.responsePayload));
  }

  createExpenseItem(id: string, data: any) {
    return this.accountController
      .updateExpense({
        id: id,
        body: {
          expenseItems: [
            {
              itemName: data.itemName,
              description: data.description,
              amount: data.amount,
            },
          ],
        },
      })
      .pipe(map((d) => d.responsePayload));
  }

  updateExpenseItem(id: string, data: ExpenseItemDetail[]) {
    return this.accountController
      .updateExpense({
        id: id,
        body: {
          expenseItems: data,
        },
      })
      .pipe(map((d) => d.responsePayload));
  }

  fetchEvents() {
    return this.eventController
      .getSocialEvents({ eventFilter: {} })
      .pipe(map((m) => m.responsePayload));
  }

  uploadDocuments(id: string, documents: DocumentDetailUpload[]) {
    return this.commonController
      .uploadDocuments({
        body: documents,
        docIndexId: id,
        docIndexType: 'EXPENSE',
      })
      .pipe(map((d) => d.responsePayload));
  }
}
