import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { AccordionButton, AccordionCell } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { AccountService } from '../account.service';
import { AccountConstant, AccountDefaultValue, accountTab } from '../account.const';
import { AccountDetail, ExpenseDetail, KeyValue, PaginateAccountDetail, PaginateExpenseDetail } from 'src/app/core/api/models';
import { PageEvent } from '@angular/material/paginator';
import { FormGroup, Validators } from '@angular/forms';
import { compareObjects, date, isEmpty, isEmptyObject } from 'src/app/core/service/utilities.service';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { filterFormChange, scrollToFirstInvalidControl } from 'src/app/core/service/form.service';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
import { filter, map, pairwise, startWith } from 'rxjs';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/components/search-and-advanced-search-form/search-and-advanced-search.model';
@Component({
  selector: 'app-account-dashboard',
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss']
})
export class AccountDashboardComponent extends Accordion<AccountDetail | ExpenseDetail> implements OnInit {


  protected scope = SCOPE;
  protected accountList!: PaginateAccountDetail;
  protected defaultValue = AccountDefaultValue;
  protected tabIndex!: number;
  protected tabMapping: accountTab[] = ['my_accounts', 'all_accounts', 'expense_list'];
  actionName!: string;
  private constants = AccountConstant;
  refData!: { [name: string]: KeyValue[]; };
  app_route = AppRoute;
  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  canViewAccounts!: boolean;
  canCreateAccount!: boolean;
  canUpdateAccount!: boolean;
  canViewTransactions!: boolean;
  searchInput!: SearchAndAdvancedSearchModel;
  expenseList!: PaginateExpenseDetail;

  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private el: ElementRef,
    private router: Router,
    private identityService: UserIdentityService,
  ) {
    super();
    super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions)
  }

  ngOnInit(): void {
    this.canViewAccounts = this.identityService.isAccrediatedTo(this.scope.read.accounts)
    this.canCreateAccount = this.identityService.isAccrediatedTo(this.scope.create.account)
    this.canUpdateAccount = this.identityService.isAccrediatedTo(this.scope.update.account)
    this.canViewTransactions = this.identityService.isAccrediatedTo(this.scope.read.transactions)


    /**
     * Setting page name
     */
    this.sharedDataService.setPageName(this.defaultValue.pageTitle);

    /**
     * Mapping tab
     */
    let tab = this.route.snapshot.data["tab"] ? this.route.snapshot.data["tab"] as accountTab : this.defaultValue.tabName;
    this.tabMapping.forEach((value: accountTab, key: number) => {
      if (tab == value) {
        this.tabIndex = key;
      }
    })

    /**
     * Setting RefData from router
     */
    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('ACCOUNT', this.refData!);
      this.setRefData(this.refData);
    }

    this.setAccordionHeader();

    if (this.route.snapshot.data['data']) {
      this.accountList = this.route.snapshot.data['data'] as PaginateAccountDetail;
      this.setContent(this.accountList.content!, this.accountList.totalSize)
    }

    this.searchInput = {
      normalSearchPlaceHolder: 'Search Account Number',
      advancedSearch: {
        searchFormFields: [
          {
            formControlName: 'accountNo',
            inputModel: {
              tagName: 'input',
              inputType: 'text',
              html_id: 'accountNo',
              labelName: 'Account Number',
              placeholder: 'Enter Account Number',
            },
          },
          {
            formControlName: 'type',
            inputModel: {
              tagName: 'select',
              inputType: 'multiselect',
              html_id: 'type',
              labelName: 'Account Type',
              placeholder: 'Select Account Type',
              selectList: this.refData['accountTypes']
            },
          },
          {
            formControlName: 'status',
            inputModel: {
              tagName: 'select',
              inputType: 'multiselect',
              html_id: 'status',
              labelName: 'Account Status',
              placeholder: 'Select Account Status',
              selectList: this.refData['accountStatuses']
            },
          }
        ]
      }
    };
  }


  setAccordionHeader() {
    if (this.tabMapping[this.tabIndex] == 'expense_list') {
      this.setHeaderRow([
        {
          value: 'Expense Id',
          rounded: true
        },
        {
          value: 'Expense Name',
          rounded: true
        },
        {
          value: 'Expense Amount',
          rounded: true
        },
        {
          value: 'Expense Status',
          rounded: true
        },
      ])
    } else {
      this.setHeaderRow([
        {
          value: 'Account Id',
          rounded: true
        },
        {
          value: 'Account Type',
          rounded: true
        },
        {
          value: 'Account Type',
          rounded: true
        },
        this.tabMapping[this.tabIndex] == 'my_accounts' ?
          {
            value: 'Account Balance',
            rounded: true
          }
          :
          {
            value: 'Account Holder Name',
            rounded: true
          }
      ])
    }

  }

  protected override prepareHighLevelView(itemG: AccountDetail | ExpenseDetail, options?: { [key: string]: any }): AccordionCell[] {
    if (this.tabMapping[this.tabIndex] == 'expense_list') {
      let item = itemG as ExpenseDetail;
      return [
        {
          type: 'text',
          value: item?.id!,
          bgColor: 'bg-purple-200'
        },
        {
          type: 'text',
          value: item?.name!,
        },
        {
          type: 'text',
          value: '₹ ' + (item?.finalAmount? item?.finalAmount : '0'),
        },
        {
          type: 'text',
          value: item?.approved ? 'Final' : 'Draft',
          bgColor: item?.approved ? 'bg-green-500' : 'bg-purple-200'
        }
      ]
    } else {
      let item = itemG as AccountDetail;
      return [
        {
          type: 'text',
          value: item?.id!,
          bgColor: 'bg-purple-200'
        },
        {
          type: 'text',
          value: item?.accountType!,
          showDisplayValue: true,
          refDataSection: this.constants.refDataKey.accountType
        },
        {
          type: 'text',
          value: item?.accountStatus!,
          showDisplayValue: true,
          refDataSection: this.constants.refDataKey.accountStatus
        },
        this.tabMapping[this.tabIndex] == 'my_accounts' ?
          {
            type: 'text',
            value: '₹ ' + item?.currentBalance
          }
          :
          {
            type: 'text',
            value: item?.accountHolderName!
          }
      ]
    }

  }

  protected override prepareDetailedView(item: AccountDetail | ExpenseDetail, options?: { [key: string]: any, create: boolean }): DetailedView[] {
    if (this.tabMapping[this.tabIndex] == 'expense_list') {
      let m = item as ExpenseDetail;
      return [
        {
          section_name: 'Expense Detail',
          section_type: 'key_value',
          section_html_id: 'expense_detail',
          section_form: new FormGroup({}),
          hide_section: false,
          content: [
            {
              field_name: 'Expense Id',
              field_html_id: 'exp_id',
              field_value: m?.id!,
            },
            {
              field_name: 'Expense Name',
              field_html_id: 'exp_name',
              field_value: m?.name!,
              editable: true,
              form_control_name: 'name',
              form_input: {
                html_id:'name_inp',
                inputType: 'text',
                tagName: 'input',
                placeholder: 'Ex. Lorem Ipsum'
              },
              form_input_validation: [Validators.required]
            },
            {
              field_name: 'Expense Description',
              field_html_id: 'exp_desc',
              field_value: m?.description!,
              editable: true,
              form_control_name: 'description',
              form_input: {
                html_id:'description_inp',
                inputType: '',
                tagName: 'textarea',
                placeholder: 'Ex. Lorem Ipsum'
              },
              form_input_validation: [Validators.required]
            },
          ]
        }
      ];
    } else {
      let m = item as AccountDetail;
      let section_upi_detail = {
        section_name: 'UPI Detail',
        section_type: 'key_value',
        section_html_id: 'upi_detail',
        section_form: new FormGroup({}),
        hide_section: !m?.upiDetail,
        content: [
          {
            field_name: 'UPI Id',
            field_html_id: 'upi_id',
            field_value: m?.upiDetail?.upiId!,
            editable: true,
            form_control_name: 'upiId',
            form_input: {
              inputType: 'text',
              tagName: 'input',
              placeholder: 'Ex. abcd@okhdfc'
            },
            form_input_validation: [Validators.required]
          },
          {
            field_name: 'UPI Owner Name',
            field_html_id: 'upi_owner_name',
            field_value: m?.upiDetail ? m?.upiDetail.payeeName! : m?.accountHolderName!,
            editable: true,
            form_control_name: 'payeeName',
            form_input: {
              inputType: 'text',
              tagName: 'input',
              placeholder: 'Ex. John Doe'
            },
            form_input_validation: [Validators.required]
          },
          {
            field_name: 'UPI Mobile Number',
            field_html_id: 'upi_mob_Num',
            field_value: m?.upiDetail?.mobileNumber!,
            editable: true,
            form_control_name: 'mobileNumber',
            form_input: {
              inputType: 'text',
              tagName: 'input',
              placeholder: 'Ex. +91 1000000001'
            },
            form_input_validation: [Validators.required]
          },
        ]
      } as DetailedView;
      let section_account_detail_update = {
        section_name: 'Account Detail',
        section_type: 'key_value',
        section_html_id: 'account_detail',
        section_form: new FormGroup({}),
        content: [
          {
            field_name: 'Account Id',
            field_html_id: 'account_id',
            field_value: m?.id!
          },
          {
            field_name: 'Account Type',
            field_html_id: 'account_type',
            field_value: m?.accountType!,
            showDisplayValue: true,
            refDataSection: this.constants.refDataKey.accountType
          },
          {
            field_name: 'Account Status',
            field_html_id: 'account_status',
            field_value: m?.accountStatus!,
            showDisplayValue: true,
            refDataSection: this.constants.refDataKey.accountStatus,
            form_control_name: 'status',
            editable: true,
            form_input: {
              tagName: 'select',
              inputType: '',
              placeholder: 'Ex. Approve',
              selectList: this.refData![this.constants.refDataKey.accountStatus]
            },
            form_input_validation: [Validators.required]
          },
          {
            field_name: 'Activated On',
            field_html_id: 'creation_date',
            field_value: date(m?.activatedOn!)
          },
          {
            field_name: 'Current Balance',
            field_html_id: 'balance',
            field_value: '₹ ' + m?.currentBalance
          }
        ]
      } as DetailedView;
      let section_account_owner_detail = {
        section_name: 'Account Owner Detail',
        section_type: 'key_value',
        section_html_id: 'account_owner_detail',
        section_form: new FormGroup({}),
        content: [
          {
            field_name: 'Account Holder Id',
            field_html_id: 'account_holder_id',
            field_value: m?.accountHolder?.id!
          },
          {
            field_name: 'Account Holder Name',
            field_html_id: 'account_type',
            field_value: m?.accountHolderName!
          }
        ]
      } as DetailedView;
      let section_bank_detail = {
        section_name: 'Bank Detail',
        section_type: 'key_value',
        section_html_id: 'bank_detail',
        section_form: new FormGroup({}),
        hide_section: !m?.bankDetail,
        content: [
          {
            field_name: 'Bank Account Number',
            field_html_id: 'bank_acc_num',
            field_value: m?.bankDetail?.bankAccountNumber!,
            editable: true,
            form_control_name: 'bankAccountNumber',
            form_input: {
              inputType: 'text',
              tagName: 'input',
              placeholder: 'Ex. A123456789'
            },
            form_input_validation: [Validators.required]
          },
          {
            field_name: 'Bank Account Holder Name',
            field_html_id: 'account_type',
            field_value: m?.bankDetail ? m?.bankDetail?.bankAccountHolderName! : m?.accountHolderName!,
            editable: true,
            form_control_name: 'bankAccountHolderName',
            form_input: {
              inputType: 'text',
              tagName: 'input',
              placeholder: 'Ex. Jone Doe'
            },
            form_input_validation: [Validators.required]
          },
          {
            field_name: 'Bank Name',
            field_html_id: 'bank_name',
            field_value: m?.bankDetail?.bankName!,
            editable: true,
            form_control_name: 'bankName',
            form_input: {
              inputType: 'text',
              tagName: 'input',
              placeholder: 'Ex. Indian Bank'
            },
            form_input_validation: [Validators.required]
          },
          {
            field_name: 'Bank Account Type',
            field_html_id: 'bank_type',
            field_value: m?.bankDetail?.bankAccountType!,
            editable: true,
            form_control_name: 'bankAccountType',
            form_input: {
              inputType: 'text',
              tagName: 'input',
              placeholder: 'Ex. Savings'
            },
            form_input_validation: [Validators.required]
          },
          {
            field_name: 'Bank Branch Name',
            field_html_id: 'bank_branch',
            field_value: m?.bankDetail?.bankBranch!,
            editable: true,
            form_control_name: 'bankBranch',
            form_input: {
              inputType: 'text',
              tagName: 'input',
              placeholder: 'Ex. Kolkata'
            },
            form_input_validation: [Validators.required]
          },
          {
            field_name: 'Bank IFSC Number',
            field_html_id: 'bank_IFSC',
            field_value: m?.bankDetail?.IFSCNumber!,
            editable: true,
            form_control_name: 'IFSCNumber',
            form_input: {
              inputType: 'text',
              tagName: 'input',
              placeholder: 'Ex. IBN0000A'
            },
            form_input_validation: [Validators.required]
          },
        ]
      } as DetailedView;
      let section_account_detail_create = {
        section_name: 'Account Detail',
        section_type: 'key_value',
        section_html_id: 'account_detail',
        section_form: new FormGroup({}),
        show_form: true,
        content: [
          {
            field_name: 'Account Type',
            field_html_id: 'account_type',
            field_value: '',
            show_display_value: true,
            ref_data_section: this.constants.refDataKey.accountType,
            editable: true,
            form_control_name: 'accountType',
            form_input: {
              tagName: 'select',
              selectList: this.refData![this.constants.refDataKey.accountType],
              placeholder: 'Ex. '
            },
            form_input_validation: [Validators.required]
          },
          {
            field_name: 'Account Holder',
            field_html_id: 'account_holder',
            field_value: '',
            editable: true,
            form_control_name: 'accountHolder',
            form_input: {
              tagName: 'select',
              selectList: [],
              placeholder: 'Ex. '
            },
            form_input_validation: [Validators.required]
          },
          {
            field_name: 'Opening Balance',
            field_html_id: 'opening_bal',
            field_value: '',
            editable: true,
            form_control_name: 'openingBalance',
            form_input: {
              tagName: 'input',
              placeholder: 'Ex. 20'
            },
            form_input_validation: []
          },
        ]
      } as DetailedView;
      //console.log(options)
      if (options && options.create) {
        return [
          section_account_detail_create,
          // section_bank_detail,
          // section_upi_detail
        ];
      }
      if (this.tabMapping[this.tabIndex] == 'all_accounts') {
        return [
          section_account_detail_update,
          section_account_owner_detail,
          section_bank_detail,
          section_upi_detail,
        ]
      } else {
        return [
          section_account_detail_update,
          section_bank_detail,
          section_upi_detail,
          {
            section_form: new FormGroup({}),
            section_name: 'Transfer Amount',
            section_type: 'key_value',
            section_html_id: 'transfer_amt',
            hide_section: true,
            content: [
              {
                field_name: 'Select Transfer To Account',
                field_value: '',
                form_control_name: 'transferTo',
                editable: true,
                field_html_id: 'transferTo',
                form_input: {
                  html_id: 'transferTo_inp',
                  inputType: '',
                  tagName: 'select',
                  selectList: []
                },
                form_input_validation: [Validators.required]
              },
              {
                field_name: 'Transfer Amount',
                field_value: '',
                form_control_name: 'amount',
                editable: true,
                field_html_id: 'amount',
                form_input: {
                  html_id: 'amount_i',
                  inputType: 'number',
                  tagName: 'input',
                  placeholder: 'Ex. 500'
                },
                form_input_validation: [Validators.required, Validators.min(1)]
              },
              {
                field_name: 'Transfer Description',
                field_value: '',
                form_control_name: 'description',
                editable: true,
                field_html_id: 'description',
                form_input: {
                  html_id: 'description_i',
                  inputType: 'text',
                  tagName: 'input',
                  placeholder: 'Ex. Monthly donation'
                },
                form_input_validation: [Validators.required]
              }
            ]

          }
        ];
      }
    }



  }

  protected override prepareDefaultButtons(data: AccountDetail , options?: { [key: string]: any, create: boolean }): AccordionButton[] {
    if (options && options.create) {
      return [
        {
          button_id: 'CANCEL_CREATE',
          button_name: 'Cancel'
        },
        {
          button_id: 'CREATE',
          button_name: 'Create'
        }
      ];
    }
    let buttons = []
    if (this.tabMapping[this.tabIndex] == 'expense_list'){
      return [
        {
          button_id: 'ADD_NEW_EXP_ITEM',
          button_name: 'Add New Item'
        },
        {
          button_id: 'UPDATE',
          button_name: 'Update'
        },
      ]
    }else{
     
      if (this.tabMapping[this.tabIndex] == 'my_accounts') {
        return [
          {
            button_id: 'ADD_MONEY',
            button_name: 'Add Money'
          },
          {
            button_id: 'VIEW_TXN',
            button_name: 'View Transactions'
          },
          {
            button_id: 'PERFORM_TXN',
            button_name: 'Transfer'
          },
          {
            button_id: 'UPDATE_BANK_UPI',
            button_name: 'Update Bank and UPI Detail'
          }
        ]
      }
      
      if (this.canViewTransactions) {
        buttons.push({
          button_id: 'VIEW_TXN',
          button_name: 'View Transactions'
        })
      }
      if (this.canUpdateAccount) {
        buttons.push({
          button_id: 'UPDATE_ACCOUNT',
          button_name: 'Update Account Detail'
        })
      }
    }
    
    return buttons;
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.fetchDetails();
  }
  fetchDetails(filter?: {
    status?: string[]
    type?: string[],
    accountNo?: string
  }) {
    if (this.tabMapping[this.tabIndex] == 'my_accounts') {
      this.accountService.fetchMyAccounts(this.pageNumber, this.pageSize, filter).subscribe(s => {
        this.accountList = s!;
        this.setContent(this.accountList.content!, this.accountList?.totalSize!)
      })
    } else if (this.tabMapping[this.tabIndex] == 'all_accounts') {
      this.accountService.fetchAccounts(this.pageNumber, this.pageSize, filter).subscribe(s => {
        this.accountList = s!;
        this.setContent(this.accountList.content!, this.accountList?.totalSize!)
      })
    }
    else if (this.tabMapping[this.tabIndex] == 'expense_list') {
      this.accountService.fetchExpenses(this.pageNumber, this.pageSize, filter).subscribe(s => {
        this.expenseList = s!;
        this.setContent(this.expenseList.content!, this.expenseList?.totalSize!)
      })
    }

  }

  protected tabChanged(index: number) {
    this.tabIndex = index;
    this.pageNumber = this.defaultValue.pageNumber;
    this.pageSize = this.defaultValue.pageSize;
    this.hideForm(0, true);
    this.setAccordionHeader();
    this.fetchDetails();

  }

  accordionOpened($event: { rowIndex: number; }) { }

  createAccount() {
    this.showCreateForm();

    let account_form = this.getSectionForm('account_detail', 0, true);
    account_form?.valueChanges.pipe(filterFormChange(account_form.value))
      .subscribe((val) => {
        console.log(val)
        if (val['accountType']) {
          // this.accordionList.addContent?.columns.filter(f => f.html_id == 'acc_type_h').map(m => {
          //   m.value = val['accountType'];
          //   return m;
          // })
          this.accountService.fetchUsers(val['accountType']).subscribe(data => {
            let selectList = this.getSectionField('account_detail', 'account_holder', 0, true)?.form_input?.selectList;
            selectList?.splice(0);
            data?.content?.forEach(element => {
              let val = { key: element.id, displayValue: element.fullName } as KeyValue;
              selectList?.push(val);
            });
          });
        }
        if (val['accountHolder']) {
          // this.accordionList.addContent?.columns.filter(f => f.html_id == 'acc_holder_h').map(m => {
          //   m.value = val['accountHolder'];
          //   return m;
          // })
        }

      });
  }

  onClick($event: { buttonId: string; rowIndex: number; }) {
    switch ($event.buttonId) {
      case 'UPDATE_ACCOUNT':
        this.showForm($event.rowIndex, ['account_detail']);
        this.actionName = $event.buttonId;
        break;
      case 'UPDATE_BANK_UPI':
        this.showForm($event.rowIndex, ['bank_detail', 'upi_detail']);
        this.actionName = $event.buttonId;
        break;
      case 'CONFIRM':
        let item = this.accountList.content![$event.rowIndex];
        if (this.actionName == 'UPDATE_BANK_UPI') {
          let bankForm = this.getSectionForm('bank_detail', $event.rowIndex);
          let upiForm = this.getSectionForm('upi_detail', $event.rowIndex);

          if (bankForm?.valid && upiForm?.valid) {
            this.accountService.updateBankingAndUPIDetail(item.id!, bankForm?.value, upiForm?.value).subscribe(d => {
              this.hideForm($event.rowIndex)
              this.fetchDetails();
            })
          } else {
            bankForm?.markAllAsTouched();
            upiForm?.markAllAsTouched();
            scrollToFirstInvalidControl(this.el.nativeElement)
          }
        }
        if (this.actionName == 'UPDATE_ACCOUNT') {
          let accountForm = this.getSectionForm('account_detail', $event.rowIndex);
          if (accountForm?.valid) {
            this.accountService.updateAccountDetail(item.id!, accountForm?.value).subscribe(d => {
              this.hideForm($event.rowIndex)
              this.fetchDetails();
            })
          } else {
            accountForm?.markAllAsTouched()
            scrollToFirstInvalidControl(this.el.nativeElement)
          }
        }
        if (this.actionName == 'PERFORM_TXN') {
          let transfer_form = this.getSectionForm('transfer_amt', $event.rowIndex);
          if (transfer_form?.valid) {
            this.accountService.performTransaction(this.accountList.content![$event.rowIndex], transfer_form.value).subscribe(d => {
              this.fetchDetails();
            })
          } else {
            transfer_form?.markAllAsTouched()
            scrollToFirstInvalidControl(this.el.nativeElement)
          }
        }
        break;
      case 'CREATE':
        let accountForm = this.getSectionForm('account_detail', 0, true);
        if (accountForm?.valid) {
          this.accountService.createAccount(accountForm.value).subscribe(d => {
            this.hideForm(0, true);
            this.fetchDetails()
          })

        } else {
          accountForm?.markAllAsTouched();
          scrollToFirstInvalidControl(this.el.nativeElement);
        }
        break;
      case 'CANCEL':
        this.hideForm($event.rowIndex)
        break;
      case 'CANCEL_CREATE':
        this.hideForm(0, true);
        break;
      case 'VIEW_TXN':
        let account = this.accountList.content![$event.rowIndex];
        this.router.navigate([this.app_route.secured_account_transaction_page.url.replace(':id', account.id!)], { state: account, queryParams: { self: this.tabMapping[this.tabIndex] == 'my_accounts' } })
        break;
      case 'PERFORM_TXN':
        this.performTransaction($event.rowIndex);
        this.actionName = $event.buttonId;
        break;
    }
  }
  performTransaction(rowIndex: number) {
    //let account1 = this.accountList.content![$event.rowIndex];
    this.showForm(rowIndex, ['transfer_amt']);
    this.accountService.fetchAccounts(this.pageNumber, this.pageSize).subscribe(data => {
      let selectList = this.getSectionField('transfer_amt', 'transferTo', rowIndex)?.form_input?.selectList;
      selectList?.splice(0);
      data?.content?.forEach(element => {
        let val = { key: element.id, displayValue: element.id! + '  (' + element.accountHolderName + ')' } as KeyValue;
        console.log(val)
        selectList?.push(val);
      });
    });
  }

  onSearch($event: { advancedSearch: boolean; reset: boolean; value: any; }) {
    if ($event.advancedSearch && !$event.reset) {
      console.log($event.value)
      this.fetchDetails({
        accountNo: $event.value.accountNo,
        status: $event.value.status,
        type: $event.value.type,
      })
    }
    else if ($event.advancedSearch && $event.reset) {
      this.fetchDetails()
    }
    else {
      this.getAccordionList().searchValue = $event.value as string;
    }
  }

}
