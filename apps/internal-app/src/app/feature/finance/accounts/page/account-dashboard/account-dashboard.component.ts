import { CommonModule } from '@angular/common';
import { Component, Inject, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  ListDashboardComponent,
  UniversalListDashboardModule,
  ULD_FILE_UPLOAD,
  provideListFormCustomStepRenderer,
  readRouteRefData,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { IUserIdentityService } from 'src/app/core/auth/tokens/user-identity.token';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { AccountUpiCustomStepComponent } from '../../components/account-upi-custom-step/account-upi-custom-step.component';
import {
  createAccountListConfig,
  type AccountListConfig,
} from '../../config/account/account.config';
import { ACCOUNT_DEFAULT_CHIP } from '../../config/account/account.rules';
import { AccountDataSource } from '../../data/account-data.source';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';
import {
  createAccountListContext,
  type Account,
  type AccountListContext,
  type AccountPrimaryChip,
  type AccountRefData,
} from '../../domain';

@Component({
  selector: 'app-account-list-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './account-dashboard.component.html',
  styleUrls: ['./account-dashboard.component.scss'],
  providers: [
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
    provideListFormCustomStepRenderer('upiRows', AccountUpiCustomStepComponent),
  ],
})
export class AccountDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(AccountDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  @ViewChild(ListDashboardComponent)
  private readonly listDashboard?: ListDashboardComponent<Account>;

  protected readonly financeBackLink = AppRoute.secured_finance_hub_page.url;
  protected readonly refData = readRouteRefData(this.route) as AccountRefData;
  protected readonly routeContext: AccountListContext = createAccountListContext();
  protected readonly config: AccountListConfig = createAccountListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    context: this.routeContext,
    getActiveChip: () => this.activeChip,
    getCurrentUserId: () => this.userIdentity.loggedInUserProfile?.id,
    openTransactions: (account, isSelf) => this.navigateToTransactions(account, isSelf),
  });

  constructor(
    @Inject(IUserIdentityService) private readonly userIdentity: IUserIdentityService,
  ) {
    this.sharedData.setPageName('Accounts');
  }

  protected get activeChip(): AccountPrimaryChip {
    const chip = this.listDashboard?.controller.dashboard.listPage.activeChip;
    return (chip as AccountPrimaryChip | undefined) ?? ACCOUNT_DEFAULT_CHIP;
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Account action failed',
      success: 'Account',
    });
  }

  /** After create from expense settle flow, return to that expense detail. */
  protected onAccountCreated(): void {
    const backTo = this.route.snapshot.queryParamMap.get('backTo');
    const expenseId = this.route.snapshot.queryParamMap.get('expenseId');
    if (!backTo) return;
    const tree = this.router.parseUrl(backTo);
    if (expenseId) {
      tree.queryParams = { ...tree.queryParams, expenseId };
    }
    void this.router.navigateByUrl(tree);
  }

  private navigateToTransactions(account: Account, isSelf: boolean): void {
    void this.router.navigate(
      [AppRoute.secured_account_transaction_page.url.replace(':id', btoa(account.id))],
      {
        queryParams: {
          self: isSelf ? 'Y' : 'N',
          backTo: AppRoute.secured_account_list_page.url,
          backLabel: 'Accounts',
        },
      },
    );
  }
}
