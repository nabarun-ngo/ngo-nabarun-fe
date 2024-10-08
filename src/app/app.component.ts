import { Component, NgZone } from '@angular/core';
import { UserIdentityService } from './core/service/user-identity.service';
import { environment } from 'src/environments/environment';
import { GoogleAuthService } from './core/service/google-auth.service';
import { BnNgIdleService } from 'bn-ng-idle';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';
import config from 'capacitor.config';
import { AppRoute } from './core/constant/app-routing.const';
import { Router } from '@angular/router';
import { SharedDataService } from './core/service/shared-data.service';
import { Browser } from '@capacitor/browser';

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
    ){
 
     
  }
  async ngOnInit(): Promise<void> {
    
    /**
     * Disableing logs in production
     */
    if (environment.production) {
      if(window){
        window.console.log=function(){};
      }
    }
    /**
     * Configuring oauth services
     */
    this.identityService.configure();
    /**
     * All callback configuration
     */
    if (Capacitor.isNativePlatform()) {
      this.identityService.mobileCallback();
    }
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
    await this.googleService.initialize();
  }

}
