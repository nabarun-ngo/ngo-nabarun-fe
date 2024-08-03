import { Component, ElementRef, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { AccordionButton, AccordionCell } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { AccountService } from '../account.service';
import { AccountConstant, AccountDefaultValue, accountTab } from '../account.const';
import { AccountDetail, KeyValue, PaginateAccountDetail } from 'src/app/core/api/models';
import { PageEvent } from '@angular/material/paginator';
import { FormGroup, Validators } from '@angular/forms';
import { date } from 'src/app/core/service/utilities.service';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { scrollToFirstInvalidControl } from 'src/app/core/service/form.service';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
import { filter, map, pairwise, startWith } from 'rxjs';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
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
  refData: { [name: string]: KeyValue[]; } | undefined;
  app_route = AppRoute;

  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private el: ElementRef,
    private router: Router,
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
      this.refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('ACCOUNT', this.refData!);
      this.setRefData(this.refData);
    }

    this.setAccordionHeader();

    if (this.route.snapshot.data['data']) {
      this.accountList = this.route.snapshot.data['data'] as PaginateAccountDetail;
      this.setContent(this.accountList.content!,this.accountList.totalSize)
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
    if (options && options['create']) {
      return [
        section_account_detail_create,
        // section_bank_detail,
        // section_upi_detail
      ];
    }
    if(this.tabMapping[this.tabIndex] == 'all_accounts'){
      return [
        section_account_detail_update,
        section_account_owner_detail,
        section_bank_detail,
        section_upi_detail,
      ]
    }else{
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
                inputType: '',
                tagName: 'select',
                selectList: []
              },
              form_input_validation:[Validators.required]
            },
            {
              field_name: 'Transfer Amount',
              field_value: '',
              form_control_name: 'amount',
              editable: true,
              field_html_id: 'amount',
              form_input: {
                inputType: 'number',
                tagName: 'input',
                placeholder: 'Ex. 500'
              },
              form_input_validation:[Validators.required,Validators.min(1)]
            },
            {
              field_name: 'Transfer Description',
              field_value: '',
              form_control_name: 'description',
              editable: true,
              field_html_id: 'description',
              form_input: {
                inputType: 'text',
                tagName: 'input',
                placeholder: 'Ex. Monthly donation'
              },
              form_input_validation:[Validators.required]
            }
          ]
  
        }
      ];
    }
   
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
    if (this.tabMapping[this.tabIndex] == 'my_accounts') {
      return [
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
    return [
      {
        button_id: 'VIEW_TXN',
        button_name: 'View Transactions'
      },
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
      this.accountService.fetchMyAccounts(this.pageNumber,this.pageSize).subscribe(s => {
        this.accountList = s!;
        this.setContent(this.accountList.content!,this.accountList?.totalSize!)
      })
    } else if (this.tabMapping[this.tabIndex] == 'all_accounts') {
      this.accountService.fetchAccounts(this.pageNumber,this.pageSize).subscribe(s => {
        this.accountList = s!;
        this.setContent(this.accountList.content!,this.accountList?.totalSize!)
      })
    }

  }

  protected tabChanged(index: number) {
    this.tabIndex = index;
    this.pageNumber = this.defaultValue.pageNumber;
    this.pageSize = this.defaultValue.pageSize;
    this.hideCreateForm();
    this.setAccordionHeader();
    this.fetchDetails();

  }

  accordionOpened($event: { rowIndex: number; }) { }

  createAccount() {
    this.showCreateForm();

    let account_form = this.getSectionForm('account_detail');
    account_form?.valueChanges.pipe(startWith(account_form?.value), pairwise())
      .subscribe((val) => {
        //console.log(val[0] , val[1])//accountType
        if (val[1]['accountType'] && val[1]['accountType'] != '' && val[0]['accountType'] != val[1]['accountType']) {
          this.accordionList.addContent?.columns.filter(f => f.html_id == 'acc_type_h').map(m => {
            m.value = val[1]['accountType'];
            return m;
          })
          this.accountService.fetchUsers(val[1]['accountType']).subscribe(data => {
            let selectList = this.accordionList.addContent?.detailed.find(f => f.section_html_id == 'account_detail')?.content?.find(f => f.field_html_id == 'account_holder')?.form_input?.selectList;
            selectList?.splice(0);
            data?.content?.forEach(element => {
              let val = { key: element.id, displayValue: element.fullName } as KeyValue;
              selectList?.push(val);
            });
          });
        }
        if (val[0]['accountHolder'] != val[1]['accountHolder']) {
          this.accordionList.addContent?.columns.filter(f => f.html_id == 'acc_holder_h').map(m => {
            m.value = val[1]['accountHolder'];
            return m;
          })
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
        if (this.actionName == 'PERFORM_TXN') {
          let transfer_form = this.accordionList.contents[$event.rowIndex].detailed.find(f => ['transfer_amt'].includes(f.section_html_id!));
          if (transfer_form?.section_form.valid) {
            this.accountService.performTransaction(this.accountList.content![$event.rowIndex], transfer_form.section_form.value).subscribe(d => {
              this.fetchDetails();
            })
          } else {
            transfer_form?.section_form?.markAllAsTouched()
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
      case 'VIEW_TXN':
        let account = this.accountList.content![$event.rowIndex];
        this.router.navigate([this.app_route.secured_account_transaction_page.url.replace(':id', account.id!)], { state: account })
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
    this.accountService.fetchAccounts(this.pageNumber,this.pageSize).subscribe(data => {
      let selectList = this.accordionList.contents[rowIndex]?.detailed.find(f => f.section_html_id == 'transfer_amt')?.content?.find(f => f.field_html_id == 'transferTo')?.form_input?.selectList;
      selectList?.splice(0);
      data?.content?.forEach(element => {
        let val = { key: element.id, displayValue: element.id! + '  (' + element.accountHolderName + ')' } as KeyValue;
        selectList?.push(val);
      });
    });
  }

}