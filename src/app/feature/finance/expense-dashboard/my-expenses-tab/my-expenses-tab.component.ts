import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Expense, ExpenseItem, PagedExpenses } from '../../model';
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
} from '../../fields/expense.field';
import { AccountService } from '../../service/account.service';
import { AccountDefaultValue } from '../../finance.const';
import { filterFormChange } from 'src/app/core/service/form.service';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { removeNullFields } from 'src/app/core/service/utilities.service';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { User } from 'src/app/feature/member/models/member.model';
import { KeyValue } from 'src/app/shared/model/key-value.model';

@Component({
  selector: 'app-my-expenses-tab',
  templateUrl: './my-expenses-tab.component.html',
  styleUrls: ['./my-expenses-tab.component.scss'],
})
export class MyExpensesTabComponent extends Accordion<Expense> implements TabComponentInterface<PagedExpenses> {
  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: AccountDefaultValue.pageNumber,
      pageSize: AccountDefaultValue.pageSize,
      pageSizeOptions: AccountDefaultValue.pageSizeOptions
    }
  }

  /**
   * Initialize variables
   */
  protected users!: Partial<User>[];
  protected isAdmin: boolean = false;
  constructor(
    protected accountService: AccountService,
    protected modalService: ModalService,
    protected userIdentity: UserIdentityService
  ) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow(expenseTabHeader);
  }

  onSearch($event: SearchEvent): void {
    if ($event.advancedSearch && !$event.reset) {
      this.accountService
        .fetchMyExpenses(undefined, undefined, removeNullFields($event.value))
        .subscribe((s) => {
          this.setContent(s!.content!, s?.totalSize!);
        });
    } else if ($event.advancedSearch && $event.reset) {
      this.loadData();
    }
  }

  loadData(): void {
    this.accountService
      .fetchMyExpenses(AccountDefaultValue.pageNumber, AccountDefaultValue.pageSize, {})
      .subscribe((data) => {
        this.setContent(data?.content!, data?.totalSize);
      });
  }

  protected override prepareHighLevelView(
    data: Expense,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    // Convert domain model to format expected by expenseHighLevelView
    return expenseHighLevelView(data as any);
  }

  protected override prepareDetailedView(
    data: Expense,
    options?: { [key: string]: any }
  ): DetailedView[] {
    let isCreate = options && options['create'];
    var expenseList = expenseListSection(data, isCreate);
    this.handleExpenseItemEvents(expenseList, isCreate);
    return [
      expenseDetailSection({
        ...data,
        paidBy: {
          id: this.userIdentity.loggedInUser.profile_id,
          fullName: this.userIdentity.loggedInUser.name,
        },
      }, isCreate, this.isAdmin),
      expenseList,
      //expenseEditableTable(data.expenseItems || []),
    ];
  }

  protected override prepareDefaultButtons(
    data: Expense,
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
        button_id: 'UPDATE_EXPENSE',
        button_name: 'Update',
      });
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
            let events: KeyValue[] = data?.content?.map((m: any) => {
              return { key: m.id, displayValue: m.name } as KeyValue;
            })!;
            this.addSectionField(
              'expense_detail',
              expenseEventField(events),
              0,
              true
            );
          });
        } else if (val['expense_source'] !== 'EVENT') {
          this.removeSectionField('expense_detail', 'expense_event', 0, true);
        }
      });
  }

  onClick($event: { buttonId: string; rowIndex: number }) {
    switch ($event.buttonId) {
      case 'UPDATE_EXPENSE':
        this.showEditForm($event.rowIndex, ['expense_detail', 'expense_doc_list']);
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
        )?.itemList as ExpenseItem[];
        expenseForm?.markAllAsTouched();
        const expenseDocuments = this.getSectionDocuments('expense_doc_list', $event.rowIndex, $event.buttonId == 'CREATE_CONFIRM' ? true : false);
        if (expenseItems.length == 0) {
          this.modalService.openNotificationModal(
            AppDialog.err_min_1_expense,
            'notification',
            'error'
          );
        } else if (expenseForm?.valid) {
          const payerId = this.isAdmin
            ? expenseForm?.value.expense_by
            : this.userIdentity.loggedInUser.profile_id;

          if ($event.buttonId == 'CREATE_CONFIRM') {
            this.accountService.createExpenses({
              description: expenseForm.value.description,
              name: expenseForm.value.name,
              expenseRefType: expenseForm.value.expense_source,
              expenseRefId: expenseForm.value.expense_event,
              expenseDate: expenseForm.value.expenseDate,
              expenseItems: expenseItems,
              payerId: payerId
            }).subscribe((d) => {
              this.hideForm(0, true);
              this.addContentRow(d!, true);
            });
          } else {
            console.log($event.buttonId);
            // For updates, we need to get the existing expense and merge changes
            let id = this.itemList[$event.rowIndex].id;
            let existingExpense = this.itemList[$event.rowIndex];
            if ($event.buttonId == 'SUBMIT_EXPENSE') {
              this.modalService.openNotificationModal(
                {
                  title: 'Submit Expense',
                  description: 'Are you sure you want to submit this expense?',
                },
                'confirmation',
                'warning'
              ).onAccept$.subscribe(() => {
                this.accountService
                  .updateExpense(id!, {
                    ...existingExpense,
                    status: 'SUBMITTED'
                  })
                  .subscribe((d) => {
                    this.hideForm($event.rowIndex);
                    this.updateContentRow(d, $event.rowIndex);
                    this.accountService.uploadDocuments(expenseDocuments ?? [], id!, 'EXPENSE').subscribe();
                  });
              });
            } else {
              this.accountService
                .updateExpense(id!, {
                  ...existingExpense, status: undefined
                })
                .subscribe((d) => {
                  this.hideForm($event.rowIndex);
                  this.updateContentRow(d, $event.rowIndex);
                  this.accountService.uploadDocuments(expenseDocuments ?? [], id!, 'EXPENSE').subscribe();
                });
            }

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
      this.addSectionInAccordion(expenseDocumentSection(data), $event.rowIndex);
    });
  }

  protected handleExpenseItemEvents(
    expenseList: DetailedView<ExpenseItem>,
    isCreate: boolean
  ) {
    expenseList.accordion?.buttonClick.subscribe((data) => {
      //console.log(data);
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
            let content = expenseForm.value as ExpenseItem;
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
              )?.itemList as ExpenseItem[];
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
            )?.itemList as ExpenseItem[];
            //console.log(expenseItems);
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
