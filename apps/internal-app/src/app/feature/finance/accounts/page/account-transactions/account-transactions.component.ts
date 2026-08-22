import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import {
  ListDashboardComponent,
  UniversalListDashboardModule,
  ULD_DOCUMENT_LIST,
  readRouteRefData,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { DocumentListComponent } from 'src/app/shared/components/document-list/document-list.component';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { AccountSummaryCardComponent } from '../../components/account-summary-card/account-summary-card.component';
import {
  createTransactionListConfig,
  type TransactionListConfig,
} from '../../config/transaction/transaction.config';
import { AccountDataSource } from '../../data/account-data.source';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';
import {
  createTransactionListContext,
  type Account,
  type AccountRefData,
  type TransactionListContext,
} from '../../domain';

@Component({
  selector: 'app-account-transactions-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
    AccountSummaryCardComponent,
  ],
  templateUrl: './account-transactions.component.html',
  styleUrls: ['./account-transactions.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
  ],
})
export class AccountTransactionsComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly data = inject(AccountDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly accountsBackLink = AppRoute.secured_account_list_page.url;
  protected readonly refData = readRouteRefData(this.route) as AccountRefData;
  protected readonly routeContext: TransactionListContext = createTransactionListContext({
    accountId: atob(this.route.snapshot.paramMap.get('id') ?? ''),
    isSelf: this.route.snapshot.queryParamMap.get('self') !== 'N',
  });
  protected readonly config: TransactionListConfig = createTransactionListConfig({
    data: this.data,
    context: this.routeContext,
  });

  protected account?: Account;

  constructor() {
    this.sharedData.setPageName('Transactions');
    this.data.fetchAccountById(
      this.routeContext.accountId,
      this.routeContext.isSelf,
    ).subscribe(account => {
      if (account) {
        this.account = account;
      }
    });
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Transaction action failed',
      success: 'Transaction',
    });
  }
}
