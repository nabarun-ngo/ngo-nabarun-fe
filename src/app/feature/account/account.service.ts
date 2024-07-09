import { Injectable } from '@angular/core';
import { AccountControllerService } from 'src/app/core/api/services';
import { AccountDefaultValue } from './account.const';
import { map } from 'rxjs';
import { AccountDetail, BankDetail, UpiDetail } from 'src/app/core/api/models';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  
  constructor(private accountController:AccountControllerService) { }

  fetchAccounts(arg0: { active: boolean; }) {
    return this.accountController.getAccounts({
      pageIndex:AccountDefaultValue.pageNumber,
      pageSize:AccountDefaultValue.pageSize,
      filter:{
        status:['ACTIVE']
      }
    }).pipe(map(d=>d.responsePayload));
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

  createAccount(account:AccountDetail,banking?: BankDetail, upi?: UpiDetail) {
    account.bankDetail=banking;
    account.upiDetail=upi;
    return this.accountController.createAccount({body:account}).pipe(map(d=>d.responsePayload));
  }

}
