import { Component, ElementRef } from '@angular/core';
import { Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { AccountDetail } from 'src/app/core/api/models';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';

@Component({
  selector: 'app-all-account-tab',
  templateUrl: './all-account-tab.component.html',
  styleUrls: ['./all-account-tab.component.scss']
})
export class AllAccountTabComponent {

  // protected accountList!:AccountDetail[];

  // constructor(
  //   private route: ActivatedRoute,
  //   private el: ElementRef,
  // ) {
  //   super();
  //   super.init(AccountDefaultValue.pageNumber, AccountDefaultValue.pageSize, AccountDefaultValue.pageSizeOptions)
  // }

  // override handlePageEvent($event: PageEvent): void {
  //   this.pageNumber = $event.pageIndex;
  //   this.pageSize = $event.pageSize;
  //   this.fetchDetails();
  // }
  // fetchDetails() {
  //   this.accountService.fetchAccounts({ active: true }).subscribe(s => {
  //     this.accountList = s!;
  //     this.itemLengthSubs.next(this.accountList?.totalSize!);
  //     this.showAccountList();
  //   })
  // }
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

}
