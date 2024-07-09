import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Paginator } from 'src/app/core/component/paginator';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { AccordionButton, AccordionCell, AccordionList, AccordionRow } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { AccountService } from '../account.service';
import { AccountConstant, AccountDefaultValue, accountTab } from '../account.const';
import { AccountDetail, BankDetail, PaginateAccountDetail, UpiDetail } from 'src/app/core/api/models';
import { PageEvent } from '@angular/material/paginator';
import { FormGroup, Validators } from '@angular/forms';
import { date } from 'src/app/core/service/utilities.service';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { scrollToFirstInvalidControl } from 'src/app/core/service/form.service';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
@Component({
  selector: 'app-account-dashboard',
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss']
})
export class AccountDashboardComponent extends Accordion<AccountDetail> implements OnInit {

  protected accountList!: PaginateAccountDetail;
  protected defaultValue = AccountDefaultValue;
  protected tabIndex!: number;
  protected tabMapping: accountTab[] = ['my_accounts', 'all_accounts'];
  actionName!: string;
  private constants = AccountConstant;

  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private el: ElementRef,
  ) {
    super();
    super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions)
  }

  ngOnInit(): void {
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
      let refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('ACCOUNT', refData);
      this.setRefData(refData);
    }

    this.setAccordionHeader();

    if (this.route.snapshot.data['data']) {
      this.accountList = this.route.snapshot.data['data'] as PaginateAccountDetail;
      this.itemLengthSubs.next(this.accountList?.totalSize!);
      this.clearContents()
      this.accountList.content?.forEach(item => {
        this.addContentRow(item);
      })
    }
  }


  setAccordionHeader() {
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

  protected override prepareHighLevelView(item: AccountDetail, options?: { [key: string]: any }): AccordionCell[] {
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
        refDataSection: this.constants.accountType
      },
      {
        type: 'text',
        value: item?.accountStatus!,
        showDisplayValue: true,
        refDataSection: this.constants.accountStatus
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

  protected override prepareDetailedView(m: AccountDetail, options?: { [key: string]: any }): DetailedView[] {
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
          refDataSection: this.constants.accountType
        },
        {
          field_name: 'Account Status',
          field_html_id: 'account_status',
          field_value: m?.accountStatus!,
          showDisplayValue: true,
          refDataSection: this.constants.accountStatus,
          form_control_name: 'status',
          editable: true,
          form_input: {
            tagName: 'select',
            inputType: '',
            placeholder: 'Ex. Approve',
            selectList: [{ key: 'ACTIVE', displayValue: 'Active' }, { key: 'INACTIVE', displayValue: 'InActive' }]
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
          showDisplayValue: true,
          refDataSection: this.constants.accountType,
          editable: true,
          form_control_name: 'accountType',
          form_input: {
            tagName: 'select',
            selectList: [{ key: 'Hel', displayValue: 'Hello' }],
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
            selectList: [{ key: 'Hel', displayValue: 'Hello' }],
            placeholder: 'Ex. '
          },
          form_input_validation: [Validators.required]
        },
      ]
    } as DetailedView;
    section_account_detail_create.section_form.valueChanges.subscribe(subs => {
      if (subs['accountType']) {
        this.accordionList.addContent?.columns.filter(f => f.html_id == 'acc_type_h').map(m => {
          m.value = subs['accountType'];
          return m;
        })
      }

      if (subs['accountHolder']) {
        this.accordionList.addContent?.columns.filter(f => f.html_id == 'acc_holder_h').map(m => {
          m.value = subs['accountHolder'];
          return m;
        })
      }
    })
    //console.log(options)
    if (options && options['create']) {
      return [
        section_account_detail_create,
        section_bank_detail,
        section_upi_detail
      ];
    }
    return [
      section_account_detail_update,
      section_account_owner_detail,
      section_bank_detail,
      section_upi_detail
    ];
  }

  protected override prepareDefaultButtons(data: AccountDetail, options?: { [key: string]: any }): AccordionButton[] {
    if (options && options['create']) {
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

    return [
      {
        button_id: 'VIEW_TXN',
        button_name: 'View Transactions'
      },
      this.tabMapping[this.tabIndex] == 'my_accounts' ?
        {
          button_id: 'UPDATE_BANK_UPI',
          button_name: 'Update Bank and UPI Detail'
        }
        :
        {
          button_id: 'UPDATE_ACCOUNT',
          button_name: 'Update Account Detail'
        }
    ];
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.fetchDetails();
  }
  fetchDetails() {
    if (this.tabMapping[this.tabIndex] == 'my_accounts') {
      this.accountService.fetchAccounts({ active: true }).subscribe(s => {
        this.accountList = s!;
        this.itemLengthSubs.next(this.accountList?.totalSize!);
        this.clearContents()
        this.accountList.content?.forEach(item => {
          this.addContentRow(item);
        })
      })
    } else if (this.tabMapping[this.tabIndex] == 'all_accounts') {
      this.accountService.fetchAccounts({ active: true }).subscribe(s => {
        this.accountList = s!;
        this.itemLengthSubs.next(this.accountList?.totalSize!);
        this.clearContents()
        this.accountList.content?.forEach(item => {
          this.addContentRow(item);
        })
      })
    }

  }

  protected tabChanged(index: number) {
    this.tabIndex = index;
    this.pageNumber = this.defaultValue.pageNumber;
    this.pageSize = this.defaultValue.pageSize;
    this.setAccordionHeader();
    this.fetchDetails();

  }

  accordionOpened($event: { rowIndex: number; }) {
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
          let bankForm = this.accordionList.contents[$event.rowIndex].detailed.find(f => ['bank_detail'].includes(f.section_html_id!));
          let upiForm = this.accordionList.contents[$event.rowIndex].detailed.find(f => ['upi_detail'].includes(f.section_html_id!));
          if (bankForm?.section_form.valid && upiForm?.section_form.valid) {
            this.accountService.updateBankingAndUPIDetail(item.id!, bankForm?.section_form.value, upiForm?.section_form.value).subscribe(d => {
              this.hideForm($event.rowIndex)
              this.fetchDetails();
            })
          } else {
            bankForm?.section_form.markAllAsTouched();
            upiForm?.section_form.markAllAsTouched();
            scrollToFirstInvalidControl(this.el.nativeElement)
          }
        }
        if (this.actionName == 'UPDATE_ACCOUNT') {
          let accountForm = this.accordionList.contents[$event.rowIndex].detailed.find(f => ['bank_detail', 'upi_detail'].includes(f.section_html_id!));
          if (accountForm?.section_form.valid) {
            this.accountService.updateAccountDetail(item.id!, accountForm?.section_form.value).subscribe(d => {
              this.hideForm($event.rowIndex)
              this.fetchDetails();
            })
          } else {
            accountForm?.section_form.markAllAsTouched()
            scrollToFirstInvalidControl(this.el.nativeElement)
          }
        }
        break;
      case 'CREATE':
        let accountForm = this.accordionList.addContent?.detailed.find(f => f.section_html_id == 'account_detail')?.section_form;
        //let bankingForm = this.accordionList.addContent?.detailed.find(f => f.section_html_id == 'bank_detail')?.section_form;
        //let upiForm = this.accordionList.addContent?.detailed.find(f => f.section_html_id == 'upi_detail')?.section_form;
        if (accountForm?.valid /*&& bankingForm?.valid && upiForm?.valid*/) {
          //bankingForm.value,upiForm.value
          this.accountService.createAccount(accountForm.value).subscribe(d => {
            this.hideCreateForm();
            this.fetchDetails()
          })

        } else {
          accountForm?.markAllAsTouched();
          //bankingForm?.markAllAsTouched();
          //upiForm?.markAllAsTouched();
          scrollToFirstInvalidControl(this.el.nativeElement);
        }
        break;
      case 'CANCEL':
        this.hideForm($event.rowIndex)
        break;
      case 'CANCEL_CREATE':
        this.hideCreateForm()
        break;
    }
  }






  /**
   * 
   * @param $event 
   * 
   * 
   * 
   * 
   * 
   * 
   * 
   */

  // private cancel_button = {
  //   button_id: 'CANCEL',
  //   button_name: 'Cancel'
  // };
  // private update_button_bank_upi = {
  //   button_id: 'UPDATE_BNK',
  //   button_name: 'Update Bank/ UPI'
  // };
  // private update_button_account = {
  //   button_id: 'UPDATE_ACC',
  //   button_name: 'Update Account'
  // };
  // private confirm_button = {
  //   button_id: 'CONFIRM',
  //   button_name: 'Confirm'
  // };

  // showAccountList() {
  //   let headers = [
  //     {
  //       value: 'Account Id',
  //       rounded: true
  //     },
  //     {
  //       value: 'Account Type',
  //       rounded: true
  //     },
  //     {
  //       value: 'Account Holder Name',
  //       rounded: true
  //     },
  //     {
  //       value: 'Account Balance',
  //       rounded: true
  //     }
  //   ]
  //   let content = this.accountList.content?.map(m => {
  //     let column_data = [
  //       {
  //         type: 'text',
  //         value: m.id,
  //         bgColor: 'bg-purple-200'
  //       },
  //       {
  //         type: 'text',
  //         value: m.accountType
  //       },
  //       {
  //         type: 'text',
  //         value: m.accountHolderName
  //       },
  //       {
  //         type: 'text',
  //         value: m.currentBalance
  //       }
  //     ] as AccordionCell[];

  //     return {
  //       columns: column_data,
  //       detailed: [
  //         {
  //           section_name: 'Account Detail',
  //           section_type: 'key_value',
  //           section_html_id: 'account_detail',
  //           section_form: new FormGroup({}),
  //           content: [
  //             {
  //               field_name: 'Account Id',
  //               field_html_id: 'account_id',
  //               field_value: m.id
  //             },
  //             {
  //               field_name: 'Account Type',
  //               field_html_id: 'account_type',
  //               field_value: m.accountType
  //             },
  //             {
  //               field_name: 'Account Status',
  //               field_html_id: 'account_status',
  //               field_value: m.accountStatus,
  //               form_control_name: 'status',
  //               editable: true,
  //               form_input: {
  //                 tagName: 'select',
  //                 inputType: '',
  //                 placeholder: 'Ex. Approve',
  //                 selectList: [{ key: 'ACTIVE', displayValue: 'Active' }, { key: 'INACTIVE', displayValue: 'InActive' }]
  //               },
  //               form_input_validation: [Validators.required]
  //             },
  //             {
  //               field_name: 'Activated On',
  //               field_html_id: 'creation_date',
  //               field_value: date(m.activatedOn)
  //             },
  //             {
  //               field_name: 'Current Balance',
  //               field_html_id: 'balance',
  //               field_value: m.currentBalance
  //             }
  //           ]
  //         },
  //         {
  //           section_name: 'Account Owner Detail',
  //           section_type: 'key_value',
  //           section_html_id: 'account_owner_detail',
  //           section_form: new FormGroup({}),
  //           content: [
  //             {
  //               field_name: 'Account Holder Id',
  //               field_html_id: 'account_holder_id',
  //               field_value: m.accountHolder?.id
  //             },
  //             {
  //               field_name: 'Account Holder Name',
  //               field_html_id: 'account_type',
  //               field_value: m.accountHolderName
  //             },
  //             {
  //               field_name: 'Account Holder Email',
  //               field_html_id: 'account_holder_email',
  //               field_value: m.accountHolder?.email,
  //             },
  //           ]
  //         },
  //         {
  //           section_name: 'Bank Detail',
  //           section_type: 'key_value',
  //           section_html_id: 'bank_detail',
  //           section_form: new FormGroup({}),
  //           hide_section: !m.bankDetail,
  //           content: [
  //             {
  //               field_name: 'Bank Account Number',
  //               field_html_id: 'bank_acc_num',
  //               field_value: m.bankDetail?.bankAccountNumber,
  //               editable: true,
  //               form_control_name: 'bankAccountNumber',
  //               form_input: {
  //                 inputType: 'text',
  //                 tagName: 'input',
  //                 placeholder: 'Ex. A123456789'
  //               },
  //               form_input_validation: [Validators.required]
  //             },
  //             {
  //               field_name: 'Bank Account Holder Name',
  //               field_html_id: 'account_type',
  //               field_value: m.bankDetail ? m.bankDetail?.bankAccountHolderName : m.accountHolderName,
  //               editable: true,
  //               form_control_name: 'bankAccountHolderName',
  //               form_input: {
  //                 inputType: 'text',
  //                 tagName: 'input',
  //                 placeholder: 'Ex. Jone Doe'
  //               },
  //               form_input_validation: [Validators.required]
  //             },
  //             {
  //               field_name: 'Bank Name',
  //               field_html_id: 'bank_name',
  //               field_value: m.bankDetail?.bankName,
  //               editable: true,
  //               form_control_name: 'bankName',
  //               form_input: {
  //                 inputType: 'text',
  //                 tagName: 'input',
  //                 placeholder: 'Ex. Indian Bank'
  //               },
  //               form_input_validation: [Validators.required]
  //             },
  //             {
  //               field_name: 'Bank Account Type',
  //               field_html_id: 'bank_type',
  //               field_value: m.bankDetail?.bankAccountType,
  //               editable: true,
  //               form_control_name: 'bankAccountType',
  //               form_input: {
  //                 inputType: 'text',
  //                 tagName: 'input',
  //                 placeholder: 'Ex. Savings'
  //               },
  //               form_input_validation: [Validators.required]
  //             },
  //             {
  //               field_name: 'Bank Branch Name',
  //               field_html_id: 'bank_branch',
  //               field_value: m.bankDetail?.bankBranch,
  //               editable: true,
  //               form_control_name: 'bankBranch',
  //               form_input: {
  //                 inputType: 'text',
  //                 tagName: 'input',
  //                 placeholder: 'Ex. Kolkata'
  //               },
  //               form_input_validation: [Validators.required]
  //             },
  //             {
  //               field_name: 'Bank IFSC Number',
  //               field_html_id: 'bank_IFSC',
  //               field_value: m.bankDetail?.IFSCNumber,
  //               editable: true,
  //               form_control_name: 'IFSCNumber',
  //               form_input: {
  //                 inputType: 'text',
  //                 tagName: 'input',
  //                 placeholder: 'Ex. IBN0000A'
  //               },
  //               form_input_validation: [Validators.required]
  //             },
  //           ]
  //         },
  //         {
  //           section_name: 'UPI Detail',
  //           section_type: 'key_value',
  //           section_html_id: 'upi_detail',
  //           section_form: new FormGroup({}),
  //           hide_section: !m.upiDetail,
  //           content: [
  //             {
  //               field_name: 'UPI Id',
  //               field_html_id: 'upi_id',
  //               field_value: m.upiDetail?.upiId,
  //               editable: true,
  //               form_control_name: 'upiId',
  //               form_input: {
  //                 inputType: 'text',
  //                 tagName: 'input',
  //                 placeholder: 'Ex. abcd@okhdfc'
  //               },
  //               form_input_validation: [Validators.required]
  //             },
  //             {
  //               field_name: 'UPI Owner Name',
  //               field_html_id: 'upi_owner_name',
  //               field_value: m.upiDetail ? m.upiDetail.payeeName : m.accountHolderName,
  //               editable: true,
  //               form_control_name: 'payeeName',
  //               form_input: {
  //                 inputType: 'text',
  //                 tagName: 'input',
  //                 placeholder: 'Ex. John Doe'
  //               },
  //               form_input_validation: [Validators.required]
  //             },
  //             {
  //               field_name: 'UPI Mobile Number',
  //               field_html_id: 'upi_mob_Num',
  //               field_value: m.upiDetail?.mobileNumber,
  //               editable: true,
  //               form_control_name: 'mobileNumber',
  //               form_input: {
  //                 inputType: 'text',
  //                 tagName: 'input',
  //                 placeholder: 'Ex. +91 1000000001'
  //               },
  //               form_input_validation: [Validators.required]
  //             },
  //           ]
  //         },
  //       ],
  //       buttons: [
  //         { button_id: 'VIEW_TXN', button_name: 'View Transactions' }, this.update_button_account, this.update_button_bank_upi
  //       ]
  //     } as AccordionRow;
  //   })
  //   this.accordionList = {
  //     headers: headers,
  //     contents: content!,
  //   }


  // }

  // accordionOpened($event: { rowIndex: number; }) { }

  // onClick1($event: { buttonId: string; rowIndex: number; }) {
  //   switch ($event.buttonId) {
  //     case 'UPDATE_ACC':
  //       this.accordionList.contents[$event.rowIndex].detailed.filter(f => ['account_detail'].includes(f.section_html_id!)).map(m => {
  //         console.log(m)
  //         m.show_form = true;
  //         m.hide_section = false;
  //         m.content?./*filter(f => ['remarks', 'decision'].includes(f.field_html_id!)).*/map(m => {
  //           m.hide_field = false;
  //           return m;
  //         })
  //         return m;
  //       });
  //       let index = this.accordionList.contents[$event.rowIndex].buttons?.findIndex(f => f.button_id == this.update_button_account.button_id);
  //       this.accordionList.contents[$event.rowIndex].buttons?.splice(index!, 1)
  //       let index_2 = this.accordionList.contents[$event.rowIndex].buttons?.findIndex(f => f.button_id == this.update_button_bank_upi.button_id);
  //       this.accordionList.contents[$event.rowIndex].buttons?.splice(index_2!, 1)
  //       this.accordionList.contents[$event.rowIndex].buttons?.push(this.cancel_button)
  //       this.accordionList.contents[$event.rowIndex].buttons?.push(this.confirm_button)
  //       break;
  //     case 'UPDATE_BNK':
  //       this.accordionList.contents[$event.rowIndex].detailed.filter(f => ['bank_detail', 'upi_detail'].includes(f.section_html_id!)).map(m => {
  //         console.log(m)
  //         m.show_form = true;
  //         m.hide_section = false;
  //         m.content?.map(m => {
  //           m.hide_field = false;
  //           return m;
  //         })
  //         return m;
  //       });
  //       let index_bnk = this.accordionList.contents[$event.rowIndex].buttons?.findIndex(f => f.button_id == this.update_button_account.button_id);
  //       this.accordionList.contents[$event.rowIndex].buttons?.splice(index_bnk!, 1)
  //       let index_1 = this.accordionList.contents[$event.rowIndex].buttons?.findIndex(f => f.button_id == this.update_button_bank_upi.button_id);
  //       this.accordionList.contents[$event.rowIndex].buttons?.splice(index_1!, 1)
  //       this.accordionList.contents[$event.rowIndex].buttons?.push(this.cancel_button)
  //       this.accordionList.contents[$event.rowIndex].buttons?.push(this.confirm_button)
  //       break;
  //     case 'CONFIRM':
  //       let bankUPIForm = this.accordionList.contents[$event.rowIndex].detailed.find(f => ['bank_detail', 'upi_detail'].includes(f.section_html_id!));
  //       let accountForm = this.accordionList.contents[$event.rowIndex].detailed.find(f => ['bank_detail', 'upi_detail'].includes(f.section_html_id!));
  //       let item = this.accountList.content![$event.rowIndex];

  //       if (bankUPIForm?.show_form) {
  //         this.accountService.updateBankingAndUPIDetail(item.id!, bankUPIForm.section_form.value).subscribe(d => { })
  //       }
  //       if (accountForm?.show_form) {
  //         this.accountService.updateAccountDetail(item.id!, accountForm.section_form.value).subscribe(d => { })
  //       }
  //       break;
  //     case 'CANCEL':
  //       this.cancelOption($event.rowIndex);
  //       break;
  //   }

  // }
  // cancelOption(rowIndex: number) {
  //   this.accordionList.contents[rowIndex].detailed/*.filter(f => f.section_html_id == 'work_detail')*/.map(m => {
  //     m.show_form = false;
  //     m.section_form?.reset();
  //     return m;
  //   });
  //   let confirm_btn_index = this.accordionList.contents[rowIndex].buttons?.findIndex(f => f.button_id == this.confirm_button.button_id);
  //   this.accordionList.contents[rowIndex].buttons?.splice(confirm_btn_index!, 1)
  //   let cancel_btn_index = this.accordionList.contents[rowIndex].buttons?.findIndex(f => f.button_id == this.cancel_button.button_id);
  //   this.accordionList.contents[rowIndex].buttons?.splice(cancel_btn_index!, 1)
  //   this.accordionList.contents[rowIndex].buttons?.push(this.update_button_account)
  //   this.accordionList.contents[rowIndex].buttons?.push(this.update_button_bank_upi)

  // }

  // showCreateAccount() {
  //   let account_section = {
  //     section_name: 'Account Detail',
  //     section_type: 'key_value',
  //     section_html_id: 'account_detail',
  //     section_form: new FormGroup({}),
  //     show_form: true,
  //     content: [

  //       {
  //         field_name: 'Account Type',
  //         field_html_id: 'account_type',
  //         field_value: '',
  //         editable: true,
  //         form_control_name: 'accountType',
  //         form_input: {
  //           tagName: 'select',
  //           selectList: [{ key: 'Hel', displayValue: 'Hello' }],
  //           placeholder: 'Ex. '
  //         },
  //         form_input_validation: [Validators.required]
  //       },
  //       {
  //         field_name: 'Account Holder',
  //         field_html_id: 'account_holder',
  //         field_value: '',
  //         editable: true,
  //         form_control_name: 'accountHolder',
  //         form_input: {
  //           tagName: 'select',
  //           selectList: [{ key: 'Hel', displayValue: 'Hello' }],
  //           placeholder: 'Ex. '
  //         },
  //         form_input_validation: [Validators.required]
  //       },
  //     ]
  //   } as DetailedView;
  //   account_section.section_form.valueChanges.subscribe(subs => {
  //     if (subs['accountType']) {
  //       this.accordionList.addContent?.columns.filter(f => f.html_id == 'acc_type_h').map(m => {
  //         m.value = subs['accountType'];
  //         return m;
  //       })
  //     }

  //     if (subs['accountHolder']) {
  //       this.accordionList.addContent?.columns.filter(f => f.html_id == 'acc_holder_h').map(m => {
  //         m.value = subs['accountHolder'];
  //         return m;
  //       })
  //     }
  //   })
  //   let bank_detail_section = {
  //     section_name: 'Bank Detail',
  //     section_type: 'key_value',
  //     section_html_id: 'bank_detail',
  //     section_form: new FormGroup({}),
  //     show_form: true,
  //     content: [
  //       {
  //         field_name: 'Bank Account Number',
  //         field_html_id: 'bank_acc_num',
  //         field_value: '',
  //         editable: true,
  //         form_control_name: 'bankAccountNumber',
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'input',
  //           placeholder: 'Ex. A123456789'
  //         },
  //         form_input_validation: [Validators.required]
  //       },
  //       {
  //         field_name: 'Bank Account Holder Name',
  //         field_html_id: 'account_type',
  //         field_value: '',
  //         editable: true,
  //         form_control_name: 'bankAccountHolderName',
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'input',
  //           placeholder: 'Ex. Jone Doe'
  //         },
  //         form_input_validation: [Validators.required]
  //       },
  //       {
  //         field_name: 'Bank Name',
  //         field_html_id: 'bank_name',
  //         field_value: '',
  //         editable: true,
  //         form_control_name: 'bankName',
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'input',
  //           placeholder: 'Ex. Indian Bank'
  //         },
  //         form_input_validation: [Validators.required]
  //       },
  //       {
  //         field_name: 'Bank Account Type',
  //         field_html_id: 'bank_type',
  //         field_value: '',
  //         editable: true,
  //         form_control_name: 'bankAccountType',
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'input',
  //           placeholder: 'Ex. Savings'
  //         },
  //         form_input_validation: [Validators.required]
  //       },
  //       {
  //         field_name: 'Bank Branch Name',
  //         field_html_id: 'bank_branch',
  //         field_value: '',
  //         editable: true,
  //         form_control_name: 'bankBranch',
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'input',
  //           placeholder: 'Ex. Kolkata'
  //         },
  //         form_input_validation: [Validators.required]
  //       },
  //       {
  //         field_name: 'Bank IFSC Number',
  //         field_html_id: 'bank_IFSC',
  //         field_value: '',
  //         editable: true,
  //         form_control_name: 'IFSCNumber',
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'input',
  //           placeholder: 'Ex. IBN0000A'
  //         },
  //         form_input_validation: [Validators.required]
  //       },
  //     ]
  //   } as DetailedView;
  //   let upi_detail_section = {
  //     section_name: 'UPI Detail',
  //     section_type: 'key_value',
  //     section_html_id: 'upi_detail',
  //     section_form: new FormGroup({}),
  //     show_form: true,
  //     content: [
  //       {
  //         field_name: 'UPI Id',
  //         field_html_id: 'upi_id',
  //         field_value: '',
  //         editable: true,
  //         form_control_name: 'upiId',
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'input',
  //           placeholder: 'Ex. abcd@okhdfc'
  //         },
  //         form_input_validation: [Validators.required]
  //       },
  //       {
  //         field_name: 'UPI Owner Name',
  //         field_html_id: 'upi_owner_name',
  //         field_value: '',
  //         editable: true,
  //         form_control_name: 'payeeName',
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'input',
  //           placeholder: 'Ex. John Doe'
  //         },
  //         form_input_validation: [Validators.required]
  //       },
  //       {
  //         field_name: 'UPI Mobile Number',
  //         field_html_id: 'upi_mob_Num',
  //         field_value: '',
  //         editable: true,
  //         form_control_name: 'mobileNumber',
  //         form_input: {
  //           inputType: 'text',
  //           tagName: 'input',
  //           placeholder: 'Ex. +91 1000000001'
  //         },
  //         form_input_validation: [Validators.required]
  //       },
  //     ]
  //   } as DetailedView;

  //   this.accordionList.addContent = {
  //     columns: [
  //       {
  //         type: 'text',
  //         value: '-',
  //         bgColor: 'bg-purple-200'
  //       },
  //       {
  //         type: 'text',
  //         html_id: 'acc_type_h',
  //         value: ''
  //       },
  //       {
  //         type: 'text',
  //         html_id: 'acc_holder_h',
  //         value: ''
  //       },
  //       {
  //         type: 'text',
  //         value: '-'
  //       }
  //     ],
  //     detailed: [
  //       account_section,
  //       bank_detail_section,
  //       upi_detail_section
  //     ],
  //     buttons: [
  //       { button_id: 'CREATE', button_name: 'Create' }, { button_id: 'DISMISS', button_name: 'Cancel' }
  //     ]
  //   } as AccordionRow;


  // }

  // onClickCreate($event: { buttonId: string; rowIndex: number; }) {
  //   switch ($event.buttonId) {
  //     case 'DISMISS':
  //       this.accordionList.addContent = undefined;
  //       break;

  //   }

  // }
}
