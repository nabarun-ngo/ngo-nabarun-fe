import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { LoginType, PlatformAuthService, sanitizeInternalRedirectUrl } from '@nabarun-ngo/auth-angular';
import { environment } from '../../../../environments/environment';
import { AppRoute } from '../../constant/app-routing.const';
import { Observable } from 'rxjs';

export { PlatformAuthService } from '@nabarun-ngo/auth-angular';

/**
 * Auth0-backed implementation of PlatformAuthService.
 * Provided via PLATFORM_AUTH_PROVIDER in CoreAuthModule — no other file
 * should import this class directly.
 */
@Injectable()
export class Auth0AuthService extends PlatformAuthService {
  private config = environment.auth_config;

  constructor(protected auth: AuthService, private router: Router) {
    super();
  }

  get isAuthenticated$(): Observable<boolean> {
    return this.auth.isAuthenticated$;
  }

  get user$(): Observable<any> {
    return this.auth.user$;
  }

  getAccessTokenSilently(): Observable<string> {
    return this.auth.getAccessTokenSilently();
  }

  initialize(): void {
    const app_url = new URL(window.location.href);
    if (app_url.searchParams.has('state') && app_url.searchParams.has('code')) {
      this.auth.handleRedirectCallback().subscribe((data) => {
        const target = sanitizeInternalRedirectUrl(
          data.appState?.target,
          AppRoute.secured_dashboard_page.url,
        );
        void this.router.navigateByUrl(target);
      });
    }

    this.auth.error$.subscribe((d) => {
      this.router.navigate([AppRoute.login_page.url], {
        state: {
          isError: true,
          description: d.name + ' : ' + d.message,
          state: app_url.searchParams.get('state'),
        },
      });
    });
  }

  loginWith(loginType: LoginType, prompt?: string, redirectUrl?: string): void {
    const params: { connection?: string; prompt?: string } = {};
    if (prompt) {
      params.prompt = prompt;
    }
    const return_url = sanitizeInternalRedirectUrl(
      redirectUrl,
      AppRoute.secured_dashboard_page.url,
    );

    const authParams: any = {
      prompt: params.prompt as any,
      redirect_uri: window.location.origin,
    };

    if (loginType === 'email' || loginType === 'sms') {
      authParams.connection = loginType;
    }

    this.auth.loginWithRedirect({
      appState: { target: return_url },
      authorizationParams: authParams,
    });
  }

  logout(): void {
    this.auth.logout({
      clientId: this.config.clientId,
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  }
}
