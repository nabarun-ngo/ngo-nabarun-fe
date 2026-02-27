import { FormGroup } from "@angular/forms";
import { date } from "src/app/core/service/utilities.service";
import { DetailedView } from "src/app/shared/model/detailed-view.model";
import { SearchAndAdvancedSearchModel } from "src/app/shared/model/search-and-advanced-search.model";
import { Transaction } from "../model";
import { KeyValue } from "src/app/shared/model/key-value.model";


export const transactionHeader = [
  {
    value: 'Transaction Id',
    rounded: true,
  },
  {
    value: 'Transaction Amount',
    rounded: true,
  },
  {
    value: 'Transaction Date',
    rounded: true,
  },
  {
    value: 'Balance After Transaction',
    rounded: true,
  },
];

export const transactionDetailSection = (data: Transaction, refData: { [name: string]: KeyValue[] }): DetailedView => {
  return {
    section_form: new FormGroup({}),
    section_name: 'Transaction Detail',
    section_type: 'key_value',
    section_html_id: 'txn_det',
    content: [
      {
        field_name: 'Transaction Number',
        field_value: data.txnId!,
        field_html_id: 'txn_id',
      },
      {
        field_name: 'Transaction Reference Number',
        field_value: data.transactionRef!,
        field_html_id: 'txn_id',
      },
      {
        field_name: 'Transaction Type',
        field_value: data.txnType!,
        field_html_id: 'txn_type',
      },
      {
        field_name: 'Transaction Particulars',
        field_value: data.txnParticulars!,
        field_html_id: 'txn_type',
      },
      {
        field_name: 'Transaction Description',
        field_value: data.txnDescription!,
        field_html_id: 'txn_status',
      },
      {
        field_name: 'Transaction Amount',
        field_value: '₹ ' + data.txnAmount!,
        field_html_id: 'txn_amt',
      },
      {
        field_name: 'Transaction Date',
        field_value: date(data.txnDate!),
        field_html_id: 'txn_status',
      },
      {
        field_name: 'Transaction Status',
        field_value: data.txnStatus!,
        field_html_id: 'txn_status',
      },
      {
        field_name: 'Transaction Ref Id',
        field_value: data.txnRefId!,
        field_html_id: 'txn_status',
        hide_field: !data.txnRefId,
      },
      {
        field_name: 'Transaction Ref Type',
        field_value: data.txnRefType!,
        field_html_id: 'txn_status',
        hide_field: !data.txnRefType,
      },
      {
        field_name: 'Transfer From Account',
        field_value: data.transferFrom!,
        field_html_id: 'txn_status',
        hide_field: !data.transferFrom,
      },
      {
        field_name: 'Transfer To Account',
        field_value: data.transferTo!,
        field_html_id: 'txn_status',
        hide_field: !data.transferTo,
      },
      {
        field_name: 'Balance After Transaction',
        field_value: '₹ ' + data.accBalance!,
        field_html_id: 'txn_status',
      },
      {
        field_name: 'Remarks',
        field_value: data.comment!,
        field_html_id: 'txn_status',
      },
    ],
  };
}
export const transactionSearchInput = (
  refData: {
    [name: string]: KeyValue[];
  }
): SearchAndAdvancedSearchModel => {
  return {
    normalSearchPlaceHolder:
      'Search for anything related to transactions here',
    advancedSearch: {
      searchFormFields: [
        {
          formControlName: 'txnId',
          inputModel: {
            tagName: 'input',
            inputType: 'text',
            html_id: 'txnNo',
            labelName: 'Transaction Number',
            placeholder: 'Enter Transaction Number',
          },
        },
        {
          formControlName: 'txnType',
          inputModel: {
            tagName: 'select',
            inputType: 'multiselect',
            html_id: 'txnType',
            labelName: 'Transaction Type',
            placeholder: 'Select Transaction Type',
            selectList: [
              { key: 'IN', displayValue: 'IN' },
              { key: 'OUT', displayValue: 'OUT' },
            ],
          },
        },
        {
          formControlName: 'txnStatus',
          inputModel: {
            tagName: 'select',
            inputType: 'multiselect',
            html_id: 'txnStatus',
            labelName: 'Transaction Status',
            placeholder: 'Select Transaction Status',
            selectList: [
              { key: 'SUCCESS', displayValue: 'Success' },
              { key: 'REVERSED', displayValue: 'Reversed' },
            ],
          },
        },
        {
          formControlName: 'transactionRef',
          inputModel: {
            tagName: 'input',
            inputType: 'text',
            html_id: 'txnRef',
            labelName: 'Transaction Reference Id',
            placeholder: 'Enter Transaction Reference Id',
          },
        },
        {
          formControlName: 'startDate',
          inputModel: {
            tagName: 'input',
            inputType: 'date',
            html_id: 'txnStartDate',
            labelName: 'Start Date',
            placeholder: 'Select Start Date',
          },
        },
        {
          formControlName: 'endDate',
          inputModel: {
            tagName: 'input',
            inputType: 'date',
            html_id: 'txnEndDate',
            labelName: 'End Date',
            placeholder: 'Select End Date',
          },
        },
      ],
    },
  };
};


export const reverseTransactionSection = (data: Transaction, refData: { [name: string]: KeyValue[] }): DetailedView => {
  return {
    section_form: new FormGroup({}),
    section_name: 'Reverse Transaction',
    section_type: 'key_value',
    section_html_id: 'reverse_txn',
    show_form: false,
    content: [
      {
        field_name: 'Reason for Reversal',
        field_value: '',
        field_html_id: 'txn_id',
        editable: true,
        form_control_name: 'reasonForReversal',
        form_input: {
          tagName: 'textarea',
          inputType: 'text',
          html_id: 'txn_id',
          placeholder: 'Enter Reason for Reversal',
        }
      },
    ],
  };
}

