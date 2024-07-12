import { Component, OnInit } from '@angular/core';
import { UserIdentityService } from '../../service/user-identity.service';
import { AuthUser } from '../../model/auth-user.model';
import { ModalService } from '../../service/modal.service';
import { AppDialog } from '../../constant/app-dialog.const';
import { AppRoute } from '../../constant/app-routing.const';
import { NotificationService } from '../../service/notification.service';
import { Observable } from 'rxjs';
import { AppNotification } from '../../model/notification.model';
import { Router } from '@angular/router';

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
    private notificationService:NotificationService,
    private router:Router
  ) { }


  ngOnInit(): void {
    this.isAuthenticated = this.identityService.isUserLoggedIn();
    this.user=this.identityService.getUser();
   // this.userId=this.user.profile_id;
    this.notificationService.requestPermission();
    this.notificationService.liveNotifications$.subscribe(data=>{
      this.notifications.push(new AppNotification(data));
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
    this.notificationService.sound.play();
    console.log('hi hello')
  }

  profile() {
    this.router.navigateByUrl(this.app_route.secured_member_profile_page.url.replace(':id',this.user.profile_id))
    //[routerLink]="[app_route.secured_member_profile_page.url,userId]"
  }

}
