import { Component, Input, OnInit } from '@angular/core';
import { Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ExpenseDetail, ExpenseItemDetail, KeyValue, PaginateExpenseDetail } from 'src/app/core/api/models';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
import { AccordionCell, AccordionButton } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { expenseDetailSection, expenseDocumentSection, expenseHighLevelView, expenseListSection, expenseTabHeader } from '../tabs/expense.tab';
import { AccountService } from '../../account.service';
import { AccountDefaultValue } from '../../account.const';
import { filterFormChange } from 'src/app/core/service/form.service';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-expense-tab',
  templateUrl: './expense-tab.component.html',
  styleUrls: ['./expense-tab.component.scss']
})
export class ExpenseTabComponent extends Accordion<ExpenseDetail> implements OnInit {

  protected defaultValue = AccountDefaultValue;
  private expense_items_create: ExpenseItemDetail[] = [];
  @Input({ required: true }) set expenseList(list: PaginateExpenseDetail) {
    if (list) {
      this.setContent(list.content!, list.totalSize);
    }
  }

  constructor(
    private accountService: AccountService,
    private modalService: ModalService,

    // private identityService: UserIdentityService,
  ) {
    super();
    super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions)
  }

  ngOnInit(): void {
    this.setHeaderRow(expenseTabHeader);
  }

  protected override prepareHighLevelView(data: ExpenseDetail, options?: { [key: string]: any; }): AccordionCell[] {
    return expenseHighLevelView(data);
  }

  protected override prepareDetailedView(data: ExpenseDetail, options?: { [key: string]: any; }): DetailedView[] {
    let isCreate = options && options['create'];
    var expenseList = expenseListSection({}, isCreate);
    expenseList.accordion?.buttonClick.subscribe(data => {
      switch (data.buttonId) {
        case 'SHOW_CREATE':
          expenseList.accordion?.object.showCreateForm();
          break;
        case 'CREATE_CONFIRM':
          let expenseForm = expenseList.accordion?.object.getSectionForm('expense_item_detail', 0, true);
          if (expenseForm?.valid) {
            let content = expenseForm.value as ExpenseItemDetail;
            this.expense_items_create.push(content);
            expenseList.accordion?.object.addContentRow(content);
            expenseList.accordion?.object.hideForm(0, true);
          } else {
            expenseForm?.markAllAsTouched();
          }
          break;
        case 'CREATE_CANCEL':
          expenseList.accordion?.object.hideForm(0, true);
          break;
      }
    })

    return [
      expenseDetailSection({}, isCreate),
      expenseList,
      expenseDocumentSection({}, isCreate)

    ]
  }
  protected override prepareDefaultButtons(data: ExpenseDetail, options?: { [key: string]: any; }): AccordionButton[] {
    if (options && options['create']) {
      return [
        {
          button_id: 'CREATE_CANCEL',
          button_name: 'Cancel'
        },
        {
          button_id: 'CREATE_CONFIRM',
          button_name: 'Create'
        }
      ];
    }
    return [
      {
        button_id: 'UPDATE_EXPENSE',
        button_name: 'Update'
      },
    ]
  }
  override handlePageEvent($event: PageEvent): void {
    //throw new Error('Method not implemented.');
  }

  createExpense() {
    this.showCreateForm();
    this.expense_items_create = [];
    let expense_form = this.getSectionForm('expense_detail', 0, true);
    expense_form?.valueChanges.pipe(filterFormChange(expense_form.value)).subscribe(val => {
      if (val['expense_source'] == 'EVENT') {
        this.accountService.fetchEvents().subscribe(data => {
          let events: KeyValue[] = []
          data?.content?.forEach(m => {
            events.push({ key: m.id, displayValue: m.eventTitle })
          })

          this.addSectionField('expense_detail', {
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
              selectList: events
            },
            form_input_validation: [Validators.required]
          }, 0, true)
        });
      } else if (val['expense_source'] == 'OTHER') {
        this.removeSectionField('expense_detail', 'expense_event', 0, true);
      }
      if (val['expense_by'] == 'No') {
        this.accountService.fetchUsers().subscribe(data => {
          let users: KeyValue[] = []
          data?.content?.forEach(m => {
            users.push({ key: m.id, displayValue: m.fullName })
          })

          this.addSectionField('expense_detail', {
            field_name: 'Expense beared by',
            field_value: '',
            editable: true,
            field_html_id: 'expense_borne_by',
            form_control_name: 'expense_by',
            form_input: {
              html_id: 'expense_by_inp',
              tagName: 'input',
              inputType: 'text',
              placeholder: 'Select event',
              autocomplete: true,
              selectList: users
            },
            form_input_validation: [Validators.required]
          }, 0, true)
        });
      } else if (val['expense_by'] == 'Yes') {
        this.removeSectionField('expense_detail', 'expense_borne_by', 0, true);
      }
    })
  }


  onClick($event: { buttonId: string; rowIndex: number; }) {
    switch ($event.buttonId) {
      case 'CREATE_CONFIRM':
        let expenseForm = this.getSectionForm('expense_detail', 0, true);
        if (!expenseForm?.valid) {
          expenseForm?.markAllAsTouched();
        }
        else if (this.expense_items_create.length == 0) {
          this.modalService.openNotificationModal(AppDialog.err_min_1_expense, 'notification', 'error');
        }
        else {
          this.accountService.createExpenses(expenseForm.value).subscribe(async d => {
            this.hideForm(0, true);
            for (let expItem of this.expense_items_create) {
              await lastValueFrom(this.accountService.createExpenseItem(d?.id!, expItem));
            }
            let doc = this.getSectionDocuments('expense_doc_list', 0, true)
            if (doc.length > 0) {
              this.accountService.uploadDocuments(d?.id!, doc.map(d => d.detail)).subscribe();
            }
            this.fetchData();
          })
        }
        break;
      case 'CREATE_CANCEL':
        this.hideForm(0, true);
        this.expense_items_create = [];
        break;
    }
  }
  fetchData() {
    this.accountService.fetchExpenses(this.pageNumber, this.pageSize, {}).subscribe(s => {
      this.expenseList = s!;
      this.setContent(this.expenseList.content!, this.expenseList?.totalSize!)
    })
  }
  protected override onAccordionOpen($event: { rowIndex: number; }) {
    //throw new Error('Method not implemented.');
  }

}
