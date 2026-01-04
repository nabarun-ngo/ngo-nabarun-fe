import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Account, Expense } from '../../model';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { manageExpenseHighLevelView, manageExpenseTabHeader, rejectionModal, settlementSummary } from '../../fields/expense.field';
import { SearchAndAdvancedSearchFormComponent } from 'src/app/shared/components/search-and-advanced-search-form/search-and-advanced-search-form.component';
import { MatDialogRef } from '@angular/material/dialog';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { MyExpensesTabComponent } from '../my-expenses-tab/my-expenses-tab.component';
import { removeNullFields } from 'src/app/core/service/utilities.service';
import { ExpenseDefaultValue } from '../../finance.const';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { User } from 'src/app/feature/member/models/member.model';
import { KeyValue } from 'src/app/shared/model/key-value.model';

@Component({
  selector: 'app-manage-expense-tab',
  templateUrl: './manage-expense-tab.component.html',
  styleUrls: ['./manage-expense-tab.component.scss'],
})
export class ManageExpenseTabComponent extends MyExpensesTabComponent {
  protected override isAdmin: boolean = true;
  private accounts: Record<string, Account | undefined> = {};

  protected permissions!: {
    canCreateExpense: boolean;
    canFinalizeExpense: boolean;
    canSettleExpense: boolean;
  };

  override onSearch($event: SearchEvent): void {
    if ($event.advancedSearch && !$event.reset) {
      this.accountService
        .fetchExpenses(undefined, undefined, removeNullFields($event.value))
        .subscribe((s) => {
          this.setContent(s!.content!, s?.totalSize!);
        });
    } else if ($event.advancedSearch && $event.reset) {
      this.loadData();
    }
  }

  override loadData(): void {
    this.accountService
      .fetchExpenses(ExpenseDefaultValue.pageNumber, ExpenseDefaultValue.pageSize, {})
      .subscribe((data) => {
        this.setContent(data?.content!, data?.totalSize);
      });
  }

  override onInitHook(): void {
    this.setHeaderRow(manageExpenseTabHeader);
    this.permissions = {
      canCreateExpense: this.userIdentity.isAccrediatedTo(
        SCOPE.create.expense
      ),
      canFinalizeExpense: this.userIdentity.isAccrediatedTo(
        SCOPE.create.expense_final
      ),
      canSettleExpense: this.userIdentity.isAccrediatedTo(
        SCOPE.create.expense_settle
      )
    };
  }

  protected override prepareHighLevelView(
    data: Expense,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    // Convert domain model to format expected by manageExpenseHighLevelView
    return manageExpenseHighLevelView(data);
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
        button_id: 'SUBMIT_EXPENSE',
        button_name: 'Submit',
      });
    } else if (data.status == 'SUBMITTED') {
      buttons.push({
        button_id: 'REJECT',
        button_name: 'Reject',
      });
      buttons.push({
        button_id: 'UPDATE_EXPENSE',
        button_name: 'Update',
      });
      if (this.permissions.canFinalizeExpense) {
        buttons.push({
          button_id: 'FINALIZE_EXPENSE',
          button_name: 'Finalize',
        });
      }
    } else if (
      data.status == 'FINALIZED' &&
      this.permissions.canSettleExpense
    ) {
      buttons.push({
        button_id: 'SETTLE_EXPENSE',
        button_name: 'Settle',
      });
    }
    return buttons;
  }

  protected override onAccordionOpen($event: { rowIndex: number; }): void {
    const expense = this.itemList[$event.rowIndex];
    if (expense.status == 'FINALIZED') {
      this.accountService.fetchAccounts({
        type: ['WALLET'],
        status: ['ACTIVE'],
        accountHolderId: expense.paidBy?.id,
      }).subscribe((data) => {
        this.accounts[expense.id!] = this.resolveAccount(data?.content);
        this.addSectionInAccordion(settlementSummary(expense, this.accounts[expense.id!]), $event.rowIndex);
        super.onAccordionOpen($event);
      });
    }
    else {
      super.onAccordionOpen($event);
    }
  }
  private resolveAccount(content: Account[] | undefined): Account | undefined {
    return content?.[0];
  }

  override handlePageEvent($event: PageEvent): void {
    this.accountService
      .fetchExpenses($event.pageIndex, $event.pageSize, {})
      .subscribe((s) => {
        this.setContent(s!.content!, s?.totalSize!);
      });
  }

  createExpenseAdmin() {
    this.createExpense();
    this.accountService.fetchUsers().subscribe((data) => {
      this.users = data;
      let users: KeyValue[] = data?.map((m: any) => {
        return { key: m.id, displayValue: m.fullName } as KeyValue;
      })!;
      this.getSectionField(
        'expense_detail',
        'expense_borne_by',
        0,
        true
      ).form_input!.selectList = users;
    });
  }

  override onClick($event: { buttonId: string; rowIndex: number }) {
    let service;
    let dialog: MatDialogRef<SearchAndAdvancedSearchFormComponent, any>;
    switch ($event.buttonId) {
      case 'UPDATE_EXPENSE':
        this.accountService.fetchUsers().subscribe((data) => {
          this.users = data;
          let users: KeyValue[] = data?.map((m: User) => {
            return { key: m.id, displayValue: m.fullName } as KeyValue;
          })!;
          this.getSectionField(
            'expense_detail',
            'expense_borne_by',
            $event.rowIndex
          ).form_input!.selectList = users;
          this.showEditForm($event.rowIndex, ['expense_detail', 'expense_list_detail', 'expense_doc_list']);
        });
        break;
      case 'FINALIZE_EXPENSE':
        service = this.modalService.openNotificationModal(
          AppDialog.warn_confirm_finalize,
          'confirmation',
          'warning'
        );
        service.onAccept$.subscribe((data) => {
          var id = this.itemList[$event.rowIndex].id;
          this.accountService
            .updateExpense(id!, { status: 'FINALIZED' })
            .subscribe((d) => this.updateContentRow(d, $event.rowIndex));
        });
        break;
      case 'SETTLE_EXPENSE':
        this.activeButtonId = $event.buttonId;
        let itemData = this.itemList[$event.rowIndex];
        let sett_acc = this.accounts[itemData.id!]?.id;
        if (!sett_acc) {
          this.modalService.openNotificationModal(
            {
              title: 'Wallet Not Found',
              description: 'No wallets found for the payer.',
            },
            'notification',
            'error'
          );
          return;
        }
        let mesage = {
          title: 'Confirm Settlement',
          description: `I confirm that all financial settlement has been made for this expense`,
        };
        this.modalService
          .openNotificationModal(mesage, 'confirmation', 'warning')
          .onAccept$.subscribe((d) => {
            this.accountService
              .updateExpense(itemData.id!, { status: 'SETTLED', settlementAccountId: sett_acc })
              .subscribe((s) => {
                this.updateContentRow(s, $event.rowIndex);
              });
          });
        break;
      case 'REJECT':
        dialog = this.modalService.openComponentDialog(
          SearchAndAdvancedSearchFormComponent,
          rejectionModal()
        );
        dialog.componentInstance.onSearch.subscribe((s) => {
          dialog?.close();
          ////console.log(s);
          if (!s.reset) {
            var id = this.itemList[$event.rowIndex].id;
            const itemData = this.itemList[$event.rowIndex];
            this.accountService
              .updateExpense(id!, { status: 'REJECTED', remarks: itemData.remarks })
              .subscribe((d) => this.updateContentRow(d, $event.rowIndex));
          }
        });
        break;
      default:
        super.onClick($event);
        break;
    }
  }
}
