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
    private accountController:AccountControllerService,
    private commonController: CommonControllerService,
    private userController: UserControllerService,

  ) { }

  fetchAccounts(arg0: { active: boolean; }) {
    return this.accountController.getAccounts({
      pageIndex:AccountDefaultValue.pageNumber,
      pageSize:AccountDefaultValue.pageSize,
      filter:{
        status:['ACTIVE']
      }
    }).pipe(map(d=>d.responsePayload));
  }

  fetchMyAccounts(arg0: { active: boolean; }) {
    return this.accountController.getMyAccounts({
      pageIndex:AccountDefaultValue.pageNumber,
      pageSize:AccountDefaultValue.pageSize,
      filter:{
        status:['ACTIVE']
      }
    }).pipe(map(d=>d.responsePayload));
  }

  fetchRefData() {
    return this.commonController.getReferenceData({ names: [RefDataType.Account]}).pipe(map(d => d.responsePayload));
  }

  updateAccountDetail(arg0: string, value: any) {
    return this.accountController.getAccounts({
      pageIndex:AccountDefaultValue.pageNumber,
      pageSize:AccountDefaultValue.pageSize,
      filter:{
        status:['ACTIVE']
      }
    }).pipe(map(d=>d.responsePayload));
  }
  
  updateBankingAndUPIDetail(id: string, banking: BankDetail, upi: UpiDetail) {
    return this.accountController.getAccounts({
      pageIndex:AccountDefaultValue.pageNumber,
      pageSize:AccountDefaultValue.pageSize,
      filter:{
        status:['ACTIVE']
      }
    }).pipe(map(d=>d.responsePayload));
  }

  createAccount(accountDetail:any,banking?: BankDetail, upi?: UpiDetail) {
    let account = {
      accountHolder:{id:accountDetail.accountHolder},
      accountType : accountDetail.accountType,
      currentBalance: accountDetail.openingBalance,
      bankDetail: banking,
      upiDetail: upi
    } as AccountDetail;
    return this.accountController.createAccount({body:account}).pipe(map(d=>d.responsePayload));
  }

  fetchUsers(accountType:string){
    if(accountType == 'PUBLIC_DONATION'){
      return this.userController.getUsers({filter:{status:['ACTIVE']}}).pipe(map(d=>d.responsePayload));
    }
    return this.userController.getUsers({filter:{status:['ACTIVE'],roles:['ASSISTANT_CASHIER','CASHIER','TREASURER']}}).pipe(map(d=>d.responsePayload));
  }

  fetchTransactions(id: string) {
    return this.accountController.getTransactions({
      id:id,
      pageIndex:TransactionDefaultValue.pageNumber,
      pageSize:TransactionDefaultValue.pageSize,
    }).pipe(map(d=>d.responsePayload));
  }

}
