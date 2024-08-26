import { Component, NgZone } from '@angular/core';
import { UserIdentityService } from './core/service/user-identity.service';
import { environment } from 'src/environments/environment';
import { GoogleAuthService } from './core/service/google-auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private identityService:UserIdentityService,
    private googleService: GoogleAuthService,
   // private zone: NgZone
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
    await this.googleService.initialize();
  }

}
