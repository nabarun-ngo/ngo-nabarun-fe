import { Component, OnInit, ViewChild } from '@angular/core';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { TransactionDefaultValue } from '../account.const';
import { ActivatedRoute } from '@angular/router';
import {
  PaginateTransactionDetail,
} from 'src/app/core/api/models';
import { AccountService } from '../account.service';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { transactionSearchInput } from '../transaction.field';
import { StandardDashboard } from 'src/app/shared/utils/standard-dashboard';
import { TransactionAccordionComponent } from './transaction-accordion/transaction-accordion.component';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';

@Component({
  selector: 'app-account-transaction',
  templateUrl: './account-transaction.component.html',
  styleUrls: ['./account-transaction.component.scss'],
})
export class AccountTransactionComponent
  extends StandardDashboard<PaginateTransactionDetail>
  implements OnInit {

  @ViewChild(TransactionAccordionComponent) txnAccordion!: TransactionAccordionComponent;

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Accounts',
      routerLink: AppRoute.secured_account_list_page.url,
    }
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;
  protected accountId!: string;
  protected isSelfAccount!: boolean;


  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute  ) {
    super(route);
  }

  protected override onInitHook(): void {
    this.sharedDataService.setPageName(TransactionDefaultValue.pageTitle);
    this.searchInput=transactionSearchInput(this.refData!);
  }

  protected override onHandleRouteDataHook(): void {
    this.accountId = atob(this.route.snapshot.params['id']);
    this.isSelfAccount = this.route.snapshot.queryParams['self'] == 'Y';
  }

  onSearch($event: SearchEvent) {
    this.txnAccordion.performSearch($event);
  }

}
