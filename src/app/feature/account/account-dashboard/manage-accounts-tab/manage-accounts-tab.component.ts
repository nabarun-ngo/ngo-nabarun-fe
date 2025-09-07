import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AccountDetail, KeyValue } from 'src/app/core/api/models';
import { filterFormChange } from 'src/app/core/service/form.service';
import { accountHighLevelView, accountTabHeader } from '../../account.field';
import { MyAccountsTabComponent } from '../my-accounts-tab/my-accounts-tab.component';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';

@Component({
  selector: 'app-manage-accounts-tab',
  templateUrl: './manage-accounts-tab.component.html',
  styleUrls: ['./manage-accounts-tab.component.scss'],
})
export class ManageAccountsTabComponent extends MyAccountsTabComponent {
  override ngOnInit(): void {
    this.setHeaderRow(accountTabHeader('all_accounts'));
  }

   protected override prepareHighLevelView(
      data: AccountDetail,
      options?: { [key: string]: any }
    ): AccordionCell[] {
      return accountHighLevelView(data, 'all_accounts', this.refData);
    }

  protected override prepareDefaultButtons(
    data: AccountDetail,
    options?: { [key: string]: any }
  ): AccordionButton[] {
    let isCreate = options && options['create'];
    if (isCreate) {
      return [
        {
          button_id: 'CANCEL_CREATE',
          button_name: 'Cancel',
        },
        {
          button_id: 'CONFIRM_CREATE',
          button_name: 'Confirm',
        },
      ];
    }
    return [
      {
        button_id: 'VIEW_TRANSACTIONS',
        button_name: 'View Transactions',
      },
      {
        button_id: 'UPDATE_ACCOUNT',
        button_name: 'Update Account',
      },  
    ];
  }

  protected override onClick(event: {
    buttonId: string;
    rowIndex: number;
  }): void {
    switch (event.buttonId) {
      case 'VIEW_TRANSACTIONS':
        let account = this.itemList[event.rowIndex];
        this.router.navigate(
          [
            AppRoute.secured_account_transaction_page.url.replace(
              ':id',
              btoa(account.id!)
            ),
          ],
          { state: account, queryParams: { self: 'N' } }
        );
        break;
      case 'UPDATE_ACCOUNT':
        this.showEditForm(event.rowIndex, ['account_detail']);
        this.activeButtonId = event.buttonId;
        break;
      case 'CANCEL':
        this.hideForm(event.rowIndex);
        break;
      case 'CONFIRM':
        if (this.activeButtonId == 'UPDATE_ACCOUNT') {
          this.performUpdateAccount(event.rowIndex);
        }

        break;
      case 'CANCEL_CREATE':
        this.hideForm(0, true);
        break;
      case 'CONFIRM_CREATE':
        this.performCreateAccount();
        break;
    }
  }
  private performCreateAccount() {
    let accountForm = this.getSectionForm('account_detail', 0, true);
    accountForm?.markAllAsTouched();
    if (accountForm?.valid) {
      this.accountService.createAccount(accountForm.value).subscribe((d) => {
        this.hideForm(0, true);
        this.addContentRow(d!, true);
      });
    }
  }

  private performUpdateAccount(rowIndex: number) {
    let account = this.itemList[rowIndex];
    let accountForm = this.getSectionForm('account_detail', rowIndex);
    accountForm?.markAllAsTouched();
    if (accountForm?.valid) {
      this.accountService
        .updateAccountDetail(account.id!, accountForm?.value)
        .subscribe((d) => {
          this.hideForm(rowIndex);
          this.updateContentRow(d!, rowIndex);
        });
    }
  }

  override handlePageEvent($event: PageEvent): void {
    this.accountService
      .fetchAccounts($event.pageIndex, $event.pageSize)
      .subscribe((data) => {
        this.setContent(data?.content!, data?.totalSize);
      });
  }

  initCreateAccountForm() {
    this.showCreateForm();

    let account_form = this.getSectionForm('account_detail', 0, true);
    account_form?.valueChanges
      .pipe(filterFormChange(account_form.value))
      .subscribe((val) => {
        console.log(val);
        if (val['accountType']) {
          this.accountService
            .fetchUsers(val['accountType'])
            .subscribe((data) => {
              let selectList = this.getSectionField(
                'account_detail',
                'account_holder',
                0,
                true
              )?.form_input?.selectList;
              selectList?.splice(0);
              data?.content?.forEach((element) => {
                let val = {
                  key: element.id,
                  displayValue: element.fullName,
                } as KeyValue;
                selectList?.push(val);
              });
            });
        }
      });
  }
}
