import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AccountDetail, KeyValue } from 'src/app/core/api/models';
import {
  AccordionCell,
  AccordionButton,
} from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import {
  accountDetailSection,
  accountHighLevelView,
  accountTabHeader,
  bankDetailSection,
  transferAmountSection,
  upiDetailSection,
} from '../../account.field';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountDefaultValue } from '../../account.const';
import { AccountService } from '../../account.service';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

@Component({
  selector: 'app-my-accounts-tab',
  templateUrl: './my-accounts-tab.component.html',
  styleUrls: ['./my-accounts-tab.component.scss'],
})
export class MyAccountsTabComponent extends Accordion<AccountDetail> {
  refData: any;
  constructor(
    protected route: ActivatedRoute,
    protected accountService: AccountService,
    protected router: Router
  ) {
    super();
    //Set Ref Data
    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
      this.setRefData(this.refData);
    }
    //Init Pagination
    this.init(
      AccountDefaultValue.pageNumber,
      AccountDefaultValue.pageSize,
      AccountDefaultValue.pageSizeOptions
    );
  }

  override ngOnInit(): void {
    this.setHeaderRow(accountTabHeader('my_accounts'));
  }

  protected override prepareHighLevelView(
    data: AccountDetail,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    return accountHighLevelView(data, 'my_accounts', this.refData);
  }

  protected override prepareDetailedView(
    data: AccountDetail,
    options?: { [key: string]: any }
  ): DetailedView[] {
    let isCreate = options && options['create'];
    return [
      accountDetailSection(data, this.refData, isCreate),
      bankDetailSection(data),
      upiDetailSection(data),
    ];
  }

  protected override prepareDefaultButtons(
    data: AccountDetail,
    options?: { [key: string]: any }
  ): AccordionButton[] {
    return [
      {
        button_id: 'VIEW_TRANSACTIONS',
        button_name: 'View Transactions',
      },
      {
        button_id: 'TRANSFER',
        button_name: 'Transfer',
      },
      {
        button_id: 'UPDATE_BANK_UPI',
        button_name: 'Update Bank and UPI Detail',
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
          { state: account, queryParams: { self: 'Y' } }
        );
        break;
      case 'TRANSFER':
        this.addSectionInAccordion(transferAmountSection(), event.rowIndex);
        this.showEditForm(event.rowIndex, ['transfer_amt']);
        this.initTransferForm(event.rowIndex);
        this.activeButtonId = event.buttonId;
        break;
      case 'UPDATE_BANK_UPI':
        this.showEditForm(event.rowIndex, ['bank_detail', 'upi_detail']);
        this.initBankingUPIForm(event.rowIndex);
        this.activeButtonId = event.buttonId;
        break;
      case 'CANCEL':
        this.hideForm(event.rowIndex);
        if (this.activeButtonId == 'TRANSFER') {
          this.removeSectionInAccordion('transfer_amt', event.rowIndex);
        }
        break;
      case 'CONFIRM':
        if (this.activeButtonId == 'TRANSFER') {
          this.performTransferAction(event.rowIndex);
        }
        if (this.activeButtonId == 'UPDATE_BANK_UPI') {
          this.performBankUpiDetailUpdate(event.rowIndex);
        }
        break;
    }
  }

  private performBankUpiDetailUpdate(rowIndex: number) {
    let item = this.itemList[rowIndex];
    let bankForm = this.getSectionForm('bank_detail', rowIndex);
    let upiForm = this.getSectionForm('upi_detail', rowIndex);
    let hasBankDetail = Object.values(bankForm?.value).find(
      (f) => f != null || f != undefined
    );
    if (hasBankDetail) {
      bankForm?.markAllAsTouched();
    }
    upiForm?.markAllAsTouched();

    if ((!hasBankDetail || bankForm?.valid) && upiForm?.valid) {
      this.accountService
        .updateBankingAndUPIDetail(item.id!, bankForm?.value, upiForm?.value)
        .subscribe((d) => {
          this.hideForm(rowIndex);
          this.updateContentRow(d!,rowIndex);
        });
    }
  }
  private performTransferAction(rowIndex: number) {
    let transfer_form = this.getSectionForm('transfer_amt', rowIndex);
    transfer_form?.markAllAsTouched();
    if (transfer_form?.valid) {
      let account = this.itemList[rowIndex];
      this.accountService
        .performTransaction(account, transfer_form.value)
        .subscribe((d) => {
          console.log(d);
          this.hideForm(rowIndex);
          this.removeSectionInAccordion('transfer_amt', rowIndex);
          this.updateContentRow(d?.transferFrom!,rowIndex);
        });
    }
  }
  private initTransferForm(rowIndex: number) {
    this.accountService.fetchAccounts().subscribe((data) => {
      let selectList = this.getSectionField(
        'transfer_amt',
        'transferTo',
        rowIndex
      )?.form_input?.selectList;
      selectList?.splice(0);
      data?.content?.forEach((element) => {
        let val = {
          key: element.id,
          displayValue: element.id! + '  (' + element.accountHolderName + ')',
        } as KeyValue;
        selectList?.push(val);
      });
    });
  }
  private initBankingUPIForm(rowIndex: number) {
    let bankForm = this.getSectionForm('bank_detail', rowIndex);
    bankForm?.valueChanges.subscribe((data) => {
      let hasBankDetail = Object.values(bankForm?.value).find(
        (f) => f != null || f != undefined
      );
      if (!hasBankDetail) {
        Object.keys(bankForm?.controls!).forEach((key) => {
          bankForm?.controls[key].markAsUntouched();
        });
      }
    });
  }

  protected override onAccordionOpen(event: { rowIndex: number }): void {}

  override handlePageEvent($event: PageEvent): void {
    this.accountService
      .fetchMyAccounts($event.pageIndex, $event.pageSize)
      .subscribe((data) => {
        this.setContent(data?.content!, data?.totalSize);
      });
  }
}
