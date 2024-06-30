import { Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SharedDataService } from '../../../core/service/shared-data.service';
import { takeWhile } from 'rxjs';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

@Component({
  selector: 'app-login-callback',
  template: '',
})
export class LoginCallbackComponent implements OnInit {

  constructor(
    private identityService: UserIdentityService,
    private sharedDataService: SharedDataService,
    private router:Router
  ) {

  }


  ngOnInit(): void {
    this.identityService.onEvent('code_error','token_received').subscribe(data=>{
      if(data.event == 'token_received'){
        this.identityService.onCallback();
        this.sharedDataService.setAuthenticated(this.identityService.isUserLoggedIn());
        this.router.navigate(['secured', 'dashboard']);
      }else if(data.event == 'code_error'){
        this.identityService.onCallback();
        this.router.navigate([AppRoute.login_page.url],{state:{isError: true,description:data.error?.type+' : '+data.error?.description,state:data.error?.state}});
      }
    })
  }
}
