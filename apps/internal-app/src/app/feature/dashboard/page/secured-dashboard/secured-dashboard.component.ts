import { Component, Inject, OnInit } from '@angular/core';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { IUserIdentityService } from 'src/app/core/auth/tokens/user-identity.token';
import { NavTileConfig } from 'src/app/shared/components/nav-tiles/nav-tile.model';
import {
  quickCreateActionToNavTile,
  resolveQuickCreateActions,
} from 'src/app/core/constant/quick-action.const';
import { buildDonationMineOutstandingRouteQuery } from 'src/app/feature/finance/donation/config/donation.rules';
import { EXPENSE_MINE_UNSETTLED_ROUTE_QUERY } from 'src/app/feature/finance/expense/config/expense.rules';
import { ACCOUNT_MINE_WALLET_ROUTE_QUERY } from 'src/app/feature/finance/accounts/config/account/account.rules';
import {
  DashboardMetricsSource,
  UserMetricsDto,
} from '../../data/dashboard-metrics.source';

@Component({
  selector: 'app-secured-dashboard',
  templateUrl: './secured-dashboard.component.html',
  styleUrls: ['./secured-dashboard.component.scss'],
  standalone: false,
})
export class SecuredDashboardComponent implements OnInit {
  protected readonly route = AppRoute;
  displayName!: string;
  quickAccessSearch = '';
  overviewTiles: NavTileConfig[] = [];
  areaTiles: NavTileConfig[] = [];
  quickActionTiles: NavTileConfig[] = [];

  constructor(
    @Inject(IUserIdentityService) private identityService: IUserIdentityService,
    private authorization: AuthorizationService,
    private sharedDataService: SharedDataService,
    @Inject(DashboardMetricsSource) private metricsSource: DashboardMetricsSource,
  ) { }

  get accessNavTiles(): NavTileConfig[] {
    const tiles = [...this.areaTiles, ...this.quickActionTiles];
    const query = this.searchQuery;
    if (!query) {
      return tiles;
    }
    return tiles.filter(tile =>
      tile.label.toLowerCase().includes(query)
    );
  }

  private get searchQuery(): string {
    return this.quickAccessSearch.trim().toLowerCase();
  }

  clearQuickAccessSearch(): void {
    this.quickAccessSearch = '';
  }

  async ngOnInit(): Promise<void> {
    this.displayName = await this.identityService.getDisplayName();
    this.sharedDataService.setPageName('Dashboard');
    this.initDashboardTiles();
    this.initQuickActions();
    this.fetchMetrics();
  }

  private initQuickActions(): void {
    this.quickActionTiles = resolveQuickCreateActions(
      this.authorization.effectivePermissions(),
    ).map(action => quickCreateActionToNavTile(action, this.dashboardBackParams));
  }

  private get dashboardBackParams(): Record<string, string> {
    return {
      backTo: this.route.secured_dashboard_page.url,
      backLabel: 'Dashboard',
    };
  }

  private initDashboardTiles(): void {
    const perms = this.authorization.effectivePermissions();
    const canViewDonations = perms.includes(SCOPE.read.donations)
      || perms.includes(SCOPE.read.donation_guest)
      || perms.includes(SCOPE.read.member_donations)
      || perms.includes(SCOPE.update.donation)
      || perms.includes(SCOPE.create.donation);

    const dashboardBackParams = this.dashboardBackParams;

    this.overviewTiles = ([
      {
        id: 'donationTile',
        label: 'Donations',
        icon: 'donations',
        link: this.route.secured_donation_dashboard_page.url,
        queryParams: {
          ...buildDonationMineOutstandingRouteQuery(),
          ...dashboardBackParams,
        },
        metric: {
          label: 'My Pending Donations',
          loading: true,
          showBadge: false,
        },
        hidden: !canViewDonations,
      },
      {
        id: 'accountTile',
        label: 'Accounts',
        icon: 'accounts',
        link: this.route.secured_account_list_page.url,
        queryParams: {
          ...ACCOUNT_MINE_WALLET_ROUTE_QUERY,
          ...dashboardBackParams,
        },
        metric: {
          label: 'My Wallet Balance',
          loading: true,
          showBadge: false,
        },
        hidden: !perms.includes(SCOPE.read.users),
      },
      {
        id: 'expenseTile',
        label: 'Expenses',
        icon: 'expenses',
        link: this.route.secured_manage_account_page.url,
        queryParams: {
          ...EXPENSE_MINE_UNSETTLED_ROUTE_QUERY,
          ...dashboardBackParams,
        },
        metric: {
          label: 'My Pending Expenses',
          loading: true,
          showBadge: false,
        },
        hidden: !perms.includes(SCOPE.read.expenses),
      },
      {
        id: 'requestTile',
        label: 'Requests',
        icon: 'icon_requests',
        link: this.route.secured_request_list_page.url,
        queryParams: {
          chip: 'request_inbox',
          ...dashboardBackParams,
        },
        metric: {
          label: 'Request Pending with Me',
          loading: true,
          showBadge: false,
        },
        hidden: !perms.includes(SCOPE.read.requests),
      },
    ] satisfies NavTileConfig[]).filter(tile => !tile.hidden);

    this.areaTiles = ([
      {
        id: 'earningTile',
        label: 'Earnings',
        icon: 'earnings',
        link: this.route.secured_earning_dashboard_page.url,
        queryParams: dashboardBackParams,
        hidden: !perms.includes(SCOPE.read.earnings),
      },
      {
        id: 'memberTile',
        label: 'Members',
        icon: 'icon_members',
        link: this.route.secured_member_members_page.url,
        queryParams: dashboardBackParams,
        hidden: !perms.includes(SCOPE.read.users),
      },
      {
        id: 'projectTile',
        label: 'Projects',
        icon: 'projects',
        link: this.route.secured_project_hub_page.url,
        queryParams: dashboardBackParams,
        hidden: !perms.includes(SCOPE.read.projects),
      },
      {
        id: 'assetsTile',
        label: 'Assets',
        icon: 'milestones',
        link: this.route.secured_assets_hub_page.url,
        queryParams: dashboardBackParams,
        hidden: !perms.includes(SCOPE.read.assets),
      },
      {
        id: 'meetingTile',
        label: 'Events & Meetings',
        icon: 'icon_meetings',
        link: this.route.secured_meetings_list_page.url,
        queryParams: dashboardBackParams,
        hidden: !perms.includes(SCOPE.read.meetings),
      },
      {
        id: 'adminTile',
        label: 'Admin Console',
        icon: 'icon_admin',
        link: this.route.secured_admin_dashboard_page.url,
        queryParams: dashboardBackParams,
        hidden: ![SCOPE.read.apikey, SCOPE.read.cron, SCOPE.read.jobs]
          .some(permission => perms.includes(permission)),
      },
      {
        id: 'helpTile',
        label: 'Help',
        icon: 'icon_help',
        link: this.route.secured_help_home_page.url,
        queryParams: dashboardBackParams,
      },
    ] satisfies NavTileConfig[]).filter(tile => !tile.hidden);
  }

  reload(): void {
    this.fetchMetrics();
    this.sharedDataService.setNotificationRefresh(true);
  }

  private fetchMetrics(): void {
    this.overviewTiles.forEach(tile => {
      if (tile.metric) {
        tile.metric.loading = true;
      }
    });

    this.metricsSource.getUserMetrics().subscribe((metrics: UserMetricsDto) => {
      this.applyMetrics(metrics ?? {});
    });
  }

  private applyMetrics(metrics: UserMetricsDto): void {
    this.updateMetric('donationTile', metrics.pendingDonations, 'currency');
    this.updateMetric('accountTile', metrics.walletBalance, 'currency');
    this.updateMetric('expenseTile', metrics.unsettledExpense, 'currency');
    this.updateMetric('requestTile', metrics.pendingTask, 'count');
  }

  private updateMetric(
    tileId: string,
    value: number | undefined,
    format: 'currency' | 'count',
  ): void {
    const metric = this.overviewTiles.find(tile => tile.id === tileId)?.metric;
    if (!metric) {
      return;
    }
    if (value == null) {
      metric.value = '—';
    } else if (format === 'currency') {
      metric.value = `₹ ${value.toLocaleString('en-IN')}`;
    } else {
      metric.value = value.toLocaleString('en-IN');
    }
    metric.loading = false;
    metric.showBadge = (value ?? 0) > 0;
  }
}
