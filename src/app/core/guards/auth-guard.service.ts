import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserIdentityService } from '../service/user-identity.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService  {

  constructor(
    private identityService: UserIdentityService,
    private router: Router,

    ) {
    
  }
  canActivate(): boolean {     
    if (this.identityService.isUserLoggedIn()) {
      return true;
    }else{
      this.router.navigate(['']);
      return false;
    }
  
  }
}
