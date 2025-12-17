import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { MemberService } from '../service/member.service';
import { compareObjects } from 'src/app/core/service/utilities.service';
import { OperationMode, UserConstant } from '../member.const';
import { Location } from '@angular/common';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { AlertData } from 'src/app/shared/model/alert.model';
import { AppAlert } from 'src/app/core/constant/app-alert.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { firstValueFrom } from 'rxjs';
import { UserUpdateAdminDto, UserUpdateDto } from 'src/app/core/api-client/models';
import { User } from '../models/member.model';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.component.html',
  styleUrls: ['./member-profile.component.scss']
})
export class MemberProfileComponent implements OnInit {


  member!: User;
  isSelfProfile: boolean = false;
  mode!: OperationMode;
  navigations!: NavigationButtonModel[];
  routes = AppRoute
  alertList: AlertData[] = [];
  constant = UserConstant
  isSelfCompleteProfile!: boolean;
  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private memberService: MemberService,
    protected location: Location,
    private router: Router,
    private identity: UserIdentityService,
  ) {
  }



  ngOnInit(): void {
    this.isSelfProfile = this.route.snapshot.data['self_profile'] as boolean;
    this.isSelfCompleteProfile = this.route.snapshot.data['complete_flag'] as boolean;

    if (this.route.snapshot.data['ref_data']) {
      let refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('USER', refData);
      //console.log(refData)
    }

    if (this.route.snapshot.data['data']) {
      this.member = this.route.snapshot.data['data'] as User;
    }

    if (this.isSelfCompleteProfile) {
      this.sharedDataService.setPageName('COMPLETE PROFILE');
      this.mode = 'edit_self';
      this.navigations = []
    } else if (this.isSelfProfile) {
      this.sharedDataService.setPageName('MY PROFILE');
      this.mode = 'view_self';
      this.navigations = [
        {
          displayName: 'Back to Dashboard',
          routerLink: this.routes.secured_dashboard_page.url
        }
      ]
    } else {
      this.sharedDataService.setPageName('MEMBER PROFILE');
      this.mode = 'view_admin';
      this.navigations = [
        {
          displayName: 'Back to Members',
          routerLink: this.routes.secured_member_members_page.url
        }
      ]
    }
  }

  onNavigationClick($event: NavigationButtonModel) {

  }

  async onUpdate($event: {
    actionName: "SELF_UPDATE" | "CHANGE_MODE" | 'ADMIN_UPDATE' | "CHANGE_PASSWORD";
    profile?: User | UserUpdateDto | UserUpdateAdminDto;
    mode?: OperationMode;
    id?: string;
  }) {
    if ($event.actionName == 'SELF_UPDATE' || $event.actionName == 'CHANGE_PASSWORD') {
      //let userDetail: UserDto = compareObjects($event.profile, this.member);
      // if (this.isSelfCompleteProfile) {
      //   userDetail.profileCompleted = true;
      // }
      let user = $event.profile as User;

      if (user.picture) {
        const pic = await firstValueFrom(this.memberService.uploadPicture($event.id!, user.picture));
        user.picture = pic.fileUrl;
      }

      this.memberService.updateMyProfiledetail(user).subscribe(data => {
        this.member = data!
        this.mode = 'view_self';
        this.alertList.push(AppAlert.profile_updated_self)
        if (this.isSelfCompleteProfile) {
          this.identity.profileUpdated = true;
          this.router.navigateByUrl(AppRoute.secured_dashboard_page.url);
        }
        //this.memberService.getMyDetail().subscribe(data=>this.member=data!)
      })
    } else if ($event.actionName == 'CHANGE_MODE') {
      this.mode = $event.mode!;
    } else if ($event.actionName == 'ADMIN_UPDATE') {
      this.memberService.updateProfiledetail($event?.id!, $event.profile as User).subscribe(data => {
        this.member = data!
        this.mode = 'view_admin';
        //this.memberService.getUserDetail($event.profile?.id!).subscribe(data=>this.member=data!)
      })
    }

  }
}
