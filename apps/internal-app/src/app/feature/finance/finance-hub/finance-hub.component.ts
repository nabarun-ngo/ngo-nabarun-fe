import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { NavTileConfig } from 'src/app/shared/components/nav-tiles/nav-tile.model';

@Component({
  selector: 'app-finance-hub',
  templateUrl: './finance-hub.component.html',
  styleUrls: ['./finance-hub.component.scss'],
  standalone: false,
})
export class FinanceHubComponent implements OnInit {
  protected navTiles: NavTileConfig[] = [];

  constructor(
    private sharedDataService: SharedDataService,
    private authorization: AuthorizationService,
  ) {}

  ngOnInit(): void {
    this.sharedDataService.setPageName('Finance');
    this.buildTiles();
  }

  private buildTiles(): void {
    const perms = this.authorization.effectivePermissions();
    const canViewDonations = perms.includes(SCOPE.read.donations)
      || perms.includes(SCOPE.read.donation_guest)
      || perms.includes(SCOPE.read.member_donations)
      || perms.includes(SCOPE.update.donation)
      || perms.includes(SCOPE.create.donation);
    const financeBackParams = {
      backTo: AppRoute.secured_finance_hub_page.url,
      backLabel: 'Finance',
    };

    this.navTiles = [
      {
        id: 'donations',
        label: 'Donations',
        description: 'Track and manage donations',
        link: AppRoute.secured_donation_dashboard_page.url,
        queryParams: financeBackParams,
        icon: 'donations',
        hidden: !canViewDonations,
      },
      {
        id: 'donors',
        label: 'Donors',
        description: 'View and manage donor records',
        link: AppRoute.secured_donor_dashboard_page.url,
        queryParams: financeBackParams,
        icon: 'donors',
        hidden: !perms.includes(SCOPE.read.donors),
      },
      {
        id: 'accounts',
        label: 'Accounts',
        description: 'Wallet balances and accounts',
        link: AppRoute.secured_account_list_page.url,
        queryParams: financeBackParams,
        icon: 'accounts',
        hidden: !perms.includes(SCOPE.read.users),
      },
      {
        id: 'earnings',
        label: 'Earnings',
        description: 'View and record earnings',
        link: AppRoute.secured_earning_dashboard_page.url,
        queryParams: financeBackParams,
        icon: 'earnings',
        hidden: !perms.includes(SCOPE.read.earnings),
      },
      {
        id: 'expenses',
        label: 'Expenses',
        description: 'Manage and settle expenses',
        link: AppRoute.secured_manage_account_page.url,
        queryParams: financeBackParams,
        icon: 'expenses',
        hidden: !perms.includes(SCOPE.read.expenses),
      },
      {
        id: 'reports',
        label: 'Reports',
        description: 'Generate and download finance reports',
        link: AppRoute.secured_finance_reports_page.url,
        icon: 'reports',
        hidden: !perms.includes(SCOPE.read.reports),
      },
    ];
  }
}
