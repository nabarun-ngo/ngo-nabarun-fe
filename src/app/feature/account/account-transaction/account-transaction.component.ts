import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { TransactionDefaultValue } from '../account.const';
import { ActivatedRoute } from '@angular/router';
import { KeyValue, PaginateTransactionDetail, TransactionDetail } from 'src/app/core/api/models';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
import { PageEvent } from '@angular/material/paginator';
import { AccordionCell, AccordionButton } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { DetailedView } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { FormGroup } from '@angular/forms';
import { date } from 'src/app/core/service/utilities.service';
import { AccountService } from '../account.service';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

@Component({
  selector: 'app-account-transaction',
  templateUrl: './account-transaction.component.html',
  styleUrls: ['./account-transaction.component.scss']
})
export class AccountTransactionComponent extends Accordion<TransactionDetail> implements OnInit {
  
  defaultValue = TransactionDefaultValue;
  refData: { [name: string]: KeyValue[]; } | undefined;
  transactionList!: PaginateTransactionDetail;
  navigations: { displayName: string; routerLink: string; }[] = [
    {
      displayName: 'Back to Accounts',
      routerLink: AppRoute.secured_account_list_page.url
    }
  ];
  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private accountService: AccountService,
  ) {
    super();
    super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions)
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
      this.setContent(this.transactionList.content!,this.transactionList?.totalSize!)
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
        value: 'Transaction Type',
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
        value: data?.txnParticulars!,
      },
      {
        type: 'date',
        value: data?.txnDate!,
      },
    ];
  }
  protected override prepareDetailedView(data: TransactionDetail, options?: { [key: string]: any; }): DetailedView[] {
    return [
      {
        section_form: new FormGroup({}),
        section_name: 'Transaction Detail',
        section_type:'key_value',
        section_html_id:'txn_det',
        content:[
          {
            field_name:'Transaction Number',
            field_value:data.txnId!,
            field_html_id:'txn_id',
          },
          {
            field_name:'Transaction Type',
            field_value:data.txnType!,
            field_html_id:'txn_type',
          },
          {
            field_name:'Transaction Particulars',
            field_value:data.txnParticulars!,
            field_html_id:'txn_type',
          },
          {
            field_name:'Transaction Description',
            field_value: data.txnDescription!,
            field_html_id:'txn_status',
          },
          {
            field_name:'Transaction Amount',
            field_value: '₹ ' +data.txnAmount!,
            field_html_id:'txn_amt',
          },
          {
            field_name:'Transaction Date',
            field_value: date(data.txnDate!),
            field_html_id:'txn_status',
          },
          {
            field_name:'Transaction Status',
            field_value: data.txnStatus!,
            field_html_id:'txn_status',
          },
          {
            field_name:'Transaction Ref Id',
            field_value: data.txnRefId!,
            field_html_id:'txn_status',
            hide_field : !data.txnRefId
          },
          {
            field_name:'Transaction Ref Type',
            field_value: data.txnRefType!,
            field_html_id:'txn_status',
             hide_field : !data.txnRefType
          },
          {
            field_name:'Transfer From Account',
            field_value: data.transferFrom?.id! ,
            field_html_id:'txn_status',
            hide_field : data.txnType != 'TRANSFER'
          },
          {
            field_name:'Transfer To Account',
            field_value: data.transferTo?.id!,
            field_html_id:'txn_status',
            hide_field : data.txnType != 'TRANSFER'
          },
          {
            field_name:'Balance After Transaction',
            field_value: '₹ ' + data.accBalance!,
            field_html_id:'txn_status',
          },
          {
            field_name:'Remarks',
            field_value: data.comment!,
            field_html_id:'txn_status',
          },
        ]
      }
    ];
  }
  protected override prepareDefaultButtons(data: TransactionDetail, options?: { [key: string]: any; }): AccordionButton[] {
    return [];
  }
  override handlePageEvent($event: PageEvent): void {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.accountService.fetchTransactions(this.route.snapshot.params['id'],this.pageNumber,this.pageSize).subscribe(s => {
      this.transactionList = s!;
      this.setContent(this.transactionList.content!,this.transactionList?.totalSize!)
    })
  }

  onClick($event: { buttonId: string; rowIndex: number; }) {
  }

  accordionOpened($event: { rowIndex: number; }) {
  }

}
