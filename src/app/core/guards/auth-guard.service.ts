import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { UserIdentityService } from '../service/user-identity.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService {

  constructor(
    private identityService: UserIdentityService,
    private router: Router,

  ) {

  }
  async canActivate(): Promise<boolean> {
    if (await this.identityService.isUserLoggedIn()) {
      return true;
    } else {
      const request_uri = window.location.pathname + window.location.search;
      const redirect_to = (request_uri !== '/' ? request_uri : undefined);
      if (redirect_to) {
        ////console.log('saving requested url: ', redirect_to);
        this.router.navigate([''], {
          state: { redirect_to: redirect_to }
        });
      } else {
        this.router.navigate(['']);
      }
      return false;
    }

  }
}
