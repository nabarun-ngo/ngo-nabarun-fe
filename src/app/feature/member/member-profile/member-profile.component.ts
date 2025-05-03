import { Component, EventEmitter, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { MemberService } from '../member.service';
import { KeyValue, UserDetail } from 'src/app/core/api/models';
import { compareObjects } from 'src/app/core/service/utilities.service';
import { OperationMode, UserConstant } from '../member.const';
import { Location } from '@angular/common';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/service/modal.service';
import { AlertData } from 'src/app/shared/model/alert.model';
import { AppAlert } from 'src/app/core/constant/app-alert.const';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MemberProfileModel } from './member-profile.model';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.component.html',
  styleUrls: ['./member-profile.component.scss']
})
export class MemberProfileComponent implements OnInit {


  member!: UserDetail;
  isSelfProfile: boolean = false;
  mode!: OperationMode;
  navigations!: NavigationButtonModel[];
  routes = AppRoute
  alertList: AlertData[] = [];
  matDialogData!: MemberProfileModel
  dialogClose: EventEmitter<boolean> = new EventEmitter();
  constant =UserConstant
  isSelfCompleteProfile!: boolean;
  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private memberService: MemberService,
    protected location: Location,
    private router:Router,
    private identity:UserIdentityService,
    @Inject(MAT_DIALOG_DATA) data: MemberProfileModel
  ) {
    this.matDialogData = data;
  }



  ngOnInit(): void {

    // console.log(this.input)
    if (this.matDialogData.member) {
      this.isSelfProfile = this.matDialogData.isSelfProfile as boolean;
      this.sharedDataService.setPageName(this.isSelfProfile ? 'MY PROFILE' : 'MEMBER PROFILE');
      this.mode = this.matDialogData.mode;
      this.member = this.matDialogData.member
      this.sharedDataService.setRefData(this.constant.refDataName, this.matDialogData.refData);
      this.navigations = [
        {
          displayName: 'CLOSE',
          buttonId: 'MAT_BUTTON_CLOSE'
        }
      ]
    } else {
      this.isSelfProfile = this.route.snapshot.data['self_profile'] as boolean;
      this.isSelfCompleteProfile = this.route.snapshot.data['complete_flag'] as boolean;

      if (this.route.snapshot.data['ref_data']) {
        let refData = this.route.snapshot.data['ref_data'];
        this.sharedDataService.setRefData('USER', refData);
        console.log(refData)
      }

      if (this.route.snapshot.data['data']) {
        this.member = this.route.snapshot.data['data'] as UserDetail;
      }

      if(this.isSelfCompleteProfile){
        this.sharedDataService.setPageName('COMPLETE PROFILE');
        this.mode = 'edit_self';
        this.navigations = []
      }else if(this.isSelfProfile){
        this.sharedDataService.setPageName('MY PROFILE');
        this.mode = 'view_self' ;
        this.navigations = [
          {
            displayName: 'Back to Dashboard',
            routerLink: this.routes.secured_dashboard_page.url
          }
        ]
      }else{
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




  }

  onNavigationClick($event: NavigationButtonModel) {
    if($event.buttonId == 'MAT_BUTTON_CLOSE'){
      this.dialogClose.emit(true)
    }
  }

  onUpdate($event: {
    actionName: "SELF_UPDATE" | "CHANGE_MODE" | 'ADMIN_UPDATE'| "CHANGE_PASSWORD";
    profile?: UserDetail;
    mode?: OperationMode;
  }) {
    if ($event.actionName == 'SELF_UPDATE' || $event.actionName == 'CHANGE_PASSWORD') {
      this.memberService.updateMyProfiledetail(compareObjects($event.profile, this.member)).subscribe(data => {
        this.member = data!
        this.mode = 'view_self';
        this.alertList.push(AppAlert.profile_updated_self)
        this.dialogClose.emit(true)
        if(this.isSelfCompleteProfile){
          this.identity.profileUpdated =true;
          this.router.navigateByUrl(AppRoute.secured_dashboard_page.url);
        }
        //this.memberService.getMyDetail().subscribe(data=>this.member=data!)
      })
    } else if ($event.actionName == 'CHANGE_MODE') {
      this.mode = $event.mode!;
    } else if ($event.actionName == 'ADMIN_UPDATE') {
      this.memberService.updateProfiledetail($event.profile?.id!, $event.profile!).subscribe(data => {
        this.member = data!
        this.mode = 'view_admin';
        this.dialogClose.emit(true)
        //this.memberService.getUserDetail($event.profile?.id!).subscribe(data=>this.member=data!)
      })
    }

  }
}
