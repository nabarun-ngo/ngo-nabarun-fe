import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserIdentityService } from '../service/user-identity.service';

@Injectable({
  providedIn: 'root'
})
export class NoAuthGuardService  {

  constructor(private identityService: UserIdentityService,
    private router: Router,
  ) { }
  canActivate(): boolean {

    if (this.identityService.isUserLoggedIn()) {
      this.router.navigate(['secured', 'dashboard']);
      return false;
    }
    return true;
  }
}
