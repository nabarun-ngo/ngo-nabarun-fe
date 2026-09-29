import { Component, Inject, OnInit, inject } from '@angular/core';
import { IUserIdentityService } from './core/auth/tokens/user-identity.token';
import { INotificationService } from './core/shell/tokens/notification.token';
import { environment } from 'src/environments/environment';
import { IdleTimeoutService } from './shared/services/idle-timeout.service';
import { RouteHttpBusyService } from './core/shell/service/route-http-busy.service';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <app-loader *ngIf="routeBusy$ | async"></app-loader>
    `,
  standalone: false
})
export class AppComponent implements OnInit {
  /** Route-scoped HTTP only — never raised by in-component loads. */
  protected readonly routeBusy$ = inject(RouteHttpBusyService).busy$;

  constructor(
    @Inject(IUserIdentityService) private identityService: IUserIdentityService,
    private idleTimeout: IdleTimeoutService,
    @Inject(INotificationService) private notificationService: INotificationService,
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
     * Automatic logout on inactivity is intentionally not enabled yet; the
     * watcher is wired so it can be turned on without re-plumbing.
     */
    this.idleTimeout.startWatching(environment.inactivityTimeOut).subscribe(() => { });
  }

}
