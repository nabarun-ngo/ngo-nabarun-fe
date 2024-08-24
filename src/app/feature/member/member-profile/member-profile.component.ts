import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { MemberService } from '../member.service';
import { UserDetail } from 'src/app/core/api/models';
import { compareObjects } from 'src/app/core/service/utilities.service';
import { OperationMode } from '../member.const';
import { Location } from '@angular/common';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.component.html',
  styleUrls: ['./member-profile.component.scss']
})
export class MemberProfileComponent implements OnInit {

  member!: UserDetail;
  isSelfProfile: boolean = false;
  mode!: OperationMode;
  navigations!: { displayName: string; routerLink: string; }[];
  routes = AppRoute
  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private memberService: MemberService,
    protected location: Location

  ) { }



  ngOnInit(): void {
    this.isSelfProfile = this.route.snapshot.data['self_profile'] as boolean;
    this.sharedDataService.setPageName(this.isSelfProfile ? 'MY PROFILE' : 'MEMBER PROFILE');
    this.mode = this.isSelfProfile ? 'view_self' : 'view_admin';


    if (this.route.snapshot.data['ref_data']) {
      let refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('USER', refData);
      console.log(refData)
    }

    if (this.route.snapshot.data['data']) {
      this.member = this.route.snapshot.data['data'] as UserDetail;
    }
    this.navigations = [
      this.isSelfProfile ?
        {
          displayName: 'Back to Dashboard',
          routerLink: this.routes.secured_dashboard_page.url
        }
        :
        {
          displayName: 'Back to Members',
          routerLink: this.routes.secured_member_members_page.url
        }
    ]

  }

  onUpdate($event: {
    actionName: "SELF_UPDATE" | "CHANGE_MODE";
    profile?: UserDetail;
    mode?: OperationMode;
  }) {
    if ($event.actionName == 'SELF_UPDATE') {
      this.memberService.updateMyProfiledetail(compareObjects($event.profile, this.member)).subscribe(data => {
        this.member = data!
        this.mode = 'view_self';
      })
    } else if ($event.actionName == 'CHANGE_MODE') {
      this.mode = $event.mode!;
    }

  }
}
