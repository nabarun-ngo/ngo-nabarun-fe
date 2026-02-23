import { EventEmitter } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';

import { Accordion } from 'src/app/shared/utils/accordion';
import {
  AccordionButton,
  AccordionCell,
} from 'src/app/shared/model/accordion-list.model';
import {
  AlertList,
  DetailedView,
  DetailedViewField,
} from 'src/app/shared/model/detailed-view.model';
import { date } from 'src/app/core/service/utilities.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { AccountConstant, AccountDefaultValue, ExpenseDefaultValue, expenseTab } from '../finance.const';
import { Account, Expense, ExpenseItem } from '../model';
import { Doc } from 'src/app/shared/model/document.model';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { SearchSelectModalConfig } from 'src/app/shared/components/search-select-modal/search-select-modal.component';

export const expenseTabHeader = [
  {
    value: 'Expense Id (Type)',
    rounded: true,
  },
  {
    value: 'Expense Name',
    rounded: true,
  },
  {
    value: 'Expense Amount',
    rounded: true,
  },
  {
    value: 'Expense Status',
    rounded: true,
  },
];

export const manageExpenseTabHeader = [
  {
    value: 'Expense Id (Type)',
    rounded: true,
  },
  {
    value: 'Expense Amount',
    rounded: true,
  },
  {
    value: 'Expense Payer Name',
    rounded: true,
  },
  {
    value: 'Expense Status',
    rounded: true,
  },
];



export const expenseHighLevelView = (item: Expense): AccordionCell[] => {
  return [
    {
      type: 'text',
      value: item?.id! + ' (' + item?.expenseRefType + ')',
      bgColor: 'bg-purple-200',
      rounded: true,
    },
    {
      type: 'text',
      value: item?.name!,
    },
    {
      type: 'text',
      value: '₹ ' + item?.finalAmount,
    },
    {
      type: 'text',
      value: item?.status + '',
      bgColor: item?.settledOn ? 'bg-green-300' : 'bg-purple-200',
      showDisplayValue: true,
      refDataSection: AccountConstant.refDataKey.expenseStatus,
      rounded: true,
    },
  ];
};

export const manageExpenseHighLevelView = (item: Expense): AccordionCell[] => {
  return [
    {
      type: 'text',
      value: item?.id! + ' (' + item?.expenseRefType + ')',
      bgColor: 'bg-purple-200',
      rounded: true,
    },
    {
      type: 'text',
      value: '₹ ' + item?.finalAmount,

    },
    {
      type: 'text',
      value: item?.paidBy?.fullName!,
    },
    {
      type: 'text',
      value: item?.status + '',
      bgColor: item?.settledOn ? 'bg-green-300' : 'bg-purple-200',
      showDisplayValue: true,
      refDataSection: AccountConstant.refDataKey.expenseStatus,
      rounded: true,
    },
  ];
};

export const expenseDetailSection = (
  m: Expense, isCreate: boolean = false, isAdminView: boolean = false, forProject: boolean = false) => {
  ////console.log(m)

  return {
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
        hide_field: isCreate,
      },
      {
        field_name: 'Expense Name',
        field_html_id: 'exp_name',
        field_value: m?.name!,
        editable: m?.status != 'FINALIZED',
        form_control_name: 'name',
        form_input: {
          html_id: 'name_inp',
          inputType: 'text',
          tagName: 'input',
          placeholder: 'Ex. Lorem Ipsum',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Expense Description',
        field_html_id: 'exp_desc',
        field_value: m?.description!,
        editable: m?.status != 'FINALIZED',
        form_control_name: 'description',
        form_input: {
          html_id: 'description_inp',
          inputType: '',
          tagName: 'textarea',
          placeholder: 'Ex. Lorem Ipsum',
        },
        form_input_validation: [],
      },
      {
        field_name: 'Expense Date',
        field_html_id: 'exp_date',
        field_value: m?.expenseDate!,
        field_display_value: date(m?.expenseDate),
        editable: m?.status != 'FINALIZED',
        form_control_name: 'expenseDate',
        form_input: {
          html_id: 'exp_date_inp',
          inputType: 'date',
          tagName: 'input',
          placeholder: 'Ex. Lorem Ipsum',
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Paid By',
        field_value: m?.paidBy?.id,
        editable: m?.status != 'FINALIZED' && (isAdminView),
        field_display_value: m?.paidBy?.fullName,
        field_html_id: 'expense_borne_by',
        form_control_name: 'expense_by',
        form_input: {
          html_id: 'expense_by_inp',
          tagName: 'input',
          inputType: 'text',
          placeholder: 'Select member',
          autocomplete: true,
          selectList: [],
        },
        form_input_validation: [Validators.required],
      },
      {
        field_name: 'Created By',
        field_value: m?.createdBy?.id,
        field_display_value: m?.createdBy?.fullName,
        hide_field: !m?.createdBy
      },
      {
        field_name: 'Expense Amount',
        field_value: m?.finalAmount,
        field_display_value: `₹ ${m?.finalAmount}`,
        hide_field: !m?.finalAmount
      },
      {
        field_name: 'Is this Project related expense?',
        field_html_id: 'exp_is_event',
        field_value: '',
        hide_field: !isCreate || forProject,
        editable: isCreate && m?.status != 'FINALIZED',
        form_control_name: 'expense_source',
        form_input: {
          html_id: 'exp_is_event_inp',
          inputType: 'radio',
          tagName: 'input',
          placeholder: 'Ex. Lorem Ipsum',
          selectList: [
            { key: 'EVENT', displayValue: 'Yes' },
            { key: 'ADHOC', displayValue: 'No' },
          ],
        },
        form_input_validation: forProject ? [] : [Validators.required],
      },
      {
        field_name: 'Finalized By',
        field_value: m?.finalizedBy?.fullName,
        hide_field: !m?.finalizedBy
      },
      {
        field_name: 'Settled By',
        field_value: m?.settledBy?.fullName,
        hide_field: !m?.settledBy
      },
      {
        field_name: 'Settlement Account',
        field_value: m?.settlementAccountId,
        hide_field: !(m?.status == 'FINALIZED' || m?.status == 'SETTLED'),
        field_html_id: 'settlement_account',
      },
      {
        field_name: 'Transaction Ref',
        field_value: m?.txnNumber,
        hide_field: !m?.txnNumber
      },
      {
        field_name: 'Rejected By',
        field_value: m?.rejectedBy?.fullName,
        hide_field: !m?.rejectedBy
      },
      {
        field_name: 'Remarks',
        field_value: m?.remarks,
        hide_field: !m?.remarks
      },
    ],
  } as DetailedView;
};

export const expenseDocumentSection = (
  docs: Doc[],
) => {
  return {
    section_name: 'Documents',
    section_type: 'doc_list',
    section_html_id: 'expense_doc_list',
    section_form: new FormGroup({}),
    hide_section: false,
    documents: docs,
    doc: {
      docChange: new EventEmitter(),
    },
    form_alerts: [
      {
        data: {
          alertType: 'info',
          message: 'Please upload the expense receipts for each expense item.'
        }
      }
    ],
  } as DetailedView;
};
export const expenseEditableTable = (
  m: Expense,
  isCreate: boolean = false
) => {
  const items = m?.expenseItems ?? [];
  return {
    section_name: 'Expense Items',
    section_type: 'editable_table',
    section_html_id: 'expense_list_detail',
    section_form: new FormGroup({
      items: new FormArray([
        ...items.map(item => new FormGroup({
          itemName: new FormControl(item.itemName, [Validators.required]),
          amount: new FormControl(item.amount, [Validators.required]),
        }))
      ])
    }),
    show_form: false,
    hide_section: false,
    editableTable: {
      allowAddRow: isCreate || m?.status == 'DRAFT' || m?.status == 'SUBMITTED',
      allowDeleteRow: isCreate || m?.status == 'DRAFT' || m?.status == 'SUBMITTED',
      formArrayName: 'items',
      columns: [
        {
          columnDef: 'itemName',
          header: 'Item Name',
          editable: true,
          inputModel: {
            html_id: 'item_name_inp',
            tagName: 'input',
            inputType: 'text',
            placeholder: 'Ex. Tea/Coffee',
          },
          validators: [Validators.required],
        },

        {
          columnDef: 'amount',
          header: 'Amount',
          editable: true,
          inputModel: {
            html_id: 'item_amount_inp',
            tagName: 'input',
            inputType: 'number',
            placeholder: '0.00',
          },
          validators: [Validators.required],
        },
      ],
    },
  } as DetailedView;
};

export const expenseEventField = (events: KeyValue[]) => {
  return {
    field_name: 'Select Event',
    field_value: '',
    editable: true,
    field_html_id: 'expense_event',
    form_control_name: 'expense_event',
    form_input: {
      html_id: 'expense_event_inp',
      tagName: 'input',
      inputType: 'text',
      placeholder: 'Select event',
      autocomplete: true,
      selectList: events,
    },
    form_input_validation: [Validators.required],
  } as DetailedViewField;
};

export const rejectionModal = (): SearchSelectModalConfig => {
  return {
    buttonText: { search: 'Reject', close: 'Cancel' },
    title: 'Confirm Rejection',
    searchFormFields: [{
      formControlName: 'remarks',
      inputModel: {
        html_id: 'remarks',
        labelName: 'Reason for reject',
        inputType: 'text',
        tagName: 'textarea',
        placeholder: 'Enter reason for rejection',
      },
      validations: [Validators.required]
    }]
  }
};

export const expenseSearchInput = (
  tab: expenseTab,
  refData: {
    [name: string]: KeyValue[];
  }
): SearchAndAdvancedSearchModel => {
  let model: SearchAndAdvancedSearchModel = {
    normalSearchPlaceHolder: 'Search for anything related to expenses here',
    advancedSearch: {
      searchFormFields: [
        {
          formControlName: 'expenseId',
          inputModel: {
            tagName: 'input',
            inputType: 'text',
            html_id: 'expense_Id',
            labelName: 'Expense Id',
            placeholder: 'Enter Expense Id',
          },
        },
        {
          formControlName: 'expenseStatus',
          inputModel: {
            tagName: 'select',
            inputType: 'multiselect',
            html_id: 'type',
            labelName: 'Expense Status',
            placeholder: 'Select Expense Status',
            selectList: refData['expenseStatuses'],
          },
        },
        {
          formControlName: 'startDate',
          inputModel: {
            tagName: 'input',
            inputType: 'date',
            html_id: 'startDate',
            labelName: 'Start Date',
            placeholder: 'Select Start Date',
          },
        },
        {
          formControlName: 'endDate',
          inputModel: {
            tagName: 'input',
            inputType: 'date',
            html_id: 'endDate',
            labelName: 'End Date',
            placeholder: 'Select End Date',
          },
        },
      ],
    },
  };
  if (tab == 'expense_list') {
    model.advancedSearch?.searchFormFields.push({
      formControlName: 'payerId',
      inputModel: {
        html_id: 'account_Owner',
        tagName: 'input',
        inputType: 'text',
        autocomplete: true,
        labelName: 'Expense Payer',
        selectList: [],
        placeholder: 'Ex. Sonal Gupta',
      }
    })
  }
  return model;
};


export const settlementSummary = (
  expense: Expense,
  payerAccount?: Account,
) => {
  //const walletCount = (payerAccounts?.length ?? 0);
  //const payerAccount = walletCount > 0 ? payerAccounts![0] : null;

  const finalAmount = Number(expense?.finalAmount ?? 0);
  const walletBalance = payerAccount?.balance ?? 0;

  const walletUsed = Math.min(walletBalance, finalAmount);
  const transferAmount = Math.max(finalAmount - walletBalance, 0);
  const walletBalanceAfterSettlement = walletBalance - walletUsed;

  return {
    section_name: 'Settlement Summary',
    section_type: 'key_value',
    section_html_id: 'settlement_summary',
    section_form: new FormGroup({}),
    hide_section: false,
    section_alerts: [
      {
        hide_alert: !(payerAccount && walletBalance < finalAmount),
        data: {
          alertType: 'warning',
          message: `Please transfer Rs. ${finalAmount - walletBalance} to the wallet ${payerAccount?.id} to complete the settlement.`,
        }
      },
      {
        hide_alert: payerAccount,
        data: {
          alertType: 'warning',
          message: `No wallets found for the payer. Please add a wallet to the payer and transfer Rs. ${finalAmount} to complete the settlement.`,
        }
      },
      {
        hide_alert: !(walletBalanceAfterSettlement > 0),
        data: {
          alertType: 'warning',
          message: `${expense.paidBy?.fullName} may need to transfer excess amount of Rs.${walletBalanceAfterSettlement} but still the expense can be settled.`,
        }
      },
    ],
    content: [
      {
        field_name: 'Total Expense Amount',
        field_value: finalAmount.toFixed(2),
      },
      {
        field_name: 'Expense Paid By',
        field_value: expense.paidBy?.fullName ?? '-',
        editable: true,
        field_html_id: 'expense_event',
      },
      {
        field_name: 'Payer Wallet ID',
        field_value: payerAccount?.id ?? '-',
      },
      {
        field_name: 'Current Wallet Balance',
        field_value: walletBalance.toFixed(2),
      },
      {
        field_name: 'Amount to Transfer to Wallet',
        field_value: transferAmount.toFixed(2),
      },
      {
        field_name: 'Wallet Balance After Settlement',
        field_value: walletBalanceAfterSettlement.toFixed(2),
      },
    ],
  } as DetailedView;
};

