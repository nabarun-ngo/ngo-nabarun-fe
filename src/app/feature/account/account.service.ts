import { Injectable } from '@angular/core';
import { AccountControllerService, CommonControllerService, UserControllerService } from 'src/app/core/api/services';
import { AccountDefaultValue, TransactionDefaultValue } from './account.const';
import { map } from 'rxjs';
import { AccountDetail, BankDetail, RefDataType, UpiDetail } from 'src/app/core/api/models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {



  constructor(
    private accountController: AccountControllerService,
    private commonController: CommonControllerService,
    private userController: UserControllerService,

  ) { }

  fetchAccounts(pageIndex: number = 0, pageSize: number = 100) {
    return this.accountController.getAccounts({
      pageIndex: pageIndex,
      pageSize: pageSize,
      filter: {
        status: ['ACTIVE'],
        includeBalance: true,
      }
    }).pipe(map(d => d.responsePayload));
  }

  fetchMyAccounts(pageIndex: number = 0, pageSize: number = 100) {
    return this.accountController.getMyAccounts({
      pageIndex: pageIndex,
      pageSize: pageSize,
      filter: {
        status: ['ACTIVE'],
        includeBalance: true,
        includePaymentDetail: true
      }
    }).pipe(map(d => d.responsePayload));
  }

  fetchRefData() {
    return this.commonController.getReferenceData({ names: [RefDataType.Account] }).pipe(map(d => d.responsePayload));
  }

  updateAccountDetail(id: string, value: any) {
    return this.accountController.updateAccount({
      id:id,
      body:{
        accountStatus:value.status
      }
    }).pipe(map(d => d.responsePayload));
  }

  updateBankingAndUPIDetail(id: string, banking: BankDetail, upi: UpiDetail) {
    return this.accountController.updateMyAccount({
      id: id,
      body: {
        bankDetail: banking,
        upiDetail: upi
      }
    }).pipe(map(d => d.responsePayload));
  }

  createAccount(accountDetail: any, banking?: BankDetail, upi?: UpiDetail) {
    let account = {
      accountHolder: { id: accountDetail.accountHolder },
      accountType: accountDetail.accountType,
      currentBalance: accountDetail.openingBalance,
      bankDetail: banking,
      upiDetail: upi
    } as AccountDetail;
    return this.accountController.createAccount({ body: account }).pipe(map(d => d.responsePayload));
  }

  fetchUsers(accountType: string) {
    if (accountType == 'PUBLIC_DONATION') {
      return this.userController.getUsers({ filter: { status: ['ACTIVE'] } }).pipe(map(d => d.responsePayload));
    }
    return this.userController.getUsers({ filter: { status: ['ACTIVE'], roles: ['ASSISTANT_CASHIER', 'CASHIER', 'TREASURER'] } }).pipe(map(d => d.responsePayload));
  }

  fetchTransactions(id: string, pageIndex: number = 0, pageSize: number = 100) {
    return this.accountController.getTransactions({
      id: id,
      pageIndex: pageIndex,
      pageSize: pageSize,
    }).pipe(map(d => d.responsePayload));
  }


  performTransaction(from: AccountDetail, value: any) {
    return this.accountController.createTransaction({
      body: {
        transferFrom: from,
        transferTo: {
          id: value.transferTo
        },
        txnAmount: value.amount,
        // txnDate: new Date().toDateString(),
        txnDescription: value.description,
        txnType: 'TRANSFER',
        txnRefType: 'NONE',
        txnStatus: 'SUCCESS',
      }
    }).pipe(map(d => d.responsePayload));
  }

}
