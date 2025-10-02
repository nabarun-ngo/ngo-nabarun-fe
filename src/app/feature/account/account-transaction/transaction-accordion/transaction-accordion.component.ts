import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { TransactionDetail, TransactionDetailFilter } from 'src/app/core/api/models';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { TransactionDefaultValue } from '../../account.const';
import { transactionDetailSection, transactionHeader } from '../../transaction.field';
import { FormGroup } from '@angular/forms';
import { date, removeNullFields } from 'src/app/core/service/utilities.service';
import { AccountService } from '../../account.service';
import { accountDocumentSection } from '../../account.field';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';

@Component({
  selector: 'app-transaction-accordion',
  templateUrl: './transaction-accordion.component.html',
  styleUrls: ['./transaction-accordion.component.scss']
})
export class TransactionAccordionComponent extends Accordion<TransactionDetail> {


  @Input({ required: true })
  accountId!: string;

  @Input({ required: true })
  isSelfAccount!: boolean;

  defaultValue = TransactionDefaultValue;

  constructor(protected accountService: AccountService) {
    super();
  }

  override ngOnInit(): void {
    this.init(
      this.defaultValue.pageNumber,
      this.defaultValue.pageSize,
      this.defaultValue.pageSizeOptions
    );
    this.setHeaderRow(transactionHeader);
  }

  protected override prepareHighLevelView(
    data: TransactionDetail,
    options?: { [key: string]: any }
  ): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.txnId!,
        bgColor: 'bg-purple-200',
      },
      {
        type: 'text',
        value: '₹ ' + data?.txnAmount!,
      },
      {
        type: 'text',
        value: data?.txnParticulars!,
      },
      {
        type: 'date',
        value: data?.txnDate!,
      },
    ];
  }
  protected override prepareDetailedView(
    data: TransactionDetail,
    options?: { [key: string]: any }
  ): DetailedView[] {
    return [
      transactionDetailSection(data, this.getRefData()!),
    ];
  }
  protected override prepareDefaultButtons(
    data: TransactionDetail,
    options?: { [key: string]: any }
  ): AccordionButton[] {
    return [];
  }
  override handlePageEvent($event: PageEvent): void {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.fetchDetails(this.pageNumber, this.pageSize);
  }


  onClick($event: { buttonId: string; rowIndex: number }) { }

  onAccordionOpen($event: { rowIndex: number }) {
    let item = this.itemList![$event.rowIndex];
    this.accountService
      .getTransactionDocuments(item.txnId!)
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

  private fetchDetails(pageNumber?: number, pageSize?: number, filter?: TransactionDetailFilter): void {
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
