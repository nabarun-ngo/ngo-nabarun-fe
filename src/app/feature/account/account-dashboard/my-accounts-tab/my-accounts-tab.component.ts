import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { AccountDetail, AccountDetailFilter, KeyValue, PaginateAccountDetail } from 'src/app/core/api/models';
import {
  AccordionCell,
  AccordionButton,
} from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import {
  accountDetailSection,
  accountDocumentSection,
  accountHighLevelView,
  accountTabHeader,
  bankDetailSection,
  moneyInSection,
  transferAmountSection,
  upiDetailSection,
} from '../../account.field';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountDefaultValue } from '../../account.const';
import { AccountService } from '../../account.service';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { removeNullFields } from 'src/app/core/service/utilities.service';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';

@Component({
  selector: 'app-my-accounts-tab',
  templateUrl: './my-accounts-tab.component.html',
  styleUrls: ['./my-accounts-tab.component.scss'],
})
export class MyAccountsTabComponent extends Accordion<AccountDetail> implements TabComponentInterface<PaginateAccountDetail> {
  
  constructor(
    protected route: ActivatedRoute,
    protected accountService: AccountService,
    protected router: Router,
    protected modalService: ModalService,
    protected userIdentityService: UserIdentityService
  ) {
    super();
  }

  override ngOnInit(): void {
    this.setHeaderRow(accountTabHeader('my_accounts'));
    //Init Pagination
    this.init(
      AccountDefaultValue.pageNumber,
      AccountDefaultValue.pageSize,
      AccountDefaultValue.pageSizeOptions
    );
  }

  /**
   * Load data for this tab - required by TabComponentInterface
   */
  loadData(): void {
    this.fetchData(AccountDefaultValue.pageNumber,AccountDefaultValue.pageSize); 
  }

  /**
   * Handle search events forwarded from parent
   */
  onSearch(event: SearchEvent): void {
    if (event.advancedSearch && !event.reset) {
      this.fetchData(undefined, undefined, removeNullFields(event.value));
    } else if (event.advancedSearch && event.reset) {
      this.loadData();
    }else if(event.buttonName == 'ADVANCED_SEARCH'){
      this.getAccordionList().searchValue='';
    }
  }

  private fetchData(pageNumber?: number, pageSize?: number,filter?: AccountDetailFilter) {  
     this.accountService
        .fetchMyAccounts(
          pageNumber,
          pageSize,
          filter
        )
        .subscribe((data) => {
          this.setContent(data?.content!, data?.totalSize);
        });
  }

  protected override prepareHighLevelView(
    data: AccountDetail,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    return accountHighLevelView(data, 'my_accounts', this.getRefData()!);
  }

  protected override prepareDetailedView(
    data: AccountDetail,
    options?: { [key: string]: any }
  ): DetailedView[] {
    let isCreate = options && options['create'];
    return [
      accountDetailSection(data, this.getRefData()!, isCreate),
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
        button_name: 'Transfer Funds',
      },
      {
        button_id: 'MONEY_IN',
        button_name: 'Add Funds',
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
        this.addSectionInAccordion(accountDocumentSection([]), event.rowIndex);
        this.showEditForm(event.rowIndex, ['transfer_amt', 'document_list']);
        this.initTransferForm(event.rowIndex);
        this.activeButtonId = event.buttonId;
        break;
      case 'MONEY_IN':
        this.addSectionInAccordion(moneyInSection(), event.rowIndex);
        this.addSectionInAccordion(accountDocumentSection([]), event.rowIndex);
        this.showEditForm(event.rowIndex, ['money_in_acc', 'document_list']);
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
          this.removeSectionInAccordion('document_list', event.rowIndex);
        }
        if (this.activeButtonId == 'MONEY_IN') {
          this.removeSectionInAccordion('money_in_acc', event.rowIndex);
          this.removeSectionInAccordion('document_list', event.rowIndex);
        }
        break;
      case 'CONFIRM':
        if (this.activeButtonId == 'TRANSFER') {
          this.performTransferAction(event.rowIndex);
        }
        if (this.activeButtonId == 'MONEY_IN') {
          this.performMoneyInAction(event.rowIndex);
        }
        if (this.activeButtonId == 'UPDATE_BANK_UPI') {
          this.performBankUpiDetailUpdate(event.rowIndex);
        }
        break;
    }
  }
  performMoneyInAction(rowIndex: number) {
    let money_in_acc = this.getSectionForm('money_in_acc', rowIndex);
    money_in_acc?.markAllAsTouched();
    if (money_in_acc?.valid) {
      let document_list = this.getSectionDocuments('document_list', rowIndex);
      if (document_list?.length == 0) {
        this.modalService.openNotificationModal(
          AppDialog.err_min_1_doc,
          'notification',
          'error'
        );
        return;
      }
      let account = this.itemList[rowIndex];
      let message = {
        title: 'Confirm',
        description: `I confirm that I have received ${money_in_acc.value.amount} in my account ${account.id}`,
      };
      let modal = this.modalService.openNotificationModal(
        message,
        'confirmation',
        'warning'
      );
      modal.onAccept$.subscribe(() => {
        this.accountService
          .performMoneyIn(account, money_in_acc?.value)
          .subscribe((d) => {
            console.log(d);
            this.hideForm(rowIndex);
            this.removeSectionInAccordion('money_in_acc', rowIndex);
            this.removeSectionInAccordion('document_list', rowIndex);
            this.updateContentRow(d?.transferTo!, rowIndex);
             let files = document_list?.map(m=>{
              m.detail.documentMapping=[{
                docIndexId: d?.txnId,
                docIndexType:'TRANSACTION'
              }];
              return m.detail;
            })!;
            this.accountService.uploadDocuments(files).subscribe();
          });
      });
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
          this.updateContentRow(d!, rowIndex);
        });
    }
  }
  private performTransferAction(rowIndex: number) {
    let transfer_form = this.getSectionForm('transfer_amt', rowIndex);
    transfer_form?.markAllAsTouched();
    if (transfer_form?.valid) {
      let document_list = this.getSectionDocuments('document_list', rowIndex);
      if (document_list?.length == 0) {
        this.modalService.openNotificationModal(
          AppDialog.err_min_1_doc,
          'notification',
          'error'
        );
        return;
      }
      let account = this.itemList[rowIndex];
      let message = {
        title: 'Confirm',
        description: `I confirm that I have transferred ${transfer_form.value.amount} to account ${transfer_form.value.transferTo} and uploaded related document.`,
      };
      let modal = this.modalService.openNotificationModal(
        message,
        'confirmation',
        'warning'
      );
      modal.onAccept$.subscribe(() => {
        this.accountService
          .performTransfer(account, transfer_form?.value)
          .subscribe((d) => {
            console.log(d);
            this.hideForm(rowIndex);
            this.removeSectionInAccordion('transfer_amt', rowIndex);
            this.removeSectionInAccordion('document_list', rowIndex);
            this.updateContentRow(d?.transferFrom!, rowIndex);
            let files = document_list?.map(m=>{
              m.detail.documentMapping=[{
                docIndexId: d?.txnId,
                docIndexType:'TRANSACTION'
              }];
              return m.detail;
            })!;
            this.accountService.uploadDocuments(files).subscribe();
          });
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
    this.fetchData($event.pageIndex, $event.pageSize);
  }
}
