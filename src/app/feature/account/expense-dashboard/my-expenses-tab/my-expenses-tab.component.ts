import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import {
  ExpenseDetail,
  ExpenseItemDetail,
  KeyValue,
  UserDetail,
} from 'src/app/core/api/models';
import { Accordion } from 'src/app/shared/utils/accordion';
import {
  AccordionCell,
  AccordionButton,
} from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import {
  expenseDetailSection,
  expenseDocumentSection,
  expenseEventField,
  expenseHighLevelView,
  expenseListSection,
  expenseTabHeader,
} from '../../expense.field';
import { AccountService } from '../../account.service';
import { AccountDefaultValue } from '../../account.const';
import { filterFormChange } from 'src/app/core/service/form.service';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';

@Component({
  selector: 'app-my-expenses-tab',
  templateUrl: './my-expenses-tab.component.html',
  styleUrls: ['./my-expenses-tab.component.scss'],
})
export class MyExpensesTabComponent extends Accordion<ExpenseDetail> {
  protected users!: UserDetail[];
  protected isAdmin: boolean = false;
  constructor(
    protected accountService: AccountService,
    protected modalService: ModalService,
    protected userIdentity: UserIdentityService
  ) {
    super();
    super.init(
      AccountDefaultValue.pageNumber,
      AccountDefaultValue.pageSize,
      AccountDefaultValue.pageSizeOptions
    );
  }

  ngOnInit(): void {
    this.setHeaderRow(expenseTabHeader);
  }

  protected override prepareHighLevelView(
    data: ExpenseDetail,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    return expenseHighLevelView(data);
  }

  protected override prepareDetailedView(
    data: ExpenseDetail,
    options?: { [key: string]: any }
  ): DetailedView[] {
    let isCreate = options && options['create'];
    var expenseList = expenseListSection(data, isCreate);
    this.handleExpenseItemEvents(expenseList, isCreate);
    return [
      expenseDetailSection(data, isCreate, this.isAdmin),
      expenseList,
      expenseDocumentSection([], isCreate),
    ];
  }

  protected override prepareDefaultButtons(
    data: ExpenseDetail,
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
          button_name: 'Create',
        },
      ];
    }
    let buttons = [];
    if (data.status == 'DRAFT') {
      buttons.push({
        button_id: 'SUBMIT_EXPENSE',
        button_name: 'Submit',
      });
    } else if (data.status == 'SUBMITTED') {
      buttons.push({
        button_id: 'UPDATE_EXPENSE',
        button_name: 'Update',
      });
    }
    return buttons;
  }
  override handlePageEvent($event: PageEvent): void {
    this.accountService
      .fetchExpenses($event.pageIndex, $event.pageSize, {})
      .subscribe((s) => {
        this.setContent(s!.content!, s?.totalSize!);
      });
  }

  createExpense() {
    this.showCreateForm();
    let expense_form = this.getSectionForm('expense_detail', 0, true);
    expense_form?.valueChanges
      .pipe(filterFormChange(expense_form.value))
      .subscribe((val) => {
        if (val['expense_source'] == 'EVENT') {
          this.accountService.fetchEvents().subscribe((data) => {
            let events: KeyValue[] = data?.content?.map((m) => {
              return { key: m.id, displayValue: m.eventTitle } as KeyValue;
            })!;
            this.addSectionField(
              'expense_detail',
              expenseEventField(events),
              0,
              true
            );
          });
        } else if (val['expense_source'] == 'OTHER') {
          this.removeSectionField('expense_detail', 'expense_event', 0, true);
        }
      });
    this.getSectionField(
      'expense_detail',
      'expense_borne_by',
      0,
      true
    ).form_input!.selectList = [
      {
        displayValue: this.userIdentity.loggedInUser.name,
        key: this.userIdentity.loggedInUser.profile_id,
      },
    ];
    this.users = [
      {
        id: this.userIdentity.loggedInUser.profile_id,
        userId: this.userIdentity.loggedInUser.user_id,
        fullName: this.userIdentity.loggedInUser.name,
      },
    ];
  }

  onClick($event: { buttonId: string; rowIndex: number }) {
    switch ($event.buttonId) {
      case 'UPDATE_EXPENSE':
        this.showEditForm($event.rowIndex, ['expense_detail']);
        break;
      case 'CREATE_CONFIRM':
      case 'CONFIRM':
      case 'SUBMIT_EXPENSE':
        let expenseForm = this.getSectionForm(
          'expense_detail',
          $event.rowIndex,
          $event.buttonId == 'CREATE_CONFIRM' ? true : false
        );
        let expenseItems = this.getSectionAccordion(
          'expense_list_detail',
          $event.rowIndex,
          $event.buttonId == 'CREATE_CONFIRM' ? true : false
        )?.itemList as ExpenseItemDetail[];
        console.log(expenseItems);
        expenseForm?.markAllAsTouched();
        if (expenseItems.length == 0) {
          this.modalService.openNotificationModal(
            AppDialog.err_min_1_expense,
            'notification',
            'error'
          );
        } else if (expenseForm?.valid) {
          let expenseDetail = {
            description: expenseForm.value.description,
            name: expenseForm.value.name,
            expenseRefType: expenseForm.value.expense_source as any,
            expenseRefId: expenseForm.value.expense_event,
            expenseDate: expenseForm.value.expenseDate,
            expenseItems: expenseItems,
            isAdmin: this.isAdmin,
            isDeligated:
              expenseForm.value.expense_by !=
              this.userIdentity.loggedInUser.profile_id,
            paidBy: this.users
              ? this.users.find(
                  (f) =>
                    f.id ==
                    (this.isAdmin
                      ? expenseForm?.value.expense_by
                      : this.userIdentity.loggedInUser.profile_id)
                )
              : undefined,
            status: 'SUBMITTED',
          } as ExpenseDetail;
          if ($event.buttonId == 'CREATE_CONFIRM') {
            this.accountService.createExpenses(expenseDetail).subscribe((d) => {
              this.hideForm(0, true);
              this.addContentRow(d!, true);
            });
          } else {
            let id = this.itemList[$event.rowIndex].id!;
            this.accountService
              .updateExpense(id, expenseDetail)
              .subscribe((d) => {
                this.hideForm($event.rowIndex);
                this.updateContentRow(d!, $event.rowIndex);
              });
          }
        }
        break;
      case 'CREATE_CANCEL':
      case 'CANCEL':
        this.hideForm($event.rowIndex, $event.buttonId == 'CREATE_CANCEL');
        break;
    }
  }

  protected override onAccordionOpen($event: { rowIndex: number }) {
    let item = this.itemList![$event.rowIndex];
    this.accountService.getExpenseDocuments(item.id!).subscribe((data) => {
      let accordion=this.getSectionInAccordion('expense_doc_list',$event.rowIndex)!;
      accordion.documents = data;
      accordion.hide_section = false;
    });
  }

  protected handleExpenseItemEvents(
    expenseList: DetailedView,
    isCreate: boolean
  ) {
    expenseList.accordion?.buttonClick.subscribe((data) => {
      console.log(data);
      switch (data.buttonId) {
        case 'SHOW_CREATE':
          expenseList.accordion?.object.showCreateForm();
          break;
        case 'CREATE_CONFIRM':
        case 'CONFIRM':
          let expenseForm = expenseList.accordion?.object.getSectionForm(
            'expense_item_detail',
            data.rowIndex,
            data.buttonId == 'CREATE_CONFIRM'
          );
          expenseForm?.markAllAsTouched();
          if (expenseForm?.valid) {
            let content = expenseForm.value as ExpenseItemDetail;
            if (data.buttonId == 'CREATE_CONFIRM') {
              expenseList.accordion?.object.addContentRow(content);
            } else {
              expenseList.accordion?.object.updateContentRow(
                content,
                data.rowIndex
              );
            }
            expenseList.accordion?.object.hideForm(
              data.rowIndex,
              data.buttonId == 'CREATE_CONFIRM'
            );
            if (!isCreate) {
              let index = this.itemList.findIndex(
                (f) => f.id == expenseList.accordion?.parentId
              );
              let id = expenseList.accordion?.parentId!;
              let expenseItems = this.getSectionAccordion(
                'expense_list_detail',
                index
              )?.itemList as ExpenseItemDetail[];
              this.accountService
                .updateExpenseItem(id, expenseItems)
                .subscribe((d) => this.updateContentRow(d!, index));
            }
          }
          break;
        case 'CREATE_CANCEL':
        case 'CANCEL':
          expenseList.accordion?.object.hideForm(
            data.rowIndex,
            data.buttonId == 'CREATE_CANCEL'
          );
          break;
        case 'DELETE_EXPENSE_ITEM':
          if (isCreate) {
            expenseList.accordion?.object.removeContentRow(data.rowIndex);
          } else {
            let index = this.itemList.findIndex(
              (f) => f.id == expenseList.accordion?.parentId
            );
            let expenseItems = this.getSectionAccordion(
              'expense_list_detail',
              index
            )?.itemList as ExpenseItemDetail[];
            console.log(expenseItems);
            if (expenseItems.length == 1) {
              this.modalService.openNotificationModal(
                AppDialog.err_min_1_expense,
                'notification',
                'error'
              );
            } else {
              let id = expenseList.accordion?.parentId!;
              expenseList.accordion?.object.removeContentRow(data.rowIndex);
              this.accountService
                .updateExpenseItem(id, expenseItems)
                .subscribe((d) => this.updateContentRow(d!, index));
            }
          }
          break;
        case 'UPDATE_EXPENSE_ITEM':
          expenseList.accordion?.object.showEditForm(data.rowIndex, [
            'expense_item_detail',
          ]);
          break;
      }
    });
  }
}
