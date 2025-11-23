import { Component, NgZone } from '@angular/core';
import { UserIdentityService } from './core/service/user-identity.service';
import { environment } from 'src/environments/environment';
import { GoogleAuthService } from './core/service/google-auth.service';
import { BnNgIdleService } from 'bn-ng-idle';
import { AuthService } from '@auth0/auth0-angular';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private identityService:UserIdentityService,
    private googleService: GoogleAuthService,
    private bnIdle: BnNgIdleService,
    private authService: AuthService,
    ){  
 
     
  }
  async ngOnInit(): Promise<void> {
    console.log("Hiii")
    /**
     * Disableing logs in production
     */
    if (environment.production) {
      if(window){
        window.console.log=function(){};
      }
    }
    /**
     * Configuring App callback
     */
    this.identityService.configure();
   
    /**
     * configuring idle timeout
     */
    this.bnIdle.startWatching(environment.inactivityTimeOut).subscribe((isTimedOut: boolean) => {
      if (isTimedOut) {
        console.warn('session expired due to inactivity');
        // if(this.identityService.isUserLoggedIn()){
        // this.coomm.deleteToken();
        // }
        this.identityService.logout();
      }
    });
    //await this.googleService.initialize();
  }

}
