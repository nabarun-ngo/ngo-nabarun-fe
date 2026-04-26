import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';
import { AppRoute } from '../constant/app-routing.const';
import { LoginType } from './user-identity.service';
import { Observable } from 'rxjs';

export function platformAuthFactory(auth: AuthService, router: Router, zone: NgZone) {
  if (Capacitor.isNativePlatform()) {
    return new MobileAuthService(auth, router, zone);
  }
  return new WebAuthService(auth, router);
}

/**
 * Interface abstraction for Auth Handler
 * Depending on the active platform, it seamlessly routes the web or native behavior.
 */
@Injectable({
  providedIn: 'root',
  useFactory: platformAuthFactory,
  deps: [AuthService, Router, NgZone]
})
export abstract class PlatformAuthService {
  constructor(protected auth: AuthService) { }

  public get isAuthenticated$(): Observable<boolean> {
    return this.auth.isAuthenticated$;
  }

  public get user$(): Observable<any> {
    return this.auth.user$;
  }

  public getAccessTokenSilently(): Observable<string> {
    return this.auth.getAccessTokenSilently();
  }

  abstract initialize(): void;
  abstract loginWith(loginType: LoginType, prompt?: string, redirectUrl?: string): void;
  abstract logout(): void;
}

@Injectable()
export class WebAuthService extends PlatformAuthService {
  private config = environment.auth_config;
  constructor(auth: AuthService, private router: Router) {
    super(auth);
  }

  public initialize() {
    const app_url = new URL(window.location.href);
    if (app_url.searchParams.has("state") && app_url.searchParams.has("code")) {
      this.auth.handleRedirectCallback().subscribe(data => {
        this.router.navigate([data.appState?.target || '/']);
      });
    }

    this.auth.error$.subscribe(d => {
      this.router.navigate([AppRoute.login_page.url], {
        state: { isError: true, description: d.name + ' : ' + d.message, state: app_url.searchParams.get("state") }
      });
    });
  }

  public loginWith(loginType: LoginType, prompt?: string, redirectUrl?: string) {
    let params: { connection?: string; prompt?: string } = {};
    if (prompt) {
      params.prompt = prompt;
    }
    let return_url = redirectUrl ? redirectUrl : AppRoute.secured_dashboard_page.url;

    const authParams: any = {
      prompt: params.prompt as any,
      redirect_uri: window.location.origin
    };

    if (loginType == 'email' || loginType == 'sms') {
      authParams.connection = loginType;
    }

    this.auth.loginWithRedirect({
      appState: { target: return_url },
      authorizationParams: authParams
    });
  }

  public logout() {
    this.auth.logout({
      clientId: this.config.clientId,
      logoutParams: {
        returnTo: window.location.origin,
      }
    });
  }
}

@Injectable()
export class MobileAuthService extends PlatformAuthService {
  private config = environment.mobile_auth_config;
  constructor(
    auth: AuthService,
    private router: Router,
    private zone: NgZone
  ) {
    super(auth);
  }

  public initialize() {
    App.addListener('appUrlOpen', ({ url }) => {
      this.zone.run(() => {
        if (url.includes('state') && (url.includes('code') || url.includes('error'))) {
          console.log(url);
          this.auth.handleRedirectCallback(url).subscribe((data) => {
            this.router.navigate([data.appState?.target || '/']);
          });
        }
      });
    });

    this.auth.error$.subscribe(d => {
      this.router.navigate([AppRoute.login_page.url], {
        state: { isError: true, description: d.name + ' : ' + d.message }
      });
    });
  }

  public loginWith(loginType: LoginType, prompt?: string, redirectUrl?: string) {
    let params: { connection?: string; prompt?: string } = {};
    if (prompt) {
      params.prompt = prompt;
    }
    let return_url = redirectUrl ? redirectUrl : AppRoute.secured_dashboard_page.url;

    const redirect_uri = `${this.config.appId}://${this.config.domain}/capacitor/${this.config.appId}/callback`;
    const openUrl = async (url: string) => { await Browser.open({ url, windowName: '_self' }); };

    const authParams: any = {
      prompt: params.prompt as any,
      redirect_uri: redirect_uri
    };

    if (loginType == 'email' || loginType == 'sms') {
      authParams.connection = loginType;
    }

    this.auth.loginWithRedirect({
      appState: { target: return_url },
      authorizationParams: authParams,
      openUrl
    });
  }

  public logout() {
    const redirect_uri = `${this.config.appId}://${this.config.domain}/capacitor/${this.config.appId}/callback`;
    const openUrl = async (url: string) => { await Browser.open({ url, windowName: '_self' }); };

    this.auth.logout({
      clientId: this.config.clientId,
      logoutParams: {
        returnTo: redirect_uri,
      },
      openUrl
    });
  }
}
