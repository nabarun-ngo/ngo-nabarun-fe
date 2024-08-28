import { Component, OnInit } from '@angular/core';
import { UserIdentityService } from '../../service/user-identity.service';
import { AuthUser } from '../../model/auth-user.model';
import { ModalService } from '../../service/modal.service';
import { AppDialog } from '../../constant/app-dialog.const';
import { AppRoute } from '../../constant/app-routing.const';
import { AppNotification } from '../../model/notification.model';
import { Router } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  protected app_route=AppRoute;
  isAuthenticated!: boolean;
  user!: AuthUser;
  //userId!:string;
  notifications:  AppNotification[]=[];
  constructor(
    private identityService: UserIdentityService,
    private modalService:ModalService,
    private commonService:CommonService,
    private router:Router,
  ) { }


  ngOnInit(): void {
    this.isAuthenticated = this.identityService.isUserLoggedIn();
    this.user=this.identityService.getUser();
    this.commonService.fetchNotification().subscribe(data=>{
      this.notifications=[];
      data?.content?.forEach(d=>{
        this.notifications.push(new AppNotification(d));
      })
    })
    this.commonService.requestPermission();
    this.commonService.liveNotifications$.subscribe(data=>{
      var sound = new Howl({
        src: ['sound.mp3']
      });
      
      sound.play();
      this.notifications.unshift(new AppNotification(data));
      console.log(data)
    });
    
      // data?.content?.forEach(f=>{
      //   this.notifications.push(new AppNotification(f));
      // })
    //});

  }

  logout() {
    this.modalService.openNotificationModal(AppDialog.logout_dialog,'confirmation','warning').onAccept$.subscribe(data=>{
      this.identityService.logout();
    })
  }

  sound(){
    //this.commonService.sound.play();
    //console.log('hi hello');
  }

  profile() {
    this.router.navigateByUrl(this.app_route.secured_member_my_profile_page.url)
  }

}
