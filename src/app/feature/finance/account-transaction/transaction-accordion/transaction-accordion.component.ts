import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Transaction } from '../../model';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { TransactionDefaultValue } from '../../finance.const';
import { transactionDetailSection, transactionHeader } from '../../fields/transaction.field';
import { removeNullFields } from 'src/app/core/service/utilities.service';
import { AccountService } from '../../service/account.service';
import { accountDocumentSection } from '../../fields/account.field';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';

@Component({
  selector: 'app-transaction-accordion',
  templateUrl: './transaction-accordion.component.html',
  styleUrls: ['./transaction-accordion.component.scss']
})
export class TransactionAccordionComponent extends Accordion<Transaction> {

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

  constructor(protected accountService: AccountService) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow(transactionHeader);
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
        value: data?.txnParticulars || '',
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
    // Convert domain model to format expected by transactionDetailSection
    const transactionData = {
      txnId: data.txnId,
      txnNumber: data.txnNumber,
      txnDate: data.txnDate,
      txnType: data.txnType,
      txnStatus: data.txnStatus,
      txnAmount: data.txnAmount,
      txnDescription: data.txnDescription,
      txnParticulars: data.txnParticulars,
      txnRefId: data.txnRefId,
      txnRefType: data.txnRefType,
      accBalance: data.accBalance,
      comment: data.comment,
      account: data.account,
      transferFrom: data.transferFrom,
      transferTo: data.transferTo
    };
    return [
      transactionDetailSection(transactionData as any, this.getRefData()!),
    ];
  }
  protected override prepareDefaultButtons(
    data: Transaction,
    options?: { [key: string]: any }
  ): AccordionButton[] {
    return [];
  }
  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.fetchDetails(this.pageNumber, this.pageSize);
  }


  onClick($event: { buttonId: string; rowIndex: number }) { }

  onAccordionOpen($event: { rowIndex: number }) {
    let item = this.itemList![$event.rowIndex];
    this.accountService
      .getTransactionDocuments(item.txnId)
      .subscribe((data) => {
        this.addSectionInAccordion(
          accountDocumentSection(data!),
          $event.rowIndex
        );
      });
  }


  performSearch($event: SearchEvent) {
    if ($event.advancedSearch && !$event.reset) {
      this.fetchDetails(undefined, undefined, removeNullFields($event.value));
    } else if ($event.advancedSearch && $event.reset) {
      this.fetchDetails(TransactionDefaultValue.pageNumber, TransactionDefaultValue.pageSize);
    } else if ($event.buttonName == 'ADVANCED_SEARCH') {
      this.getAccordionList().searchValue = '';
    }
  }

  private fetchDetails(pageNumber?: number, pageSize?: number, filter?: any): void {
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
