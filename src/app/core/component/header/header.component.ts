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
      //this.notifications.unshift(new AppNotification(data));
      //console.log(data)
      this.sound();
      if(data['notificationCount']){
        this.notificationCount=data['notificationCount'];
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
