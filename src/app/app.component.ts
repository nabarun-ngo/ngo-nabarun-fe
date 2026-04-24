import { Component, OnInit } from '@angular/core';
import { UserIdentityService } from './core/service/user-identity.service';
import { environment } from 'src/environments/environment';
import { BnNgIdleService } from 'bn-ng-idle';
import { NotificationService } from './core/service/notification/notification.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(
    private identityService: UserIdentityService,
    private bnIdle: BnNgIdleService,
    private notificationService: NotificationService
  ) { }

  async ngOnInit(): Promise<void> {
    /**
     * Disableing logs in production
     */
    if (environment.production) {
      if (window) {
        window.console.log = function () { };
      }
    }
    /**
     * Configuring App callback
     */
    await this.identityService.configure();

    try {
      /**
       * Configuring Notifications for secure logged-in users
       */
      await this.notificationService.setup();
    } catch (err) {
      console.error('[AppComponent] Notification setup failed:', err);
    }

    /**
     * configuring idle timeout
     */
    this.bnIdle.startWatching(environment.inactivityTimeOut).subscribe((isTimedOut: boolean) => {
      if (isTimedOut) {
        //console.warn('session expired due to inactivity');
        //this.identityService.logout();
        //window.close()
      }
    });
  }

}
