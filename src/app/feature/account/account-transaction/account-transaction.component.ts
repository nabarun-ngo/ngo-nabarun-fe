import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { TransactionDefaultValue } from '../account.const';
import { ActivatedRoute } from '@angular/router';
import { KeyValue, PaginateTransactionDetail, TransactionDetail } from 'src/app/core/api/models';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
import { PageEvent } from '@angular/material/paginator';
import { AccordionCell, AccordionButton } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';

@Component({
  selector: 'app-account-transaction',
  templateUrl: './account-transaction.component.html',
  styleUrls: ['./account-transaction.component.scss']
})
export class AccountTransactionComponent extends Accordion<TransactionDetail> implements OnInit {
  
  defaultValue = TransactionDefaultValue;
  refData: { [name: string]: KeyValue[]; } | undefined;
  transactionList!: PaginateTransactionDetail;

  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
  ) {
    super();
  }

  ngOnInit(): void {
    this.sharedDataService.setPageName(this.defaultValue.pageTitle);
    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('TRANSACTION', this.refData!);
      this.setRefData(this.refData);
    }
    this.setAccordionHeader();

    if (this.route.snapshot.data['data']) {
      this.transactionList = this.route.snapshot.data['data'] as PaginateTransactionDetail;
      this.itemLengthSubs.next(this.transactionList?.totalSize!);
      this.clearContents()
      this.transactionList.content?.forEach(item => {
        this.addContentRow(item);
      })
    }
  }


  setAccordionHeader() {
    this.setHeaderRow([
      {
        value: 'Transaction Id',
        rounded: true
      },
      {
        value: 'Transaction Amount',
        rounded: true
      },
      {
        value: 'Transaction Status',
        rounded: true
      },
      {
        value: 'Transaction Date',
        rounded: true
      }
    ])
  }

  protected override prepareHighLevelView(data: TransactionDetail, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.txnId!,
        bgColor: 'bg-purple-200'
      },
      {
        type: 'text',
        value: '₹ '+data?.txnAmount!,
      },
      {
        type: 'text',
        value: data?.txnStatus!,
      },
      {
        type: 'date',
        value: data?.txnDate!,
      },
    ];
  }
  protected override prepareDetailedView(data: TransactionDetail, options?: { [key: string]: any; }): DetailedView[] {
    return [];
  }
  protected override prepareDefaultButtons(data: TransactionDetail, options?: { [key: string]: any; }): AccordionButton[] {
    return [];
  }
  override handlePageEvent($event: PageEvent): void {
  }

  onClick($event: { buttonId: string; rowIndex: number; }) {
    throw new Error('Method not implemented.');
  }

  accordionOpened($event: { rowIndex: number; }) {
    throw new Error('Method not implemented.');
  }

}
