import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserIdentityService } from '../service/user-identity.service';
import { AppRoute } from '../constant/app-routing.const';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuardService  {

  constructor(private identityService: UserIdentityService,
    private router: Router,
  ) { }
  async canActivate(): Promise<boolean>{

    if (await this.identityService.isUserLoggedIn()) {
      this.router.navigateByUrl(AppRoute.secured_dashboard_page.url);
      return false;
    }
    return true;
  }
}
