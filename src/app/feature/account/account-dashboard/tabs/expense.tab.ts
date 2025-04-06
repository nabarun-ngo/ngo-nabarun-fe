import { EventEmitter } from "@angular/core";
import { FormGroup, Validators } from "@angular/forms";
import { PageEvent } from "@angular/material/paginator";
import { ExpenseItemDetail, WorkDetail } from "src/app/core/api/models";
import { ExpenseDetail } from "src/app/core/api/models/expense-detail";
import { Accordion } from "src/app/shared/components/generic/accordion-list/accordion";
import { AccordionButton, AccordionCell } from "src/app/shared/components/generic/accordion-list/accordion-list.model";
import { DetailedView } from "src/app/shared/components/generic/detailed-view/detailed-view.model";

export const expenseTabHeader = [
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
];

export const expenseHighLevelView = (item: ExpenseDetail): AccordionCell[] => {
  return [
    {
      type: 'text',
      value: item?.id!,
      bgColor: 'bg-purple-200',
      rounded:true
    },
    {
      type: 'text',
      value: item?.name!,
    },
    {
      type: 'text',
      value: '₹ ' + (item?.finalized ? item?.finalAmount : item?.expenseItems?.map(m => m.amount).reduce((a, b) => a! + b!, 0)),
    },
    {
      type: 'text',
      value: item?.finalized ? 'Final' : 'Draft',
      bgColor: item?.finalized ? 'bg-green-300' : 'bg-purple-200',
      rounded:true
    }
  ];
}

export const expenseDetailSection = (m: ExpenseDetail, isCreate: boolean = false) => {
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
        hide_field: isCreate
      },
      {
        field_name: 'Expense Name',
        field_html_id: 'exp_name',
        field_value: m?.name!,
        editable: isCreate,
        form_control_name: 'name',
        form_input: {
          html_id: 'name_inp',
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
          html_id: 'description_inp',
          inputType: '',
          tagName: 'textarea',
          placeholder: 'Ex. Lorem Ipsum'
        },
        form_input_validation: []
      },
      {
        field_name: 'Expense Date',
        field_html_id: 'exp_date',
        field_value: m?.description!,
        editable: true,
        form_control_name: 'expenseDate',
        form_input: {
          html_id: 'exp_date_inp',
          inputType: 'date',
          tagName: 'input',
          placeholder: 'Ex. Lorem Ipsum'
        },
        form_input_validation: [Validators.required]
      },
      {
        field_name: 'Is this any event releted expense?',
        field_html_id: 'exp_is_event',
        field_value: '',
        hide_field: !isCreate,
        editable: isCreate,
        form_control_name: 'expense_source',
        form_input: {
          html_id: 'exp_is_event_inp',
          inputType: 'radio',
          tagName: 'input',
          placeholder: 'Ex. Lorem Ipsum',
          selectList: [{ key: 'EVENT', displayValue: 'Yes' }, { key: 'OTHER', displayValue: 'No' }]
        },
        form_input_validation: [Validators.required]
      },
      {
        field_name: 'Is this expense beared by you?',
        field_html_id: 'exp_is_owner',
        field_value: 'Yes',
        hide_field: !isCreate,
        editable: isCreate,
        form_control_name: 'expense_by',
        form_input: {
          html_id: 'exp_made_by_inp',
          inputType: 'radio',
          tagName: 'input',
          placeholder: '',
          selectList: [{ key: 'Yes', displayValue: 'Yes' }, { key: 'No', displayValue: 'No' }]
        },
        form_input_validation: [Validators.required]
      },
      {
        field_name: 'Expense Status',
        field_html_id: 'exp_status',
        field_value: m.finalized ? 'FINAL' : 'DRAFT',
        hide_field: isCreate,
        editable: !isCreate,
        form_control_name: 'exp_status',
        form_input: {
          html_id: 'exp_status_inp',
          inputType: '',
          tagName: 'select',
          placeholder: 'Ex. Lorem Ipsum',
          selectList: [{ key: 'DRAFT', displayValue: 'Draft' }, { key: 'FINAL', displayValue: 'Final' }]
        },
        form_input_validation: [Validators.required]
      },
    ]
  } as DetailedView
}

export const expenseDocumentSection = (m: ExpenseDetail, isCreate: boolean = false) => {
  return {
    section_name: 'Upload Document',
    section_type: 'doc_list',
    section_html_id: 'expense_doc_list',
    section_form: new FormGroup({}),
    show_form:isCreate,
    doc:{
      docChange: new EventEmitter()
    }
  } as DetailedView
}


export const expenseListSection = (m: ExpenseDetail, isCreate: boolean = false) => {
  let accordion = new class extends Accordion<ExpenseItemDetail> {
    protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    }
    protected override onAccordionOpen(event: { rowIndex: number; }): void {
    }
    prepareHighLevelView(item: ExpenseItemDetail, options?: { [key: string]: any }): AccordionCell[] {
      return [
        {
          type: 'text',
          value: item?.itemName!,
        },
        {
          type: 'text',
          value: `₹ ${item?.amount ? item?.amount : 0}`,
        }
      ]
    }
    prepareDetailedView(data: ExpenseItemDetail, options?: { [key: string]: any }): DetailedView[] {
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
                placeholder: 'Enter Item Name'
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
                placeholder: 'Enter Item Description'
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
                placeholder: 'Enter Item Amount'
              }
            },
            // {
            //   field_name: 'Expense Account',
            //   field_html_id: 'exp_account',
            //   field_value: `${data?.expenseAccount?.id!} (${data?.expenseAccount?.accountHolderName!})`,
            //   editable: !isCreate,
            //   form_control_name: 'exp_account',
            //   form_input: {
            //     html_id: 'exp_account_inp',
            //     inputType: 'text',
            //     tagName: 'input',
            //     placeholder: 'Ex. Lorem Ipsum',
            //     autocomplete: true,
            //     selectList: []
            //   },
            //   form_input_validation: [Validators.required]
            // },
          ]
        } as DetailedView
      ]
    }
    prepareDefaultButtons(data: ExpenseItemDetail, options?: { [key: string]: any }): AccordionButton[] {
      if (options && options['create']) {
        return [
          {
            button_id: 'CREATE_CANCEL',
            button_name: 'Cancel'
          },
          {
            button_id: 'CREATE_CONFIRM',
            button_name: 'Add'
          }
        ];
      }
      return [
        // {
        //   button_id: 'DELETE_EXPENSE_ITEM',
        //   button_name: 'Delete'
        // },
        {
          button_id: 'UPDATE_EXPENSE_ITEM',
          button_name: 'Update'
        },
      ]
    }
    handlePageEvent($event: PageEvent): void { }
  }();
  accordion.setHeaderRow([
    {
      value: 'Item Name',
      rounded: true
    },
    {
      value: 'Item Amount',
      rounded: true
    }
  ])
  accordion.setContent(m.expenseItems!, m.expenseItems?.length)

  return {
    section_name: 'Expense List',
    section_type: 'accordion_list',
    section_html_id: 'expense_list_detail',
    section_form: new FormGroup({}),
    hide_section: false,
    accordionList: accordion.getAccordionList(),
    accordion: {
      object: accordion,
      createBtn: true,
      accordionOpened: new EventEmitter(),
      buttonClick: new EventEmitter()
    }
  } as DetailedView;
}