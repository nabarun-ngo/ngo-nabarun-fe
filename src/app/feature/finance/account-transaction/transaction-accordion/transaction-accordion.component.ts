import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Transaction } from '../../model';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { TransactionDefaultValue } from '../../finance.const';
import { reverseTransactionSection, transactionDetailSection, transactionHeader } from '../../fields/transaction.field';
import { removeNullFields } from 'src/app/core/service/utilities.service';
import { AccountService } from '../../service/account.service';
import { accountDocumentSection } from '../../fields/account.field';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { ModalService } from 'src/app/core/service/modal.service';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';

@Component({
  selector: 'app-transaction-accordion',
  templateUrl: './transaction-accordion.component.html',
  styleUrls: ['./transaction-accordion.component.scss']
})
export class TransactionAccordionComponent extends Accordion<Transaction> {
  permissions!: { canReverseTxn: boolean; };

  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: this.defaultValue.pageNumber,
      pageSize: this.defaultValue.pageSize,
      pageSizeOptions: this.defaultValue.pageSizeOptions
    }
  }


  @Input({ required: true })
  accountId!: string;

  @Input({ required: true })
  isSelfAccount!: boolean;

  defaultValue = TransactionDefaultValue;

  constructor(protected accountService: AccountService,
    protected modalService: ModalService,
    protected identityService: UserIdentityService
  ) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow(transactionHeader);
    this.permissions = {
      canReverseTxn: this.identityService.isAccrediatedToAny(SCOPE.update.transactions)
    }
  }

  protected override prepareHighLevelView(
    data: Transaction,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.txnId,
        bgColor: 'bg-purple-200',
      },
      {
        type: 'text',
        value: '₹ ' + data?.txnAmount,
      },
      {
        type: 'text',
        value: data?.accTxnType || '',
      },
      {
        type: 'date',
        value: data?.txnDate,
      },
    ];
  }
  protected override prepareDetailedView(
    data: Transaction,
    options?: { [key: string]: any }
  ): DetailedView[] {
    return [
      transactionDetailSection(data, this.getRefData()!),
    ];
  }
  protected override prepareDefaultButtons(
    data: Transaction,
    options?: { [key: string]: any }
  ): AccordionButton[] {
    // return !this.isSelfAccount && this.permissions.canReverseTxn ? [{
    //   button_id: 'REVERSE',
    //   button_name: 'Reverse Transaction',
    // }] : [];
    return [];
  }
  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.fetchDetails(this.pageNumber, this.pageSize);
  }


  onClick($event: { buttonId: string; rowIndex: number }) {
    if ($event.buttonId == 'REVERSE') {
      this.addSectionInAccordion(
        reverseTransactionSection(this.itemList![$event.rowIndex], this.getRefData()!),
        $event.rowIndex
      );
      this.showEditForm($event.rowIndex, ['reverse_txn']);
    }
    else if ($event.buttonId == 'CONFIRM') {
      this.reverseTransaction($event.rowIndex);
    }
    else if ($event.buttonId == 'CANCEL') {
      this.removeSectionInAccordion('reverse_txn', $event.rowIndex);
      this.hideForm($event.rowIndex);
    }
  }

  private reverseTransaction(rowIndex: number) {
    let item = this.itemList![rowIndex];
    const reverse_form = this.getSectionForm('reverse_txn', rowIndex);
    if (reverse_form?.valid) {
      const modalRef = this.modalService.openNotificationModal({
        title: 'Reverse Transaction',
        description: 'Are you sure you want to reverse this transaction?',
      }, 'confirmation', 'warning');

      modalRef.onAccept$.subscribe((data) => {
        if (data) {
          this.accountService.reverseTransaction(this.accountId, item.transactionRef, reverse_form?.value.reasonForReversal).subscribe((data) => {
            this.removeSectionInAccordion('reverse_txn', rowIndex);
            this.hideForm(rowIndex);
            this.fetchDetails(this.pageNumber, this.pageSize);
          });
        }
      });
    } else {
      reverse_form?.markAllAsTouched();
    }

  }

  onAccordionOpen($event: { rowIndex: number }) {
    let item = this.itemList![$event.rowIndex];
    this.accountService
      .getTransactionDocuments(item.transactionRef)
      .subscribe((data) => {
        this.addSectionInAccordion(
          accountDocumentSection(data!),
          $event.rowIndex
        );
      });
  }


  performSearch($event: SearchEvent) {
    console.log($event)
    if ($event.advancedSearch && !$event.reset) {
      this.fetchDetails(undefined, undefined, removeNullFields($event.value));
    } else if ($event.advancedSearch && $event.reset) {
      this.fetchDetails(TransactionDefaultValue.pageNumber, TransactionDefaultValue.pageSize);
    } else if ($event.buttonName == 'ADVANCED_SEARCH') {
      this.getAccordionList().searchValue = '';
    }
  }

  private fetchDetails(pageNumber?: number, pageSize?: number, filter?: any): void {
    console.log(filter)
    if (this.isSelfAccount) {
      this.accountService
        .fetchMyTransactions(this.accountId, pageNumber, pageSize, filter)
        .subscribe((data) => {
          this.setContent(
            data?.content!,
            data?.totalSize!
          );
        });
    } else {
      this.accountService
        .fetchTransactions(this.accountId, pageNumber, pageSize, filter)
        .subscribe((data) => {
          this.setContent(
            data?.content!,
            data?.totalSize!
          );
        });
    }
  }
}
