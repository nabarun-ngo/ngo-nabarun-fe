import { Component, OnInit, inject } from '@angular/core';
// import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { getGreetings } from 'src/app/core/service/utilities.service';
import { TileInfo } from 'src/app/shared/components/generic/item-tile-list/tile-info.model';

@Component({
  selector: 'app-secured-dashboard',
  templateUrl: './secured-dashboard.component.html',
  styleUrls: ['./secured-dashboard.component.scss']
})
export class SecuredDashboardComponent implements OnInit {
  protected route = AppRoute;
  greetings!: string;
  tileList!: TileInfo[];
  constructor(
    private identityService: UserIdentityService,
    private sharedDataService: SharedDataService,
  ) { }

  ngOnInit(): void {
    let user = this.identityService.getUser();
    this.greetings = getGreetings(user.given_name || user.nickname || user.name);
    this.sharedDataService.setPageName("WELCOME TO NABARUN'S SECURED DASHBOARD");

    this.tileList = [
      {
        tile_html_id: 'donationTile',
        tile_name: 'Donations',
        tile_icon: 'icon_rupee',
        tile_link: this.route.secured_donation_dashboard_page.url,
        additional_info: {
          tile_label: 'Pending donations',
          tile_show_badge: true,
          tile_is_loading: true
        }
      },
      {
        tile_html_id: 'memberTile',
        tile_name: 'Members',
        tile_icon: 'icon_group',
        tile_link: this.route.secured_member_members_page.url,
        additional_info: {
          tile_label: 'Active Members',
          tile_show_badge: true,
          tile_is_loading: true
        }
      },
      {
        tile_html_id: 'accountTile',
        tile_name: 'Accounting',
        tile_icon: 'icon_book',
        tile_link:  this.route.secured_account_list_page.url,
        additional_info: {
          tile_label: 'Available amount',
          tile_show_badge: true,
          tile_is_loading: true
        }
      },
      {
        tile_html_id: 'requestTile',
        tile_name: 'My Requests',
        tile_icon: 'icon_presentation',
        tile_link: this.route.secured_request_list_page.url,
        additional_info: {
          tile_label: 'Pending request',
          tile_show_badge: true,
          tile_is_loading: true
        }
      },
      {
        tile_html_id: 'worklistTile',
        tile_name: 'My Worklist',
        tile_icon: 'icon_group',
        tile_link: this.route.secured_task_list_page.url,
        additional_info: {
          tile_label: 'Pending work',
          tile_show_badge: true,
          tile_is_loading: true
        }
      },
      {
        tile_html_id: 'noticeTile',
        tile_name: 'Notices',
        tile_icon: 'icon_group',
        tile_link: this.route.secured_notice_notices_page.url,
        additional_info: {
          tile_label: 'New Notice',
          tile_show_badge: true,
          tile_is_loading: true
        }
      },
      {
        tile_html_id: 'adminTile',
        tile_name: 'Admin Console',
        tile_icon: 'icon_group',
        tile_link: this.route.secured_admin_dashboard_page.url,
        additional_info:{
          tile_is_loading:false,
          tile_label:'Admin',
          tile_value:'0',
          tile_show_badge:false
        }
      }
    ];
  }

}
