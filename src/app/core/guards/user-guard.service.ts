import { Injectable } from '@angular/core';
import { UserIdentityService } from '../service/user-identity.service';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot } from '@angular/router';
import { AppRoute } from '../constant/app-routing.const';

@Injectable({
  providedIn: 'root'
})
export class UserGuardService {

  AppRoutes= AppRoute;
  constructor(
      private identityService: UserIdentityService,
      private router: Router,
      ) {
      
    }
    async canActivate(route: ActivatedRouteSnapshot,state: RouterStateSnapshot): Promise<boolean> {   
      let isProfileUpdated =await this.identityService.isProfileUpdated();  
      console.log("Testtttttt")
      if (isProfileUpdated) {
        return true;
      }
      else if(state.url == this.AppRoutes.secured_member_complete_my_profile_page.url){
        return true;
      }
      else{
        this.router.navigateByUrl(this.AppRoutes.secured_member_complete_my_profile_page.url);     
        return false;
      }
    
    }
}
