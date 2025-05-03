import { Component, OnInit } from '@angular/core';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { TransactionDefaultValue } from '../account.const';
import { ActivatedRoute } from '@angular/router';
import {
  KeyValue,
  PaginateTransactionDetail,
  TransactionDetail,
  TransactionDetailFilter,
} from 'src/app/core/api/models';
import { Accordion } from 'src/app/shared/utils/accordion';
import { PageEvent } from '@angular/material/paginator';
import {
  AccordionCell,
  AccordionButton,
} from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { FormGroup } from '@angular/forms';
import { date, removeNullFields } from 'src/app/core/service/utilities.service';
import { AccountService } from '../account.service';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';

@Component({
  selector: 'app-account-transaction',
  templateUrl: './account-transaction.component.html',
  styleUrls: ['./account-transaction.component.scss'],
})
export class AccountTransactionComponent
  extends Accordion<TransactionDetail>
  implements OnInit
{
  defaultValue = TransactionDefaultValue;
  refData: { [name: string]: KeyValue[] } | undefined;
  transactionList!: PaginateTransactionDetail;
  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Accounts',
      routerLink: AppRoute.secured_account_list_page.url,
    },
  ];
  searchInput!: SearchAndAdvancedSearchModel;
  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {
    super();
    super.init(
      this.defaultValue.pageNumber,
      this.defaultValue.pageSize,
      this.defaultValue.pageSizeOptions
    );
  }

  ngOnInit(): void {
    this.sharedDataService.setPageName(this.defaultValue.pageTitle);
    console.log(this.route.snapshot);
    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('TRANSACTION', this.refData!);
      this.setRefData(this.refData);
    }
    this.setAccordionHeader();

    if (this.route.snapshot.data['data']) {
      this.transactionList = this.route.snapshot.data[
        'data'
      ] as PaginateTransactionDetail;
      this.setContent(
        this.transactionList.content!,
        this.transactionList?.totalSize!
      );
    }

    this.searchInput = {
      normalSearchPlaceHolder:
        'Search for anything related to transactions here',
      advancedSearch: {
        searchFormFields: [
          {
            formControlName: 'txnId',
            inputModel: {
              tagName: 'input',
              inputType: 'text',
              html_id: 'txnNo',
              labelName: 'Transaction Number',
              placeholder: 'Enter Transaction Number',
            },
          },
          {
            formControlName: 'txnType',
            inputModel: {
              tagName: 'select',
              inputType: 'multiselect',
              html_id: 'txnType',
              labelName: 'Transaction Type',
              placeholder: 'Select Transaction Type',
              selectList: [
                { key: 'IN', displayValue: 'IN' },
                { key: 'OUT', displayValue: 'OUT' },
                { key: 'TRANSFER', displayValue: 'Transfer' },
              ],
            },
          },
          {
            formControlName: 'txnRefType',
            inputModel: {
              tagName: 'select',
              inputType: 'multiselect',
              html_id: 'txnType',
              labelName: 'Transaction Type',
              placeholder: 'Select Transaction Type',
              selectList: this.refData!['transactionRefTypes'],
            },
          },
          {
            formControlName: 'txnRefId',
            inputModel: {
              tagName: 'input',
              inputType: 'text',
              html_id: 'txnRef',
              labelName: 'Transaction Reference Id',
              placeholder: 'Enter Transaction Reference Id',
            },
          },
          {
            formControlName: 'startDate',
            inputModel: {
              tagName: 'input',
              inputType: 'date',
              html_id: 'txnStartDate',
              labelName: 'Start Date',
              placeholder: 'Select Start Date',
            },
          },
          {
            formControlName: 'endDate',
            inputModel: {
              tagName: 'input',
              inputType: 'date',
              html_id: 'txnEndDate',
              labelName: 'End Date',
              placeholder: 'Select End Date',
            },
          },
        ],
      },
    };
  }

  setAccordionHeader() {
    this.setHeaderRow([
      {
        value: 'Transaction Id',
        rounded: true,
      },
      {
        value: 'Transaction Amount',
        rounded: true,
      },
      {
        value: 'Transaction Type',
        rounded: true,
      },
      {
        value: 'Transaction Date',
        rounded: true,
      },
    ]);
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
      {
        section_form: new FormGroup({}),
        section_name: 'Transaction Detail',
        section_type: 'key_value',
        section_html_id: 'txn_det',
        content: [
          {
            field_name: 'Transaction Number',
            field_value: data.txnId!,
            field_html_id: 'txn_id',
          },
          {
            field_name: 'Transaction Type',
            field_value: data.txnType!,
            field_html_id: 'txn_type',
          },
          {
            field_name: 'Transaction Particulars',
            field_value: data.txnParticulars!,
            field_html_id: 'txn_type',
          },
          {
            field_name: 'Transaction Description',
            field_value: data.txnDescription!,
            field_html_id: 'txn_status',
          },
          {
            field_name: 'Transaction Amount',
            field_value: '₹ ' + data.txnAmount!,
            field_html_id: 'txn_amt',
          },
          {
            field_name: 'Transaction Date',
            field_value: date(data.txnDate!),
            field_html_id: 'txn_status',
          },
          {
            field_name: 'Transaction Status',
            field_value: data.txnStatus!,
            field_html_id: 'txn_status',
          },
          {
            field_name: 'Transaction Ref Id',
            field_value: data.txnRefId!,
            field_html_id: 'txn_status',
            hide_field: !data.txnRefId,
          },
          {
            field_name: 'Transaction Ref Type',
            field_value: data.txnRefType!,
            field_html_id: 'txn_status',
            hide_field: !data.txnRefType,
          },
          {
            field_name: 'Transfer From Account',
            field_value: data.transferFrom?.id!,
            field_html_id: 'txn_status',
            hide_field: data.txnType != 'TRANSFER',
          },
          {
            field_name: 'Transfer To Account',
            field_value: data.transferTo?.id!,
            field_html_id: 'txn_status',
            hide_field: data.txnType != 'TRANSFER',
          },
          {
            field_name: 'Balance After Transaction',
            field_value: '₹ ' + data.accBalance!,
            field_html_id: 'txn_status',
          },
          {
            field_name: 'Remarks',
            field_value: data.comment!,
            field_html_id: 'txn_status',
          },
        ],
      },
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
    this.fetchDetails();
  }

  onClick($event: { buttonId: string; rowIndex: number }) {}

  onAccordionOpen($event: { rowIndex: number }) {}

  onSearch($event: { advancedSearch: boolean; reset: boolean; value: any }) {
    if ($event.advancedSearch && !$event.reset) {
      console.log($event.value);
      let id = atob(this.route.snapshot.params['id']);
      if (this.route.snapshot.queryParams['self'] == 'Y') {
        this.accountService
          .fetchMyTransactions(id, undefined,undefined,removeNullFields($event.value))
          .subscribe((data) => {
            this.transactionList = data!;
            this.setContent(
              this.transactionList.content!,
              this.transactionList?.totalSize!
            );
          });
      } else {
        this.accountService
          .fetchTransactions(id, undefined,undefined,removeNullFields($event.value))
          .subscribe((data) => {
            this.transactionList = data!;
            this.setContent(
              this.transactionList.content!,
              this.transactionList?.totalSize!
            );
          });
      }
    } else if ($event.advancedSearch && $event.reset) {
      this.fetchDetails();
    } else {
      //console.log( $event.value)
      this.getAccordionList().searchValue = $event.value as string;
    }
  }
  fetchDetails() {
    let id = atob(this.route.snapshot.params['id']);
    if (this.route.snapshot.queryParams['self'] == 'Y') {
      this.accountService
        .fetchMyTransactions(id, this.pageNumber, this.pageSize)
        .subscribe((data) => {
          this.transactionList = data!;
          this.setContent(
            this.transactionList.content!,
            this.transactionList?.totalSize!
          );
        });
    } else {
      this.accountService
        .fetchTransactions(id, this.pageNumber, this.pageSize)
        .subscribe((data) => {
          this.transactionList = data!;
          this.setContent(
            this.transactionList.content!,
            this.transactionList?.totalSize!
          );
        });
    }
  }
}
