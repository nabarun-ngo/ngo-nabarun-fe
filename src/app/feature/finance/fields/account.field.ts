import { AccountConstant, accountTab } from '../finance.const';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { Account } from '../model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { FormGroup, Validators } from '@angular/forms';
import { date } from 'src/app/core/service/utilities.service';
import { EventEmitter } from '@angular/core';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { Doc } from 'src/app/shared/model/document.model';

export const accountTabHeader = (tab: accountTab) => {
  return [
    {
      value: 'Account Id',
      rounded: true,
    },
    {
      value: 'Account Type',
      rounded: true,
    },
    {
      value: 'Account Status',
      rounded: true,
    },
    tab == 'my_accounts'
      ? {
        value: 'Account Balance',
        rounded: true,
      }
      : {
        value: 'Account Holder Name',
        rounded: true,
      },
  ];
};

export const accountSearchInput = (
  tab: accountTab,
  refData: {
    [name: string]: KeyValue[];
  }
): SearchAndAdvancedSearchModel => {
  let model: SearchAndAdvancedSearchModel = {
    normalSearchPlaceHolder: 'Search for anything related to accounts here',
    advancedSearch: {
      searchFormFields: [
        {
          formControlName: 'accountId',
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
            selectList: refData['accountTypes'],
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
            selectList: refData['accountStatuses'],
          },
        },
      ],
    },
  };
  if (tab == 'all_accounts') {
    model.advancedSearch?.searchFormFields.push({
      formControlName: 'accountHolderId',
      inputModel: {
        html_id: 'account_Owner',
        tagName: 'input',
        inputType: 'text',
        autocomplete: true,
        labelName: 'Account Owner',
        selectList: [],
        placeholder: 'Ex. Sonal Gupta',
      }
    })
  }
  return model;
};

export const accountHighLevelView = (
  item: Account,
  tab: accountTab,
  refData: { [name: string]: KeyValue[] }
): AccordionCell[] => {
  return [
    {
      type: 'text',
      value: item?.id,
      bgColor: 'bg-purple-200',
    },
    {
      type: 'text',
      value: item?.accountType,
      showDisplayValue: true,
      refDataSection: AccountConstant.refDataKey.accountType,
    },
    {
      type: 'text',
      value: item?.status,
      showDisplayValue: true,
      refDataSection: AccountConstant.refDataKey.accountStatus,
    },
    tab == 'my_accounts'
      ? {
        type: 'text',
        value: '₹ ' + item?.balance,
      }
      : {
        type: 'text',
        value: item?.accountHolderName || '',
      },
  ];
};

export const accountDetailSection = (
  m: Account,
  refData: { [name: string]: KeyValue[] },
  isCreate: boolean = false
): DetailedView => {
  return {
    section_name: 'Account Detail',
    section_type: 'key_value',
    section_html_id: 'account_detail',
    section_form: new FormGroup({}),
    show_form: false,
    content: [
      {
        field_name: 'Account Id',
        field_html_id: 'account_id',
        hide_field: isCreate,
        field_value: m?.id || '',
      },
      {
        field_name: 'Account Type',
        field_html_id: 'account_type',
        field_value: m?.accountType,
        show_display_value: true,
        ref_data_section: AccountConstant.refDataKey.accountType,
        editable: isCreate,
        form_control_name: 'accountType',
        form_input: {
          tagName: 'select',
          selectList: refData![AccountConstant.refDataKey.accountType],
          placeholder: 'Ex. ',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Account Status',
        field_html_id: 'account_status',
        field_value: m?.status,
        hide_field: isCreate,
        showDisplayValue: true,
        refDataSection: AccountConstant.refDataKey.accountStatus,
        form_control_name: 'status',
        editable: !isCreate,
        form_input: {
          tagName: 'select',
          inputType: '',
          placeholder: 'Ex. Active',
          selectList: refData![AccountConstant.refDataKey.accountStatus],
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Activated On',
        field_html_id: 'creation_date',
        hide_field: isCreate,
        field_value: date(m?.activatedOn || ''),
      },
      {
        field_name: 'Current Balance',
        field_html_id: 'balance',
        hide_field: isCreate,
        field_value: '₹ ' + (m?.balance || 0),
      },

      {
        field_name: 'Account Holder',
        field_html_id: 'account_holder',
        field_value: m?.accountHolderName || '',
        editable: isCreate,
        form_control_name: 'accountHolder',
        form_input: {
          tagName: 'input',
          inputType: 'text',
          autocomplete: true,
          selectList: [],
          placeholder: 'Ex. ',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Opening Balance',
        field_html_id: 'opening_bal',
        hide_field: !isCreate,
        field_value: '',
        editable: true,
        form_control_name: 'openingBalance',
        form_input: {
          tagName: 'input',
          inputType: 'number',
          placeholder: 'Ex. 20',
        },
        form_input_validation: [],
      },
    ],
  } as DetailedView;
};

export const bankDetailSection = (m: Account) => {
  return {
    section_name: 'Bank Detail',
    section_type: 'key_value',
    section_html_id: 'bank_detail',
    section_form: new FormGroup({}),
    hide_section: !m?.bankDetail,
    content: [
      {
        field_name: 'Bank Account Number',
        field_html_id: 'bank_acc_num',
        field_value: m?.bankDetail?.accountNumber || '',
        editable: true,
        form_control_name: 'bankAccountNumber',
        form_input: {
          inputType: 'text',
          tagName: 'input',
          placeholder: 'Ex. A123456789',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Bank Account Holder Name',
        field_html_id: 'account_type',
        field_value: m?.bankDetail
          ? m?.bankDetail?.accountHolderName || ''
          : m?.accountHolderName || '',
        editable: true,
        form_control_name: 'bankAccountHolderName',
        form_input: {
          inputType: 'text',
          tagName: 'input',
          placeholder: 'Ex. Jone Doe',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Bank Name',
        field_html_id: 'bank_name',
        field_value: m?.bankDetail?.bankName || '',
        editable: true,
        form_control_name: 'bankName',
        form_input: {
          inputType: 'text',
          tagName: 'input',
          placeholder: 'Ex. Indian Bank',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Bank Account Type',
        field_html_id: 'bank_type',
        field_value: m?.bankDetail?.accountType || '',
        editable: true,
        form_control_name: 'bankAccountType',
        form_input: {
          inputType: 'text',
          tagName: 'input',
          placeholder: 'Ex. Savings',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Bank Branch Name',
        field_html_id: 'bank_branch',
        field_value: m?.bankDetail?.branch || '',
        editable: true,
        form_control_name: 'bankBranch',
        form_input: {
          inputType: 'text',
          tagName: 'input',
          placeholder: 'Ex. Kolkata',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Bank IFSC Number',
        field_html_id: 'bank_IFSC',
        field_value: m?.bankDetail?.ifscNumber || '',
        editable: true,
        form_control_name: 'IFSCNumber',
        form_input: {
          inputType: 'text',
          tagName: 'input',
          placeholder: 'Ex. IBN0000A',
        },
        form_input_validation: [Validators.required],
      },
    ],
  } as DetailedView;
};

export const upiDetailSection = (m: Account) => {
  return {
    section_name: 'UPI Detail',
    section_type: 'key_value',
    section_html_id: 'upi_detail',
    section_form: new FormGroup({}),
    hide_section: !m?.upiDetail,
    content: [
      {
        field_name: 'UPI Id',
        field_html_id: 'upi_id',
        field_value: m?.upiDetail?.upiId || '',
        editable: true,
        form_control_name: 'upiId',
        form_input: {
          inputType: 'text',
          tagName: 'input',
          placeholder: 'Ex. abcd@okhdfc',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'UPI Owner Name',
        field_html_id: 'upi_owner_name',
        field_value: m?.upiDetail
          ? m?.upiDetail.payeeName || ''
          : m?.accountHolderName || '',
        editable: true,
        form_control_name: 'payeeName',
        form_input: {
          inputType: 'text',
          tagName: 'input',
          placeholder: 'Ex. John Doe',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'UPI Mobile Number',
        field_html_id: 'upi_mob_Num',
        field_value: m?.upiDetail?.mobileNumber || '',
        editable: true,
        form_control_name: 'mobileNumber',
        form_input: {
          inputType: 'text',
          tagName: 'input',
          placeholder: 'Ex. +91 1000000001',
        },
        form_input_validation: [Validators.required],
      },
    ],
  } as DetailedView;
};

export const transferAmountSection = () => {
  return {
    section_form: new FormGroup({}),
    section_name: 'Record Amount Transfer',
    section_type: 'key_value',
    section_html_id: 'transfer_amt',
    form_alerts: [
      {
        data: {
          alertType: 'warning',
          message: 'This action only records the already transferred amount.'
        },
      }
    ],
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
          selectList: [],
        },
        form_input_validation: [Validators.required],
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
          placeholder: 'Ex. 500',
        },
        form_input_validation: [Validators.required, Validators.min(1)],
      },
      {
        field_name: 'Transfer Date',
        field_html_id: 'transfer_date',
        showDisplayValue: true,
        form_control_name: 'transferDate',
        editable: true,
        form_input: {
          tagName: 'input',
          inputType: 'date',
          placeholder: 'Ex. 13/07/2000',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Transfer Description',
        field_value: '',
        form_control_name: 'description',
        editable: true,
        field_html_id: 'description',
        form_input: {
          html_id: 'description_i',
          inputType: '',
          tagName: 'textarea',
          placeholder: 'Ex. Monthly donation',
        },
        form_input_validation: [Validators.required],
      },
    ],
  } as DetailedView;
};


export const moneyInSection = () => {
  return {
    section_form: new FormGroup({}),
    section_name: 'Record Fund Addition',
    section_type: 'key_value',
    section_html_id: 'money_in_acc',
    form_alerts: [
      {
        data: {
          alertType: 'warning',
          message: 'This action only records the already transferred amount.'
        },
      }
    ],
    hide_section: true,
    content: [
      {
        field_name: 'Fund Amount',
        field_value: '',
        form_control_name: 'amount',
        editable: true,
        field_html_id: 'amount',
        form_input: {
          html_id: 'amount_i',
          inputType: 'number',
          tagName: 'input',
          placeholder: 'Ex. 500',
        },
        form_input_validation: [Validators.required, Validators.min(1)],
      },
      {
        field_name: 'Fund Date',
        field_html_id: 'in_date',
        showDisplayValue: true,
        form_control_name: 'inDate',
        editable: true,
        form_input: {
          tagName: 'input',
          inputType: 'date',
          placeholder: 'Ex. 13/07/2000',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Fund Source',
        field_value: '',
        form_control_name: 'description',
        editable: true,
        field_html_id: 'description',
        form_input: {
          html_id: 'description_i',
          inputType: '',
          tagName: 'textarea',
          placeholder: 'Ex. Monthly donation',
        },
        form_input_validation: [Validators.required],
      },
    ],
  } as DetailedView;
};

export const accountDocumentSection = (
  docs: Doc[],
  showAlert: boolean = false
) => {
  return {
    section_name: 'Documents',
    section_type: 'doc_list',
    section_html_id: 'document_list',
    section_form: new FormGroup({}),
    form_alerts: [
      {
        data: {
          alertType: 'info',
          message: 'Please upload the screenshot of the actual fund transfer.'
        },
        hide_alert: !showAlert,
      }
    ],
    documents: docs,
    doc: {
      docChange: new EventEmitter(),
    },
  } as DetailedView;
};
