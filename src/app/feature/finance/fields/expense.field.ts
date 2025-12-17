import { EventEmitter } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';

import { Accordion } from 'src/app/shared/utils/accordion';
import {
  AccordionButton,
  AccordionCell,
} from 'src/app/shared/model/accordion-list.model';
import {
  DetailedView,
  DetailedViewField,
} from 'src/app/shared/model/detailed-view.model';
import { date } from 'src/app/core/service/utilities.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { ExpenseDefaultValue, expenseTab } from '../finance.const';
import { Expense, ExpenseItem } from '../model';
import { Doc } from 'src/app/shared/model/document.model';
import { KeyValue } from 'src/app/shared/model/key-value.model';

export const expenseTabHeader = [
  {
    value: 'Expense Id',
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
    value: 'Expense Id',
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
      value: item?.id!,
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
      rounded: true,
    },
  ];
};

export const manageExpenseHighLevelView = (item: Expense): AccordionCell[] => {
  return [
    {
      type: 'text',
      value: item?.id!,
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
      rounded: true,
    },
  ];
};

export const expenseDetailSection = (
  m: Expense,
  isCreate: boolean = false,
  isAdminView: boolean = false
) => {
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
        editable: m?.status != 'FINALIZED' && (isCreate || isAdminView),
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
        field_name: 'Is this any event releted expense?',
        field_html_id: 'exp_is_event',
        field_value: '',
        hide_field: !isCreate,
        editable: isCreate && m?.status != 'FINALIZED',
        form_control_name: 'expense_source',
        form_input: {
          html_id: 'exp_is_event_inp',
          inputType: 'radio',
          tagName: 'input',
          placeholder: 'Ex. Lorem Ipsum',
          selectList: [
            { key: 'EVENT', displayValue: 'Yes' },
            { key: 'OTHER', displayValue: 'No' },
          ],
        },
        form_input_validation: [Validators.required],
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
        field_value: m?.settlementAccount?.id,
        editable: m?.status == 'FINALIZED',
        hide_field: m == undefined || !(m?.status == 'FINALIZED' || m?.status == 'SETTLED'),
        field_display_value: `${m?.settlementAccount?.id} (${m?.settlementAccount?.accountHolderName})`,
        field_html_id: 'settlement_account',
        form_control_name: 'settlement_acc',
        form_input: {
          html_id: 'settlement_acc_inp',
          tagName: 'select',
          inputType: '',
          placeholder: 'Select settlement account',
          selectList: [],
        },
        form_input_validation: [Validators.required],
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
  isCreate: boolean = false
) => {
  return {
    section_name: 'Documents',
    section_type: 'doc_list',
    section_html_id: 'expense_doc_list',
    section_form: new FormGroup({}),
    hide_section: true,
    documents: docs,
    doc: {
      docChange: new EventEmitter(),
    },
  } as DetailedView;
};

export const expenseListSection = (
  m: Expense,
  isCreate: boolean = false
) => {
  let accordion = new (class extends Accordion<ExpenseItem> {
    protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
      return {
        pageNumber: ExpenseDefaultValue.pageNumber,
        pageSize: ExpenseDefaultValue.pageSize,
        pageSizeOptions: ExpenseDefaultValue.pageSizeOptions
      };
    }

    override onInitHook(): void { }
    protected override onClick(event: {
      buttonId: string;
      rowIndex: number;
    }): void { }
    protected override onAccordionOpen(event: { rowIndex: number }): void { }
    prepareHighLevelView(
      item: ExpenseItem,
      options?: { [key: string]: any }
    ): AccordionCell[] {
      return [
        {
          type: 'text',
          value: item?.itemName!,
        },
        {
          type: 'text',
          value: `₹ ${item?.amount ? item?.amount : 0}`,
        },
      ];
    }
    prepareDetailedView(
      data: ExpenseItem,
      options?: { [key: string]: any }
    ): DetailedView[] {
      return [
        {
          section_name: 'Expense Item Detail',
          section_type: 'key_value',
          section_html_id: 'expense_item_detail',
          section_form: new FormGroup({}),
          hide_section: false,
          content: [
            {
              field_name: 'Item Name',
              field_html_id: 'e_item_name',
              field_value: data?.itemName!,
              editable: true,
              form_control_name: 'itemName',
              form_input: {
                html_id: 'name_fld',
                inputType: 'text',
                tagName: 'input',
                placeholder: 'Enter Item Name',
              },
              form_input_validation: [Validators.required],
            },
            {
              field_name: 'Item Description',
              field_html_id: 'e_item_desc',
              field_value: data?.description!,
              editable: true,
              form_control_name: 'description',
              form_input: {
                html_id: 'desc_fld',
                inputType: '',
                tagName: 'textarea',
                placeholder: 'Enter Item Description',
              },
              form_input_validation: [],
            },
            {
              field_name: 'Item Amount',
              field_html_id: 'e_item_amount',
              field_value: data?.amount!,
              editable: true,
              form_control_name: 'amount',
              form_input_validation: [Validators.required],
              form_input: {
                html_id: 'amount_fld',
                inputType: 'number',
                tagName: 'input',
                placeholder: 'Enter Item Amount',
              },
            },
          ],
        } as DetailedView,
      ];
    }
    prepareDefaultButtons(
      data: ExpenseItem,
      options?: { [key: string]: any }
    ): AccordionButton[] {
      if (options && options['create']) {
        return [
          {
            button_id: 'CREATE_CANCEL',
            button_name: 'Cancel',
          },
          {
            button_id: 'CREATE_CONFIRM',
            button_name: 'Add',
          },
        ];
      }
      if (m == undefined || m?.status == 'DRAFT' || m?.status == 'SUBMITTED') {
        return [
          {
            button_id: 'DELETE_EXPENSE_ITEM',
            button_name: 'Delete',
          },
          {
            button_id: 'UPDATE_EXPENSE_ITEM',
            button_name: 'Update',
          },
        ];
      }
      return [];
    }
    handlePageEvent($event: PageEvent): void { }
  })();
  accordion.setHeaderRow([
    {
      value: 'Item Name',
      rounded: true,
    },
    {
      value: 'Item Amount',
      rounded: true,
    },
  ]);

  ////console.log(m)
  accordion.setContent(m?.expenseItems!, m?.expenseItems?.length);

  return {
    section_name: 'Expense List',
    section_type: 'accordion_list',
    section_html_id: 'expense_list_detail',
    section_form: new FormGroup({}),
    hide_section: false,
    accordionList: accordion.getAccordionList(),
    accordion: {
      object: accordion,
      parentId: m?.id!,
      createBtn: isCreate || m?.status == 'DRAFT' || m?.status == 'SUBMITTED',
      accordionOpened: new EventEmitter(),
      buttonClick: new EventEmitter(),
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

export const rejectionModal = (): SearchAndAdvancedSearchModel => {
  return {
    normalSearchPlaceHolder: '',
    showOnlyAdvancedSearch: true,
    advancedSearch: {
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
        {
          formControlName: 'expenseRefId',
          inputModel: {
            html_id: 'event_Id',
            tagName: 'select',
            inputType: '',
            labelName: 'Select Event',
            selectList: [],
            placeholder: 'Ex. NEV1224',
          }
        }
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

