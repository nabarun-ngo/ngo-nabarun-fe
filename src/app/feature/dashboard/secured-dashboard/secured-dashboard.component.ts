import { Component, OnInit } from '@angular/core';
// import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { getGreetings } from 'src/app/core/service/utilities.service';
import { TileInfo } from 'src/app/shared/model/tile-info.model';
import { DashboardService } from '../dashboard.service';
import { UserMetricsDto } from 'src/app/core/api-client/models';

@Component({
  selector: 'app-secured-dashboard',
  templateUrl: './secured-dashboard.component.html',
  styleUrls: ['./secured-dashboard.component.scss'],
})
export class SecuredDashboardComponent implements OnInit {
  protected route = AppRoute;
  protected scope = SCOPE;
  greetings!: string;
  static tileList: TileInfo[] = [];

  constructor(
    private identityService: UserIdentityService,
    private sharedDataService: SharedDataService,
    private dashboardService: DashboardService
  ) { }

  get tiles() { return SecuredDashboardComponent.tileList; }

  secondryTileList: TileInfo[] = [
  ]

  async ngOnInit(): Promise<void> {
    let user = await this.identityService.getUser();
    if (!user.profile_updated) {
      // ////console.log("Profile Not updated")
    }
    this.greetings = getGreetings(user.given_name || user.nickname || user.name);
    this.sharedDataService.setPageName("WELCOME TO NABARUN'S SECURED DASHBOARD");
    this.initTiles();
    this.fetchMetrics();
  }

  initTiles() {
    if (SecuredDashboardComponent.tileList.length == 0) {
      SecuredDashboardComponent.tileList = [
        {
          tile_html_id: 'donationTile',
          tile_name: 'Donations',
          tile_icon: 'icon_rupee',
          tile_link: this.route.secured_donation_dashboard_page.url,
          additional_info: {
            tile_label: 'My Pending Donations',
            tile_show_badge: false,
            tile_is_loading: true,
            tile_value: ''
          }
        },
        {
          tile_html_id: 'accountTile',
          tile_name: 'Accounts',
          tile_icon: 'icon_book',
          tile_link: this.route.secured_account_list_page.url,
          additional_info: {
            tile_label: 'My Wallet Balance',
            tile_show_badge: false,
            tile_is_loading: true
          }
        },
        {
          tile_html_id: 'expenseTile',
          tile_name: 'Expense',
          tile_icon: 'icon_expense',
          tile_link: this.route.secured_manage_account_page.url,
          additional_info: {
            tile_label: 'My Unsettled Expenses',
            tile_show_badge: false,
            tile_is_loading: true
          }
        },
        {
          tile_html_id: 'worklistTile',
          tile_name: 'Tasks',
          tile_icon: 'icon_tasks',
          tile_link: this.route.secured_task_list_page.url,
          additional_info: {
            tile_label: 'My Pending Tasks',
            tile_show_badge: false,
            tile_is_loading: true
          }
        },
        {
          tile_html_id: 'memberTile',
          tile_name: 'Members',
          tile_icon: 'icon_members',
          tile_link: this.route.secured_member_members_page.url,
        },
        {
          tile_html_id: 'eventTile',
          tile_name: 'Projects',
          tile_icon: 'icon_projects',
          tile_link: this.route.secured_project_list_page.url,
        },
        {
          tile_html_id: 'requestTile',
          tile_name: 'Requests',
          tile_icon: 'icon_requests',
          tile_link: this.route.secured_request_list_page.url,
        },
        {
          tile_html_id: 'noticeTile',
          tile_name: 'Meetings',
          tile_icon: 'icon_notices',
          tile_link: this.route.secured_meetings_list_page.url,
        },

        {
          tile_html_id: 'adminTile',
          tile_name: 'Admin Console',
          tile_icon: 'icon_admin',
          tile_link: this.route.secured_admin_dashboard_page.url,
          hide_tile: !this.identityService.isAccrediatedToAny(
            SCOPE.read.actuator,
            SCOPE.read.apikey,
            SCOPE.create.apikey,
            SCOPE.update.apikey,
            SCOPE.create.servicerun
          )
        }
      ];
    }
  }

  reload() {
    this.fetchMetrics();
  }

  fetchMetrics() {
    const donationTile = SecuredDashboardComponent.tileList.find(tile => tile.tile_html_id === 'donationTile');
    const accountTile = SecuredDashboardComponent.tileList.find(tile => tile.tile_html_id === 'accountTile');
    const expenseTile = SecuredDashboardComponent.tileList.find(tile => tile.tile_html_id === 'expenseTile');
    const worklistTile = SecuredDashboardComponent.tileList.find(tile => tile.tile_html_id === 'worklistTile');

    if (donationTile && donationTile.additional_info) {
      donationTile.additional_info.tile_is_loading = true;
    }
    if (accountTile && accountTile.additional_info) {
      accountTile.additional_info.tile_is_loading = true;
    }
    if (expenseTile && expenseTile.additional_info) {
      expenseTile.additional_info.tile_is_loading = true;
    }
    if (worklistTile && worklistTile.additional_info) {
      worklistTile.additional_info.tile_is_loading = true;
    }


    this.dashboardService.getUserMetrics().subscribe((metrics: UserMetricsDto) => {
      if (donationTile && donationTile.additional_info) {
        donationTile.additional_info.tile_value = metrics.pendingDonations != null ? `₹ ${metrics.pendingDonations}` : '-';
        donationTile.additional_info.tile_is_loading = false;
        donationTile.additional_info.tile_show_badge = metrics.pendingDonations > 0;
      }

      if (accountTile && accountTile.additional_info) {
        accountTile.additional_info.tile_value = metrics.walletBalance != null ? `₹ ${metrics.walletBalance}` : '-';
        accountTile.additional_info.tile_is_loading = false;
        accountTile.additional_info.tile_show_badge = metrics.walletBalance > 0;
      }

      if (expenseTile && expenseTile.additional_info) {
        expenseTile.additional_info.tile_value = metrics.unsettledExpense != null ? `₹ ${metrics.unsettledExpense}` : '-';
        expenseTile.additional_info.tile_is_loading = false;
        expenseTile.additional_info.tile_show_badge = metrics.unsettledExpense > 0;
      }

      if (worklistTile && worklistTile.additional_info) {
        worklistTile.additional_info.tile_value = metrics.pendingTask != null ? metrics.pendingTask.toString() : '-';
        worklistTile.additional_info.tile_is_loading = false;
        worklistTile.additional_info.tile_show_badge = metrics.pendingTask > 0;
      }
    });
  }


}
