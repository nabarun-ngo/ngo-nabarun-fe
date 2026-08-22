import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  ListDashboardComponent,
  UniversalListDashboardModule,
  ULD_DOCUMENT_LIST,
  ULD_FILE_UPLOAD,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import type { FormValues } from '@nabarun-ngo/forms-core';
import type { RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import {
  catchError,
  filter,
  forkJoin,
  map,
  of,
  Subscription,
  switchMap,
  take,
  takeUntil,
  timer,
} from 'rxjs';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { DocumentListComponent } from 'src/app/shared/components/document-list/document-list.component';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import {
  claimHttpError,
  handleListNotification,
  notifyFeatureError,
} from 'src/app/shared/utils/http-error.util';
import {
  createOAuthTokenListConfig,
  type OAuthTokenListConfig,
} from '../config/oauth-token.config';
import { OAuthTokenDataSource } from '../data/oauth-token-data.source';
import type { AdminOAuthAccount, AdminOAuthToken, OAuthAuthorizationStarted } from '../domain';

@Component({
  selector: 'app-oauth-token-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './oauth-token-dashboard.component.html',
  styleUrls: ['./oauth-token-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
  ],
})
export class OAuthTokenDashboardComponent implements OnInit, OnDestroy {
  @ViewChild(ListDashboardComponent) private dashboard?: ListDashboardComponent<AdminOAuthToken>;

  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(OAuthTokenDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);
  private pollSubscription?: Subscription;
  private countdownHandle?: ReturnType<typeof setInterval>;
  private statusClearHandle?: ReturnType<typeof setTimeout>;
  private providers: string[] = [];

  protected readonly adminBackLink = AppRoute.secured_admin_hub_page.url;
  protected config?: OAuthTokenListConfig;
  protected refData: RefDataMap = { providers: [], scopes: [], accountsByProvider: {} };
  protected authorizationStatus?: 'waiting' | 'success' | 'timeout';
  protected remainingSeconds = 300;
  protected nextCheckSeconds = 30;

  constructor() {
    this.sharedData.setPageName('OAuth connections');
  }

  ngOnInit(): void {
    this.data.listProviders().subscribe({
      next: providers => {
        if (!providers.length) {
          this.notify('OAuth connections', 'No OAuth providers are configured.', 'error');
          return;
        }
        this.providers = providers;
        this.refData = {
          providers: providers.map(provider => ({ key: provider, label: this.providerLabel(provider) })),
          scopes: [],
          scopesLoading: true,
          accountsByProvider: {},
        };
        this.config = createOAuthTokenListConfig({
          data: this.data,
          authorization: this.authorization,
          modal: this.modal,
          providers,
          onProviderSelected: (provider, values) => this.loadScopes(provider, values),
          onMutation: () => {
            this.reloadList();
            this.loadAccounts(this.providers);
          },
        });
        this.loadScopes(providers[0], { provider: providers[0], scopes: [] });
        this.loadAccounts(providers);
      },
      error: err => notifyFeatureError(this.modal, err, {
        title: 'Unable to load OAuth providers',
        description: err?.message ?? 'Try again later.',
      }),
    });
  }

  ngOnDestroy(): void {
    this.stopPolling();
    if (this.statusClearHandle) clearTimeout(this.statusClearHandle);
  }

  protected onAuthorizationStarted(result: unknown): void {
    const started = result as OAuthAuthorizationStarted | undefined;
    if (!started?.provider || !started.initiatedAt) return;
    this.startPolling(started);
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Action failed',
      success: 'OAuth connections',
    });
  }

  private loadScopes(provider: string, values: FormValues): void {
    this.refData = { ...this.refData, scopes: [], scopesLoading: true };
    this.data.listScopes(provider).subscribe({
      next: scopes => {
        this.refData = {
          ...this.refData,
          scopes: scopes.map(scope => ({ key: scope, label: scope })),
          scopesLoading: false,
          oauthCreateValues: values,
        };
      },
      error: err => {
        this.refData = { ...this.refData, scopes: [], scopesLoading: false };
        notifyFeatureError(this.modal, err, {
          title: 'Unable to load scopes',
          description: err?.message ?? `Could not load ${provider} scopes.`,
        });
      },
    });
  }

  private loadAccounts(providers: string[]): void {
    if (!providers.length) return;
    const requests = Object.fromEntries(
      providers.map(provider => [
        provider,
        this.data.listAccounts(provider).pipe(catchError(() => of([] as AdminOAuthAccount[]))),
      ]),
    );
    forkJoin(requests).subscribe(accountsByProvider => {
      this.refData = {
        ...this.refData,
        accountsByProvider,
      };
    });
  }

  private startPolling(started: OAuthAuthorizationStarted): void {
    this.stopPolling();
    if (this.statusClearHandle) clearTimeout(this.statusClearHandle);
    this.authorizationStatus = 'waiting';
    this.remainingSeconds = 300;
    this.nextCheckSeconds = 30;
    const startedAtMs = new Date(started.initiatedAt).getTime();
    const countdownStartedAt = Date.now();

    this.countdownHandle = setInterval(() => {
      const elapsed = Math.floor((Date.now() - countdownStartedAt) / 1000);
      this.remainingSeconds = Math.max(0, 300 - elapsed);
      this.nextCheckSeconds = elapsed < 30
        ? 30 - elapsed
        : 10 - ((elapsed - 30) % 10);
    }, 1000);

    this.pollSubscription = timer(30_000, 10_000).pipe(
      takeUntil(timer(300_000)),
      switchMap(() => this.data.listTokens(started.provider, 0, 100).pipe(
        catchError(() => of({ items: [], totalSize: 0 })),
      )),
      map(page => page.items.some(token => new Date(token.updatedAt).getTime() >= startedAtMs)),
      filter(Boolean),
      take(1),
    ).subscribe({
      next: () => {
        this.authorizationStatus = 'success';
        this.stopPolling(false);
        this.reloadList();
        this.loadAccounts(this.providers);
        this.statusClearHandle = setTimeout(() => {
          this.authorizationStatus = undefined;
        }, 5000);
      },
      complete: () => {
        if (this.authorizationStatus !== 'waiting') return;
        this.authorizationStatus = 'timeout';
        this.stopPolling(false);
      },
    });
  }

  private stopPolling(clearStatus = true): void {
    this.pollSubscription?.unsubscribe();
    this.pollSubscription = undefined;
    if (this.countdownHandle) clearInterval(this.countdownHandle);
    this.countdownHandle = undefined;
    if (clearStatus) this.authorizationStatus = undefined;
  }

  private reloadList(): void {
    this.dashboard?.controller.dashboard.listPage.reloadList();
  }

  private providerLabel(provider: string): string {
    return provider.charAt(0).toUpperCase() + provider.slice(1);
  }

  private notify(title: string, description: string, type: 'success' | 'error', error?: unknown): void {
    if (type === 'error') {
      claimHttpError(error);
    }
    this.modal.openNotificationModal({ title, description }, 'notification', type);
  }
}
