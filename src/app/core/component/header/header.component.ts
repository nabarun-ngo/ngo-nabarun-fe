import { Component, OnInit } from '@angular/core';
import { UserIdentityService } from '../../service/user-identity.service';
import { AuthUser } from '../../model/auth-user.model';
import { ModalService } from '../../service/modal.service';
import { AppDialog } from '../../constant/app-dialog.const';
import { AppRoute } from '../../constant/app-routing.const';
import { AppNotification } from '../../model/notification.model';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import {Howl, Howler} from 'howler';
import { SpinnerVisibilityService } from 'ng-http-loader';
import { SecuredDashboardComponent } from 'src/app/feature/dashboard/secured-dashboard/secured-dashboard.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  protected app_route=AppRoute;
  //isAuthenticated!: boolean;
  user!: AuthUser;
  //userId!:string;
  //notifications:  AppNotification[]=[];
  notificationCount:string='0';
  constructor(
    private identityService: UserIdentityService,
    private modalService:ModalService,
    private commonService:CommonService,

  ) { }


  async ngOnInit(): Promise<void> {
    //this.isAuthenticated = this.identityService.isUserLoggedIn();
    this.user=await this.identityService.getUser();
    // this.commonService.fetchNotification().subscribe(data=>{
    //   this.notifications=[];
    //   data?.content?.forEach(d=>{
    //     this.notifications.push(new AppNotification(d));
    //   })
    // })
    this.commonService.requestPermission();
    this.commonService.liveNotifications$.subscribe(data=>{
      if(data){
        this.sound();
        if(data && data['notificationCount']){
          this.notificationCount=data['notificationCount'];
        }
        console.log(data)
        
        if (data && data['needActionAccount']) {
          SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'accountTile').map(m => {
            m.additional_info!.tile_show_badge = data['needActionAccount'] == 'Y' ? true : false;
            return m;
          })
        }
        if (data && data['needActionDonation']) {
          SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'donationTile').map(m => {
            m.additional_info!.tile_show_badge = data['needActionDonation'] == 'Y' ? true : false;
            return m;
          })
        }
        if (data && data['needActionMember']) {
          SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'memberTile').map(m => {
            m.additional_info!.tile_show_badge = data['needActionMember'] == 'Y' ? true : false;
            return m;
          })
        }
  
        if (data && data['needActionNotice']) {
          SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'noticeTile').map(m => {
            m.additional_info!.tile_show_badge = data['needActionNotice'] == 'Y' ? true : false;
            return m;
          })
        }
        if (data && data['needActionRequest']) {
          SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'requestTile').map(m => {
            m.additional_info!.tile_show_badge = data['needActionRequest'] == 'Y' ? true : false;
            return m;
          })
        }
        if (data && data['needActionTask']) {
          SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'worklistTile').map(m => {
            m.additional_info!.tile_show_badge = data['needActionTask'] == 'Y' ? true : false;
            return m;
          })
        }
        
  
        if (data && data['donationAmount']) {
          SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'donationTile').map(m => {
            m.additional_info!.tile_is_loading = false;
            m.additional_info!.tile_value = data['donationAmount'];
            return m;
          });
        }
  
        if (data && data['accountAmount']) {
          SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'accountTile').map(m => {
            m.additional_info!.tile_is_loading = false;
            m.additional_info!.tile_value = data['accountAmount'];
            return m;
          });
        }
  
        if (data && data['requestCount']) {
          SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'requestTile').map(m => {
            m.additional_info!.tile_is_loading = false;
            m.additional_info!.tile_value = data['requestCount'];
            return m;
          });
        }
        if (data && data['workCount']) {
          SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'worklistTile').map(m => {
            m.additional_info!.tile_is_loading = false;
            m.additional_info!.tile_value = data['workCount'];
            return m;
          });
        }
      }else{
        SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'donationTile').map(m => {
          m.additional_info!.tile_is_loading = false;
          m.additional_info!.tile_value = '₹ 0';
          return m;
        });
        SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'accountTile').map(m => {
          m.additional_info!.tile_is_loading = false;
          m.additional_info!.tile_value = '₹ 0';
          return m;
        });
        SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'requestTile').map(m => {
          m.additional_info!.tile_is_loading = false;
          m.additional_info!.tile_value = '0';
          return m;
        });
        SecuredDashboardComponent.tileList.filter(f => f.tile_html_id == 'worklistTile').map(m => {
          m.additional_info!.tile_is_loading = false;
          m.additional_info!.tile_value = '0';
          return m;
        });
      }
      
    });
  }

  logout() {
    this.modalService.openNotificationModal(AppDialog.logout_dialog,'confirmation','warning').onAccept$.subscribe(data=>{
      this.identityService.logout();
    })
  }

  sound(){
    Howler.autoUnlock= false;
    var sound = new Howl({
      src: ['/assets/mixkit-bell-notification-933.wav'],
      preload:true,
    });
    
    sound.play();
  }

  

}
