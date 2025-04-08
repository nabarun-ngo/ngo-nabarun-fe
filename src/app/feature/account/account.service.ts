import { Injectable } from '@angular/core';
import { AccountControllerService, CommonControllerService, SocialEventControllerService, UserControllerService } from 'src/app/core/api/services';
import { AccountDefaultValue, TransactionDefaultValue } from './account.const';
import { map } from 'rxjs';
import { AccountDetail, AccountDetailFilter, BankDetail, DocumentDetailUpload, ExpenseDetail, RefDataType, TransactionDetailFilter, UpiDetail } from 'src/app/core/api/models';
import { DatePipe } from '@angular/common';
import { date } from 'src/app/core/service/utilities.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  


  constructor(
    private accountController: AccountControllerService,
    private commonController: CommonControllerService,
    private userController: UserControllerService,
    private eventController: SocialEventControllerService,

  ) { }

  fetchAllAccounts(){
    return this.accountController.getAccounts({filter:{}}).pipe(map(d => d.responsePayload));
  }
  fetchAccounts(pageIndex: number = 0, pageSize: number = 100, filter?: {
    status?: string[]
    type?: string[],
    accountNo?: string
  }) {
    let filterS: AccountDetailFilter = {}
    filterS.status = ['ACTIVE'];
    filterS.includeBalance = true;
    if (filter?.accountNo) {
      filterS.accountId = filter?.accountNo
    }
    if (filter?.status && filter?.status.length > 0) {
      filterS.status = filter?.status as any
    }
    if (filter?.type && filter?.type.length > 0) {
      filterS.type = filter?.type as any
    }
    return this.accountController.getAccounts({
      pageIndex: pageIndex,
      pageSize: pageSize,
      filter: filterS
    }).pipe(map(d => d.responsePayload));
  }

  fetchMyAccounts(pageIndex: number = 0, pageSize: number = 100, filter?: {
    status?: string[]
    type?: string[],
    accountNo?: string
  }) {
    let filterS: AccountDetailFilter = {}
    filterS.status = ['ACTIVE'];
    filterS.includeBalance = true;
    filterS.includePaymentDetail = true;
    if (filter?.accountNo) {
      filterS.accountId = filter?.accountNo
    }
    if (filter?.status && filter?.status.length > 0) {
      filterS.status = filter?.status as any
    }
    if (filter?.type && filter?.type.length > 0) {
      filterS.type = filter?.type as any
    }
    return this.accountController.getMyAccounts({
      pageIndex: pageIndex,
      pageSize: pageSize,
      filter: filterS
    }).pipe(map(d => d.responsePayload));
  }

  updateAccountDetail(id: string, value: any) {
    return this.accountController.updateAccount({
      id: id,
      body: {
        accountStatus: value.status
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

  fetchUsers(accountType?: string) {
    if(!accountType){
      return this.userController.getUsers({ filter: { status: ['ACTIVE'] } }).pipe(map(d => d.responsePayload));
    }
    if (accountType == 'PUBLIC_DONATION') {
      return this.userController.getUsers({ filter: { status: ['ACTIVE'] } }).pipe(map(d => d.responsePayload));
    }
    return this.userController.getUsers({ filter: { status: ['ACTIVE'], roles: ['ASSISTANT_CASHIER', 'CASHIER', 'TREASURER'] } }).pipe(map(d => d.responsePayload));
  }

  fetchTransactions(id: string, pageIndex: number = 0, pageSize: number = 100, filter?: {
    txnNo?: string;
    txnType?: string;
    txnRef?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let txnFilter: TransactionDetailFilter = {}
    if (filter) {
      if (filter?.endDate) {
        txnFilter.endDate = filter?.endDate
      }
      if (filter?.startDate) {
        txnFilter.startDate = filter?.startDate
      }
      if (filter?.txnNo) {
        txnFilter.txnId = filter?.txnNo
      }
      if (filter?.txnRef) {
        txnFilter.txnRefType = filter?.txnRef as any
      }
      if (filter?.txnType) {
        txnFilter.txnType = filter?.txnType as any
      }
      return this.accountController.getTransactions({
        id: id,
        filter: txnFilter
      }).pipe(map(d => d.responsePayload));
    } else {
      return this.accountController.getTransactions({
        id: id,
        pageIndex: pageIndex,
        pageSize: pageSize,
        filter: txnFilter
      }).pipe(map(d => d.responsePayload));
    }

  }

  fetchMyTransactions(id: string, pageIndex: number = 0, pageSize: number = 100, filter?: {
    txnNo?: string;
    txnType?: string;
    txnRef?: string;
    startDate?: string;
    endDate?: string;
  }) {
    let txnFilter: TransactionDetailFilter = {}
    if (filter) {
      console.log(filter)
      if (filter?.endDate) {
        txnFilter.endDate = date(filter?.endDate, 'yyyy-MM-dd')
      }
      if (filter?.startDate) {
        txnFilter.startDate = date(filter?.startDate, 'yyyy-MM-dd')
      }
      if (filter?.txnNo) {
        txnFilter.txnId = filter?.txnNo
      }
      if (filter?.txnRef) {
        txnFilter.txnRefType = filter?.txnRef as any
      }
      if (filter?.txnType) {
        txnFilter.txnType = filter?.txnType as any
      }
      return this.accountController.getMyTransactions({
        id: id,
        filter: txnFilter
      }).pipe(map(d => d.responsePayload));
    } else {
      return this.accountController.getMyTransactions({
        id: id,
        pageIndex: pageIndex,
        pageSize: pageSize,
        filter: txnFilter
      }).pipe(map(d => d.responsePayload));
    }

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

  fetchExpenses(pageNumber: number, pageSize: number, filter: { status?: string[]; type?: string[]; accountNo?: string; } | undefined) {
    return this.accountController.getExpenses({ pageIndex: pageNumber, pageSize: pageSize, filter: {} })
      .pipe(map(d => d.responsePayload));
  }

  createExpenses(detail: any) {
 
    let expenseDetail = {
      description:detail.description,
      name:detail.name,
      expenseRefType: detail.expense_source as any,
      expenseRefId: detail.expense_event,
      expenseDate: detail.expenseDate,
      expenseItems:[]
    } as ExpenseDetail;
    return this.accountController.createExpense({body:expenseDetail})
      .pipe(map(d => d.responsePayload));
  }

  updateExpense(expense:ExpenseDetail,data:any){
   
    return this.accountController.updateExpense({id:expense.id!,body:{
      finalized: data.exp_status == 'FINAL'?true:false,
      description:data.description,
      expenseItems:expense.expenseItems
    }})
    .pipe(map(d => d.responsePayload));
  }

  createExpenseItem(id:string,data:any){
    return this.accountController.updateExpense({id:id,body:{
      expenseItems:[
        {
          itemName:data.itemName,
          description:data.description,
          amount:data.amount
        }
      ]
    }})
    .pipe(map(d => d.responsePayload));
  }

  updateExpenseItem(id:string,itemId:string,data:any){
    return this.accountController.updateExpense({id:id,body:{
      expenseItems:[{
        itemName:data.name,
        description:data.description,
        amount:data.amount,
        id:itemId,
        //expenseAccount:{id:detail.exp_account},
      }]
    }})
    .pipe(map(d => d.responsePayload));
  }


  fetchEvents() {
    return this.eventController.getSocialEvents({eventFilter:{}}).pipe(map(m => m.responsePayload));
  }

  uploadDocuments(id:string,documents:DocumentDetailUpload[]){
    return this.commonController.uploadDocuments({body:documents,docIndexId:id,docIndexType:'EXPENSE'}).pipe(map(d => d.responsePayload));
  }

  // advancedAccountSerarch(filter:{

  // },isSelf:boolean){
  //   if(isSelf){
  //     this.accountController.getMyAccounts({
  //       filter: {
  //         status: filter.status as any ,
  //         type:filter.type as any,
  //         includeBalance: true,
  //         includePaymentDetail:true,
  //       }
  //     }).pipe(map(d => d.responsePayload));
  //   }
  //   return this.accountController.getAccounts({
  //     filter: {
  //       status: filter.status as any ,
  //       type:filter.type as any,
  //       includeBalance: true,
  //     }
  //   }).pipe(map(d => d.responsePayload));
  // }

}
