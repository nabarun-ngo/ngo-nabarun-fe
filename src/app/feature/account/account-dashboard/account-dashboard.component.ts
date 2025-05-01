import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { AccountService } from '../account.service';
import { AccountDefaultValue, accountTab } from '../account.const';
import {
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
@Component({
  selector: 'app-account-dashboard',
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss'],
})
export class AccountDashboardComponent extends TabbedPage<accountTab> {
  protected AppRoute=AppRoute;
  protected permissions!: {
    canViewTransactions: boolean;
    canUpdateAccount: boolean;
    canCreateAccount: boolean;
    canViewAccounts: boolean;
    canManageAccounts:boolean;
  };
  protected expenseList!: PaginateExpenseDetail;
  protected accountList!: PaginateAccountDetail;
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
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
    this.sharedDataService.setPageName(AccountDefaultValue.pageTitle);

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
      canManageAccounts: this.identityService.isAccrediatedToAny(
        SCOPE.create.expense_final,SCOPE.create.expense_settle,SCOPE.create.account
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
  }

  protected tabMapping: accountTab[] = [
    'my_accounts',
    'my_expenses',
  ];
  protected override onTabChanged(): void {
    if (this.tabMapping[this.tabIndex] == 'my_accounts') {
      this.searchInput = accountSearchInput(this.refData);
      this.accountService
        .fetchMyAccounts(
          AccountDefaultValue.pageNumber,
          AccountDefaultValue.pageSize
        )
        .subscribe((s) => {
          this.accountList = s!;
        });
    } else if (this.tabMapping[this.tabIndex] == 'my_expenses') {
      this.searchInput = accountSearchInput(this.refData);
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

  // protected scope = SCOPE;
  // protected defaultValue = AccountDefaultValue;
  // actionName!: string;
  // refData!: { [name: string]: KeyValue[]; };
  // app_route = AppRoute;

  // canViewAccounts!: boolean;
  // canCreateAccount!: boolean;
  // canUpdateAccount!: boolean;
  // canViewTransactions!: boolean;
  // expenseList!: PaginateExpenseDetail;

  // constructor(
  //   private sharedDataService: SharedDataService,
  //   protected override route: ActivatedRoute,
  //   private accountService: AccountService,
  //   private el: ElementRef,
  //   private router: Router,
  //   private identityService: UserIdentityService,
  // ) {
  //   super(route);
  //   //super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions)
  // }

  // override ngOnInit(): void {
  //   super.ngOnInit();
  //   this.canViewAccounts = this.identityService.isAccrediatedTo(this.scope.read.accounts)
  //   this.canCreateAccount = this.identityService.isAccrediatedTo(this.scope.create.account)
  //   this.canUpdateAccount = this.identityService.isAccrediatedTo(this.scope.update.account)
  //   this.canViewTransactions = this.identityService.isAccrediatedTo(this.scope.read.transactions)

  //   /**
  //    * Setting page name
  //    */
  //   this.sharedDataService.setPageName(this.defaultValue.pageTitle);

  //   /**
  //    * Mapping tab
  //    */
  //   let tab = this.route.snapshot.data["tab"] ? this.route.snapshot.data["tab"] as accountTab : this.defaultValue.tabName;
  //   this.tabMapping.forEach((value: accountTab, key: number) => {
  //     if (tab == value) {
  //       this.tabIndex = key;
  //     }
  //   })

  //   /**
  //    * Setting RefData from router
  //    */
  //   if (this.route.snapshot.data['ref_data']) {
  //     this.refData = this.route.snapshot.data['ref_data'];
  //     this.sharedDataService.setRefData('ACCOUNT', this.refData!);
  //     this.setRefData(this.refData);
  //   }

  //   this.setAccordionHeader();

  //   this.searchInput = accountSearchInput(this.refData)
  // }

  // setAccordionHeader() {
  //   if (this.tabMapping[this.tabIndex] == 'expense_list') {
  //     this.setHeaderRow(expenseTabHeader);
  //   }
  //   else {
  //     this.setHeaderRow(accountTabHeader(this.tabMapping[this.tabIndex]));
  //   }

  // }

  // protected override prepareHighLevelView(itemG: AccountDetail | ExpenseDetail, options?: { [key: string]: any }): AccordionCell[] {
  //   if (this.tabMapping[this.tabIndex] == 'expense_list') {
  //     let item = itemG as ExpenseDetail;
  //     return expenseHighLevelView(item);
  //   } else {
  //     let item = itemG as AccountDetail;
  //     return accountHighLevelView(item, this.tabMapping[this.tabIndex], this.refData);
  //   }

  // }

  // protected override prepareDetailedView(item: AccountDetail | ExpenseDetail, options?: { [key: string]: any, create: boolean }): DetailedView[] {
  //   if (options && options.create) {
  //     return [
  //       this.tabMapping[this.tabIndex] == 'expense_list' ?
  //       expenseDetailSection({},true) :
  //       accountDetailSection({}, this.refData, true),
  //     ];
  //   }
  //   if (this.tabMapping[this.tabIndex] == 'expense_list') {
  //     let m = item as ExpenseDetail;
  //     let expenseList= expenseListSection(m);
  //     expenseList.accordion?.buttonClick?.subscribe(data=>{
  //       if(data.buttonId == 'SHOW_CREATE'){
  //         expenseList.accordion?.object. ();
  //       }else if(data.buttonId == 'CREATE'){

  //         let expenseForm=expenseList.accordion?.object.getSectionForm('expense_item_detail',0,true);
  //         if(expenseForm?.valid){
  //           this.accountService.createExpenseItem(m.id!,expenseForm?.value).subscribe(data=>{
  //             this.fetchDetails();
  //           });
  //         }else{
  //           expenseForm?.markAllAsTouched();
  //         }

  //       }else if(data.buttonId == 'CONFIRM'){
  //         let expenseForm=expenseList.accordion?.object.getSectionForm('expense_item_detail',data.rowIndex);
  //         let itemId=m.expenseItems![data.rowIndex].id!;
  //         if(expenseForm?.valid){
  //           this.accountService.updateExpenseItem(m.id!,itemId,expenseForm?.value).subscribe(data=>{

  //             expenseList.accordion?.object.addContentRow(data);
  //             //this.fetchDetails();
  //           });
  //         }else{
  //           expenseForm?.markAllAsTouched();
  //         }
  //       }else if(data.buttonId == 'CANCEL_CREATE'){
  //         expenseList.accordion?.object.hideForm(0, true);
  //       }else if(data.buttonId == 'CANCEL'){
  //         expenseList.accordion?.object.hideForm(data.rowIndex);
  //       }else if(data.buttonId == 'DELETE_EXPENSE_ITEM'){
  //       }else if(data.buttonId == 'UPDATE_EXPENSE_ITEM'){
  //         this.accountService.fetchAllAccounts().subscribe(data=>{
  //           this.getSectionField('expense_item_detail','exp_account',0,true).form_input!.selectList=data?.content?.map(m=>{
  //             return {key:m.id,displayValue:`${m.accountHolderName} (${m.id})`} as KeyValue;
  //           })
  //         })
  //         expenseList.accordion?.object.showEditForm(data.rowIndex, ['expense_item_detail']);
  //       }
  //       console.log(data)
  //     })
  //     return [
  //       expenseDetailSection(m),
  //       expenseList
  //     ];
  //   } else {
  //     let m = item as AccountDetail;

  //     if (this.tabMapping[this.tabIndex] == 'all_accounts') {
  //       return [
  //         accountDetailSection(m, this.refData),
  //         bankDetailSection(m),
  //         upiDetailSection(m),
  //       ]
  //     } else {
  //       return [
  //         accountDetailSection(m, this.refData),
  //         bankDetailSection(m),
  //         upiDetailSection(m),
  //         //          transferAmountSection(m)
  //       ];
  //     }
  //   }

  // }

  // protected override prepareDefaultButtons(data: AccountDetail, options?: { [key: string]: any, create: boolean }): AccordionButton[] {
  //   if (options && options.create) {
  //     return [
  //       {
  //         button_id: 'CANCEL_CREATE',
  //         button_name: 'Cancel'
  //       },
  //       {
  //         button_id: 'CREATE',
  //         button_name: 'Create'
  //       }
  //     ];
  //   }
  //   let buttons = []
  //   if (this.tabMapping[this.tabIndex] == 'expense_list') {
  //     return [
  //       {
  //         button_id: 'UPDATE_EXPENSE',
  //         button_name: 'Update'
  //       },
  //     ]
  //   } else {

  //     if (this.tabMapping[this.tabIndex] == 'my_accounts') {
  //       return [
  //         {
  //           button_id: 'ADD_MONEY',
  //           button_name: 'Add Money'
  //         },
  //         {
  //           button_id: 'VIEW_TXN',
  //           button_name: 'View Transactions'
  //         },
  //         {
  //           button_id: 'PERFORM_TXN',
  //           button_name: 'Transfer'
  //         },
  //         {
  //           button_id: 'UPDATE_BANK_UPI',
  //           button_name: 'Update Bank and UPI Detail'
  //         }
  //       ]
  //     }

  //     if (this.canViewTransactions) {
  //       buttons.push({
  //         button_id: 'VIEW_TXN',
  //         button_name: 'View Transactions'
  //       })
  //     }
  //     if (this.canUpdateAccount) {
  //       buttons.push({
  //         button_id: 'UPDATE_ACCOUNT',
  //         button_name: 'Update Account Detail'
  //       })
  //     }
  //   }

  //   return buttons;
  // }

  // override handlePageEvent($event: PageEvent): void {
  //   this.pageNumber = $event.pageIndex;
  //   this.pageSize = $event.pageSize;
  //   this.fetchDetails();
  // }
  // fetchDetails(filter?: {
  //   status?: string[]
  //   type?: string[],
  //   accountNo?: string
  // }) {
  //   if (this.tabMapping[this.tabIndex] == 'my_accounts') {
  //     this.accountService.fetchMyAccounts(this.pageNumber, this.pageSize, filter).subscribe(s => {
  //       this.accountList = s!;
  //       this.setContent(this.accountList.content!, this.accountList?.totalSize!)
  //     })
  //   } else if (this.tabMapping[this.tabIndex] == 'all_accounts') {
  //     this.accountService.fetchAccounts(this.pageNumber, this.pageSize, filter).subscribe(s => {
  //       this.accountList = s!;
  //       this.setContent(this.accountList.content!, this.accountList?.totalSize!)
  //     })
  //   }
  //   else if (this.tabMapping[this.tabIndex] == 'expense_list') {
  //     this.accountService.fetchExpenses(this.pageNumber, this.pageSize, filter).subscribe(s => {
  //       this.expenseList = s!;
  //       this.setContent(this.expenseList.content!, this.expenseList?.totalSize!)
  //     })
  //   }

  // }

  // protected tabChanged(index: number) {
  //   this.tabIndex = index;
  //   this.pageNumber = this.defaultValue.pageNumber;
  //   this.pageSize = this.defaultValue.pageSize;
  //   this.hideForm(0, true);
  //   this.setAccordionHeader();
  //   this.fetchDetails();

  // }

  // protected override onAccordionOpen($event: { rowIndex: number; }) { }

  // createAccount() {
  //   this.showCreateForm();

  //   let account_form = this.getSectionForm('account_detail', 0, true);
  //   account_form?.valueChanges.pipe(filterFormChange(account_form.value))
  //     .subscribe((val) => {
  //       console.log(val)
  //       if (val['accountType']) {
  //         // this.accordionList.addContent?.columns.filter(f => f.html_id == 'acc_type_h').map(m => {
  //         //   m.value = val['accountType'];
  //         //   return m;
  //         // })
  //         this.accountService.fetchUsers(val['accountType']).subscribe(data => {
  //           let selectList = this.getSectionField('account_detail', 'account_holder', 0, true)?.form_input?.selectList;
  //           selectList?.splice(0);
  //           data?.content?.forEach(element => {
  //             let val = { key: element.id, displayValue: element.fullName } as KeyValue;
  //             selectList?.push(val);
  //           });
  //         });
  //       }
  //       if (val['accountHolder']) {
  //         // this.accordionList.addContent?.columns.filter(f => f.html_id == 'acc_holder_h').map(m => {
  //         //   m.value = val['accountHolder'];
  //         //   return m;
  //         // })
  //       }

  //     });
  // }

  // createExpense(){
  //   this.showCreateForm();

  //   let expense_form = this.getSectionForm('expense_detail', 0, true);
  //   expense_form?.valueChanges.pipe(filterFormChange(expense_form.value)).subscribe(val=>{
  //     if (val['expense_source'] == 'EVENT') {
  //       this.accountService.fetchEvents().subscribe(data=>{
  //         let events: KeyValue[] = []
  //         data?.content?.forEach(m => {
  //           events.push({ key: m.id, displayValue: m.eventTitle })
  //         })

  //         this.addSectionField('expense_detail', {
  //           field_name: 'Select Event',
  //           field_value: '',
  //           editable: true,
  //           field_html_id: 'expense_event',
  //           form_control_name: 'expense_event',
  //           form_input: {
  //             html_id: 'expense_event_inp',
  //             tagName: 'input',
  //             inputType: 'text',
  //             placeholder: 'Select event',
  //             autocomplete:true,
  //             selectList: events
  //           },
  //           form_input_validation: [Validators.required]
  //         }, 0, true)
  //       });
  //     } else if (val['expense_source'] == 'OTHER') {
  //       this.removeSectionField('expense_detail', 'expense_event', 0, true);
  //     }
  //   })
  // }

  // onClick($event: { buttonId: string; rowIndex: number; }) {
  //   let item = this.accountList.content![$event.rowIndex];
  //   switch ($event.buttonId) {
  //     case 'UPDATE_EXPENSE':
  //       this.showEditForm($event.rowIndex, ['expense_detail']);
  //       this.actionName = $event.buttonId;
  //       break;
  //     case 'UPDATE_ACCOUNT':
  //       // this.addSectionInAccordion(getAccountDetailSection(item!), $event.rowIndex)
  //       this.showEditForm($event.rowIndex, ['account_detail']);
  //       this.actionName = $event.buttonId;
  //       break;
  //     case 'UPDATE_BANK_UPI':
  //       this.showEditForm($event.rowIndex, ['bank_detail', 'upi_detail']);
  //       this.actionName = $event.buttonId;
  //       
  //       break;
  //     case 'VIEW_TXN':
  //       let account = this.accountList.content![$event.rowIndex];
  //       this.router.navigate([this.app_route.secured_account_transaction_page.url.replace(':id', btoa(account.id!))], { state: account, queryParams: { self: this.tabMapping[this.tabIndex] == 'my_accounts' ? 'Y' : 'N' } })
  //       break;
  //     case 'PERFORM_TXN':
  //       this.performTransaction($event.rowIndex);
  //       this.actionName = $event.buttonId;
  //       break;
  //     case 'CONFIRM':
  //       if (this.actionName == 'UPDATE_BANK_UPI') {
  //         
  //         }
  //       }
  //       if (this.actionName == 'UPDATE_ACCOUNT') {
  //         
  //       }
  //       if (this.actionName == 'PERFORM_TXN') {
  //         
  //       }
  //       if (this.actionName == 'UPDATE_EXPENSE') {
  //         let expense_detail_form = this.getSectionForm('expense_detail', $event.rowIndex);
  //         if (expense_detail_form?.valid) {
  //           this.accountService.updateExpense(this.expenseList.content![$event.rowIndex], expense_detail_form.value).subscribe(d => {
  //             this.fetchDetails();
  //           })
  //         } else {
  //           expense_detail_form?.markAllAsTouched()
  //         }
  //       }
  //       break;
  //     case 'CREATE':
  //       if(this.tabMapping[this.tabIndex] == 'expense_list'){
  //         let expenseForm = this.getSectionForm('expense_detail', 0, true);
  //         console.log(expenseForm)
  //         if (expenseForm?.valid) {
  //           this.accountService.createExpenses(expenseForm.value).subscribe(d => {
  //             this.hideForm(0, true);
  //             this.fetchDetails()
  //           })

  //         } else {
  //           expenseForm?.markAllAsTouched();
  //         }
  //       }else{
  //         let accountForm = this.getSectionForm('account_detail', 0, true);
  //         if (accountForm?.valid) {
  //           this.accountService.createAccount(accountForm.value).subscribe(d => {
  //             this.hideForm(0, true);
  //             this.fetchDetails()
  //           })

  //         } else {
  //           accountForm?.markAllAsTouched();
  //           scrollToFirstInvalidControl(this.el.nativeElement);
  //         }
  //       }

  //       break;
  //     case 'CANCEL':
  //       this.hideForm($event.rowIndex)
  //       break;
  //     case 'CANCEL_CREATE':
  //       this.hideForm(0, true);
  //       break;

  //   }
  // }
  // performTransaction(rowIndex: number) {
  //   let account = this.accountList.content![rowIndex];
  //   this.addSectionInAccordion(transferAmountSection(account),rowIndex);
  //   this.showEditForm(rowIndex, ['transfer_amt']);
  //   this.accountService.fetchAccounts(this.pageNumber, this.pageSize).subscribe(data => {
  //     let selectList = this.getSectionField('transfer_amt', 'transferTo', rowIndex)?.form_input?.selectList;
  //     selectList?.splice(0);
  //     data?.content?.forEach(element => {
  //       let val = { key: element.id, displayValue: element.id! + '  (' + element.accountHolderName + ')' } as KeyValue;
  //       console.log(val)
  //       selectList?.push(val);
  //     });
  //   });
  // }
}
