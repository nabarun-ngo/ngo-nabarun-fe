import { Component, OnInit, inject } from '@angular/core';
// import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { BehaviorSubject } from 'rxjs';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { getGreetings } from 'src/app/core/service/utilities.service';
import { TileInfo } from 'src/app/shared/model/tile-info.model';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-secured-dashboard',
  templateUrl: './secured-dashboard.component.html',
  styleUrls: ['./secured-dashboard.component.scss'],
})
export class SecuredDashboardComponent implements OnInit {
reload() {
  // Temporary stub to prevent runtime error. Implement real reload logic as needed.
  console.warn('Dashboard reload is not yet implemented.');
}
  protected route = AppRoute;
  protected scope = SCOPE;
  greetings!: string;
  static tileList: TileInfo[]=[];
  constructor(
    private identityService: UserIdentityService,
    private sharedDataService: SharedDataService,
    private commonService: CommonService,

  ) { }

  get tiles(){return SecuredDashboardComponent.tileList;}

  secondryTileList:TileInfo[]=[
    ]

  async ngOnInit(): Promise<void> {
    let user = await this.identityService.getUser();
    if(!user.profile_updated){
      // console.log("Profile Not updated")
    }
    this.greetings = getGreetings(user.given_name || user.nickname || user.name);
    this.sharedDataService.setPageName("WELCOME TO NABARUN'S SECURED DASHBOARD");
    if(SecuredDashboardComponent.tileList.length == 0){
      SecuredDashboardComponent.tileList = [
        {
          tile_html_id: 'donationTile',
          tile_name: 'Donations',
          tile_icon: 'icon_rupee',
          tile_link: this.route.secured_donation_dashboard_page.url,
          additional_info: {
            tile_label: 'My Pending Donations',
            tile_show_badge: false,
            tile_is_loading: true
          }
        },
        {
          tile_html_id: 'accountTile',
          tile_name: 'Accounts',
          tile_icon: 'icon_book',
          tile_link: this.route.secured_account_list_page.url,
          additional_info: {
            tile_label: 'My Account Balance',
            tile_show_badge: false,
            tile_is_loading: true
          }
        },
        {
          tile_html_id: 'expenseTile',
          tile_name: 'Expense',
          tile_icon: 'icon_presentation',
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
          tile_icon: 'icon_group',
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
          tile_icon: 'icon_group',
          tile_link: this.route.secured_member_members_page.url,
        },
        {
          tile_html_id: 'requestTile',
          tile_name: 'Support Requests',
          tile_icon: 'icon_group',
          tile_link: this.route.secured_request_list_page.url,
        },
        {
          tile_html_id: 'noticeTile',
          tile_name: 'Notices',
          tile_icon: 'icon_group',
          tile_link: this.route.secured_notice_notices_page.url,
        },
        {
          tile_html_id: 'eventTile',
          tile_name: 'Social Events',
          tile_icon: 'icon_group',
          tile_link: this.route.secured_event_list_page.url,
        },
        {
          tile_html_id: 'adminTile',
          tile_name: 'Admin Console',
          tile_icon: 'icon_group',
          tile_link: this.route.secured_admin_dashboard_page.url,
        }
       
      ];
    }
   
  }

}
