import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import {
  AccountDetail,
  ExpenseDetail,
  KeyValue,
} from 'src/app/core/api/models';
import { AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { MyExpensesTabComponent } from '../../account-dashboard/my-expenses-tab/my-expenses-tab.component';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { rejectionModal } from '../../expense.field';
import { SearchAndAdvancedSearchFormComponent } from 'src/app/shared/components/search-and-advanced-search-form/search-and-advanced-search-form.component';
import { MatDialogRef } from '@angular/material/dialog';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';

@Component({
  selector: 'app-manage-expense-tab',
  templateUrl: './manage-expense-tab.component.html',
  styleUrls: ['./manage-expense-tab.component.scss'],
})
export class ManageExpenseTabComponent extends MyExpensesTabComponent {
  protected override isAdmin: boolean = true;
  protected accounts: AccountDetail[] = [];
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
        button_id: 'REJECT',
        button_name: 'Reject',
      });
      buttons.push({
        button_id: 'UPDATE_EXPENSE',
        button_name: 'Update',
      });
      if(this.userIdentity.isAccrediatedTo(SCOPE.create.expense_final)){
        buttons.push({
          button_id: 'FINALIZE_EXPENSE',
          button_name: 'Finalize',
        });
      }
    } else if (data.status == 'FINALIZED' && this.userIdentity.isAccrediatedTo(SCOPE.create.expense_settle)) {
      buttons.push({
        button_id: 'SETTLE_EXPENSE',
        button_name: 'Settle',
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

  createExpenseAdmin() {
    this.createExpense();
    this.accountService.fetchUsers().subscribe((data) => {
      this.users = data?.content!;
      let users: KeyValue[] = data?.content?.map((m) => {
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
      case 'CONFIRM':
        if (this.activeButtonId == 'SETTLE_EXPENSE') {
          let documents = this.getSectionDocuments(
            'expense_doc_list',
            $event.rowIndex
          );
          let expense_form = this.getSectionForm(
            'expense_detail',
            $event.rowIndex
          )!;
          expense_form?.markAllAsTouched();
          console.log(documents);
          if (documents?.length == 0) {
            this.modalService.openNotificationModal(
              AppDialog.err_min_1_doc,
              'notification',
              'error'
            );
          } else if (expense_form?.valid) {
            let itemData = this.itemList[$event.rowIndex];
            let mesage = {
              title: 'Confirm Payment',
              description: `I confirm that I have paid <b>INR ${itemData.finalAmount}</b> to <b>${itemData.paidBy?.fullName}</b> and have uploaded the relevant payment documents. I also confirm that the payee has acknowledged receipt of the payments.`,
            };
            this.modalService
              .openNotificationModal(mesage, 'confirmation', 'warning')
              .onAccept$.subscribe((d) => {
                let sett_acc = this.accounts.find(
                  (f) => f.id == expense_form?.value.settlement_acc
                );
                this.accountService
                  .updateExpense(itemData.id!, {
                    status: 'SETTLED',
                    settlementAccount: sett_acc,
                  })
                  .subscribe((s) => {
                    this.accountService
                      .uploadDocuments(
                        itemData.id!,
                        documents?.map((m) => m.detail)!
                      )
                      .subscribe(() => {
                        this.updateContentRow(s!, $event.rowIndex);
                        this.hideForm($event.rowIndex);
                        this.removeButton('SETTLE_EXPENSE',$event.rowIndex)
                      });
                  });
              });
          }
        } else {
          super.onClick($event);
        }
        break;
      case 'UPDATE_EXPENSE':
        this.accountService.fetchUsers().subscribe((data) => {
          this.users = data?.content!;
          let users: KeyValue[] = data?.content?.map((m) => {
            return { key: m.id, displayValue: m.fullName } as KeyValue;
          })!;
          this.getSectionField(
            'expense_detail',
            'expense_borne_by',
            $event.rowIndex
          ).form_input!.selectList = users;
          this.showEditForm($event.rowIndex, ['expense_detail']);
        });
        break;
      case 'FINALIZE_EXPENSE':
        service = this.modalService.openNotificationModal(
          AppDialog.warn_confirm_finalize,
          'confirmation',
          'warning'
        );
        service.onAccept$.subscribe((data) => {
          var id = this.itemList[$event.rowIndex].id!;
          this.accountService
            .updateExpense(id, { status: 'FINALIZED' })
            .subscribe((d) => this.updateContentRow(d!, $event.rowIndex));
        });
        break;
      case 'SETTLE_EXPENSE':
        this.activeButtonId = $event.buttonId;
        this.accountService
          .fetchAccounts(undefined, undefined, { type: ['PRINCIPAL'] })
          .subscribe((data) => {
            this.accounts = data?.content!;
            let acc: KeyValue[] = data?.content?.map((m) => {
              return {
                key: m.id,
                displayValue: `${m?.id} (${m?.accountHolderName})`,
              } as KeyValue;
            })!;
            this.getSectionField(
              'expense_detail',
              'settlement_account',
              $event.rowIndex
            ).form_input!.selectList = acc;
            this.showEditForm($event.rowIndex, [
              'expense_detail',
              'expense_doc_list',
            ]);
          });
        break;
      case 'REJECT':
        dialog = this.modalService.openComponentDialog(
          SearchAndAdvancedSearchFormComponent,
          rejectionModal()
        );
        dialog.componentInstance.onSearch.subscribe((s) => {
          dialog?.close();
          console.log(s);
          if (!s.reset) {
            var id = this.itemList[$event.rowIndex].id!;
            //s.value.remarks
            this.accountService
              .updateExpense(id, { status: 'REJECTED', remarks: s.value.remarks })
              .subscribe((d) => this.updateContentRow(d!, $event.rowIndex));
          }
        });
        break;
      default:
        super.onClick($event);
        break;
    }
  }

  protected override onAccordionOpen($event: { rowIndex: number }) {}
}
