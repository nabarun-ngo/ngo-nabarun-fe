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
  expenseEditableTable,
  expenseHighLevelView,
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
import { ActivatedRoute, Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { getProjectSection } from 'src/app/feature/project/fields/project.field';
import { getActivitySection } from 'src/app/feature/project/fields/activity.field';
import { ProjectSelectionService, ProjectSelectionResult } from 'src/app/feature/project/service/project-selection.service';
import { ExpenseService } from '../../service/expense.service';


@Component({
  selector: 'app-my-expenses-tab',
  templateUrl: './my-expenses-tab.component.html',
  styleUrls: ['./my-expenses-tab.component.scss'],
})
export class MyExpensesTabComponent extends Accordion<Expense> implements TabComponentInterface<PagedExpenses> {
  projectId: string | undefined;
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
  protected activityId?: string;
  protected detailedViews: DetailedView[] = [];


  constructor(
    protected expenseService: ExpenseService,
    protected modalService: ModalService,
    protected userIdentity: UserIdentityService,
    protected route: ActivatedRoute,
    protected router: Router,
    private projectSelectionService: ProjectSelectionService,
  ) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow(expenseTabHeader);
    this.activityId = this.route.snapshot.queryParamMap.get('activityId') ?? undefined;
    this.projectId = this.route.snapshot.queryParamMap.get('projectId') ?? undefined;

    const state = history.state;
    if (state && state.project && state.activity) {
      this.activityId = state.activity.id;
      this.projectId = state.project.id;
      this.detailedViews = [
        getProjectSection(state.project, this.getRefData()!, []),
        getActivitySection(state.activity, this.getRefData()!)
      ];
    }
  }

  onSearch($event: SearchEvent): void {
    if ($event.advancedSearch && !$event.reset) {
      this.expenseService
        .fetchMyExpenses(undefined, undefined, {
          expenseRefId: this.activityId,
          ...removeNullFields($event.value)
        })
        .subscribe((s) => {
          this.setContent(s!.content!, s?.totalSize!);
        });
    } else if ($event.advancedSearch && $event.reset) {
      this.loadData();
    }
  }

  loadData(): void {
    console.log(this.activityId)
    this.expenseService
      .fetchMyExpenses(AccountDefaultValue.pageNumber, AccountDefaultValue.pageSize, {
        expenseRefId: this.activityId
      })
      .subscribe((data) => {
        this.setContent(data?.content!, data?.totalSize);
      });
  }

  protected override prepareHighLevelView(
    data: Expense,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    // Convert domain model to format expected by expenseHighLevelView
    return expenseHighLevelView(data);
  }

  protected override prepareDetailedView(
    data: Expense,
    options?: { [key: string]: any }
  ): DetailedView[] {
    let isCreate = options && options['create'];
    return [
      expenseDetailSection({
        ...data,
        ...this.isAdmin ? {} : {
          paidBy: {
            id: this.userIdentity.loggedInUser.profile_id,
            fullName: this.userIdentity.loggedInUser.name,
          }
        },
      }, isCreate, this.isAdmin, this.activityId !== undefined),
      expenseEditableTable(data, isCreate),
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
    this.expenseService
      .fetchExpenses($event.pageIndex, $event.pageSize, {
        expenseRefId: this.activityId
      })
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
          this.selectProject()
        }
      });
  }

  onClick($event: { buttonId: string; rowIndex: number }) {
    switch ($event.buttonId) {
      case 'UPDATE_EXPENSE':
        this.showEditForm($event.rowIndex, ['expense_detail', 'expense_list_detail', 'expense_doc_list']);
        break;
      case 'CREATE_CONFIRM':
      case 'CONFIRM':
      case 'SUBMIT_EXPENSE':
        let expenseForm = this.getSectionForm(
          'expense_detail',
          $event.rowIndex,
          $event.buttonId == 'CREATE_CONFIRM' ? true : false
        );
        let expenseFormItems = this.getSectionForm(
          'expense_list_detail',
          $event.rowIndex,
          $event.buttonId == 'CREATE_CONFIRM' ? true : false
        );
        let expenseItems = expenseFormItems?.get('items')?.value as ExpenseItem[];
        expenseForm?.markAllAsTouched();
        expenseFormItems?.markAllAsTouched();
        const expenseDocuments = this.getSectionDocuments('expense_doc_list', $event.rowIndex, $event.buttonId == 'CREATE_CONFIRM' ? true : false);
        if (expenseItems.length == 0) {
          this.modalService.openNotificationModal(
            AppDialog.err_min_1_expense,
            'notification',
            'error'
          );
        } else if (expenseForm?.valid && expenseFormItems?.valid) {

          const payerId = this.isAdmin
            ? expenseForm?.value.expense_by
            : this.userIdentity.loggedInUser.profile_id;

          if ($event.buttonId == 'CREATE_CONFIRM') {
            this.expenseService.createExpenses({
              description: expenseForm.value.description,
              name: expenseForm.value.name,
              expenseRefId: this.activityId,
              expenseRefType: this.activityId ? 'EVENT' : 'ADHOC',
              expenseDate: expenseForm.value.expenseDate,
              expenseItems: expenseItems,
              payerId: payerId
            }).subscribe((d) => {
              this.hideForm(0, true);
              this.addContentRow(d!, true);
            });
          } else {
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
                this.expenseService
                  .updateExpense(id!, {
                    ...existingExpense,
                    expenseItems: expenseItems,
                    status: 'SUBMITTED',
                    payerId: expenseForm?.value.expense_by
                  })
                  .subscribe((d) => {
                    this.hideForm($event.rowIndex);
                    this.updateContentRow(d, $event.rowIndex);
                    this.expenseService.uploadDocuments(expenseDocuments ?? [], id!, 'EXPENSE').subscribe();
                  });
              });
            } else {
              this.expenseService
                .updateExpense(id!, {
                  ...existingExpense,
                  expenseItems: expenseItems,
                  status: undefined,
                  payerId: expenseForm?.value.expense_by
                })
                .subscribe((d) => {
                  this.hideForm($event.rowIndex);
                  this.updateContentRow(d, $event.rowIndex);
                  this.expenseService.uploadDocuments(expenseDocuments ?? [], id!, 'EXPENSE').subscribe();
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
    this.expenseService.getExpenseDocuments(item.id!).subscribe((data) => {
      this.addSectionInAccordion(expenseDocumentSection(data), $event.rowIndex);
    });
  }

  selectProject(): void {
    this.projectSelectionService.selectProject().subscribe((result: ProjectSelectionResult | null) => {
      if (result) {
        this.projectId = result.projectId;
        this.activityId = result.activityId;
        this.detailedViews = [
          getProjectSection(result.project, this.getRefData()!, []),
          getActivitySection(result.activity, this.getRefData()!)
        ];
        this.loadData();
      }
    });
  }

}
