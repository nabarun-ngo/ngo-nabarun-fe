import { CommonModule } from '@angular/common';
import { Component, DoCheck, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  ListDashboardComponent,
  UniversalListDashboardModule,
  ULD_DOCUMENT_LIST,
  ULD_FILE_UPLOAD,
  provideListFormCustomStepRenderer,
  readRouteRefData,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { DocumentListComponent } from 'src/app/shared/components/document-list/document-list.component';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { AccountDataSource } from '../../accounts/data/account-data.source';
import { ExpenseLineItemsCustomStepComponent } from '../components/expense-line-items-custom-step/expense-line-items-custom-step.component';
import {
  createExpenseListConfig,
  type ExpenseListConfig,
} from '../config/expense.config';
import { EXPENSE_TOP_UP_DOCUMENT_HINT } from '../config/expense.forms';
import { createExpenseContext } from '../config/expense.rules';
import { mapExpenseListRow } from '../config/expense.view';
import { ExpenseDataSource } from '../data/expense-data.source';
import type { Expense, ExpenseListContext, ExpenseRefData } from '../domain';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-expense-list-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './expense-dashboard.component.html',
  styleUrls: ['./expense-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
    provideListFormCustomStepRenderer(
      'expenseLineItems',
      ExpenseLineItemsCustomStepComponent,
    ),
  ],
})
export class ExpenseDashboardComponent implements DoCheck {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(ExpenseDataSource);
  private readonly accounts = inject(AccountDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  @ViewChild(ListDashboardComponent)
  private listDashboard?: ListDashboardComponent<
    Expense,
    import('../domain').ExpenseFilterCriteria,
    ExpenseListContext
  >;

  protected readonly financeBackLink = AppRoute.secured_finance_hub_page.url;
  protected readonly documentHint = EXPENSE_TOP_UP_DOCUMENT_HINT;
  protected readonly refData = readRouteRefData(this.route) as ExpenseRefData;
  protected readonly forEventId =
    this.route.snapshot.queryParamMap.get('activityId') ?? undefined;
  protected readonly routeContext: ExpenseListContext = createExpenseContext({
    refData: this.refData,
    defaultPayerId: this.authorization.snapshot?.userId,
    projectId: this.route.snapshot.queryParamMap.get('projectId') ?? undefined,
    activityId: this.forEventId,
  });
  protected readonly config: ExpenseListConfig = createExpenseListConfig({
    data: this.data,
    accounts: this.accounts,
    authorization: this.authorization,
    modal: this.modal,
    router: this.router,
    context: this.routeContext,
    documentUploadHint: this.documentHint,
    onExpenseUpdated: expense => this.afterExpenseUpdated(expense),
  });

  private preparedDetailId?: string;
  private preparingDetail = false;

  constructor() {
    this.sharedData.setPageName(this.routeContext.pageName);
  }

  ngDoCheck(): void {
    const controller = this.listDashboard?.controller;
    if (!controller?.initialized) return;

    const selected = controller.dashboard.detailPage.selected;
    if (!selected?.id || selected.id === this.preparedDetailId || this.preparingDetail) {
      return;
    }

    this.preparingDetail = true;
    const requestedId = selected.id;
    this.routeContext.selectedExpense = selected;
    // Force wallet reload when returning from Accounts create.
    this.routeContext.payerWallets.delete(requestedId);
    void controller.prepare('operation').then(() => {
      if (controller.dashboard.detailPage.selected?.id !== requestedId) return;
      this.preparedDetailId = requestedId;
      controller.dashboard.detailPage.openEntity(
        this.routeContext.selectedExpense ?? selected,
        { syncQuery: false },
      );
    }).catch(() => {
      this.modal.openNotificationModal({
        title: 'Expense action failed',
        description: 'Unable to prepare expense details.',
      }, 'notification', 'error');
    }).finally(() => {
      this.preparingDetail = false;
    });
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Expense action failed',
      success: 'Expense',
    });
  }

  protected readonly onEntityUpdated = (expense: Expense): void => {
    this.afterExpenseUpdated(expense);
  };

  private afterExpenseUpdated(expense: Expense): void {
    const dashboard = this.listDashboard?.controller.dashboard;
    dashboard?.listPage.updateListItem(mapExpenseListRow(expense));
    this.preparedDetailId = undefined;
    if (expense.id) {
      this.routeContext.payerWallets.delete(expense.id);
      this.routeContext.settlementRefreshKey += 1;
    }
    this.routeContext.selectedExpense = expense;
    dashboard?.detailPage.openEntity(expense);
  }
}
