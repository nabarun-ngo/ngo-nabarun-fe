import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SharedDataService } from '../../../core/service/shared-data.service';
import { Subscription, takeWhile } from 'rxjs';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

@Component({
  selector: 'app-login-callback',
  template: '',
})
export class LoginCallbackComponent implements OnInit, OnDestroy {
  subs!: Subscription;

  constructor(
    private identityService: UserIdentityService,
    private sharedDataService: SharedDataService,
    private router: Router
  ) {

  }
  ngOnDestroy(): void {
    //console.log("destroyed")
    //this.subs.unsubscribe();
  }


  ngOnInit(): void {
    //console.log("iniit")
  //   this.subs = this.identityService.onEvent('code_error', 'token_received').subscribe(data => {
  //     if (data.event == 'token_received') {
  //       this.identityService.onCallback();
  //       this.sharedDataService.setAuthenticated(this.identityService.isUserLoggedIn());
  //       //console.log("heloo test")
  //       this.router.navigateByUrl(AppRoute.secured_dashboard_page.url);
  //     } else if (data.event == 'code_error') {
  //       this.identityService.onCallback();
  //       this.router.navigate([AppRoute.login_page.url], { state: { isError: true, description: data.error?.type + ' : ' + data.error?.description, state: data.error?.state } });
  //     }
  //   })
   }


}
