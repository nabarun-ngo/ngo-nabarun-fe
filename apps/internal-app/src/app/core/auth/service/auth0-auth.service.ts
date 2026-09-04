import { DestroyRef, Injectable } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { LoginType, PlatformAuthService, sanitizeInternalRedirectUrl } from '@nabarun-ngo/auth-angular';
import { environment } from '../../../../environments/environment';
import { AppRoute } from '../../constant/app-routing.const';
import { map, Observable, switchMap, take } from 'rxjs';

export { PlatformAuthService } from '@nabarun-ngo/auth-angular';

/** Auth0 codes that mean "no usable session", not a failed sign-in attempt. */
const SILENT_SESSION_ERROR_CODES = new Set([
  'consent_required',
  'interaction_required',
  'login_required',
  'missing_refresh_token',
  'timeout',
]);

function isSilentSessionError(error: unknown): boolean {
  const code = (error as { error?: unknown } | null)?.error;
  return typeof code === 'string' && SILENT_SESSION_ERROR_CODES.has(code);
}

/** Replaying a consumed callback URL (reload, back button) fails the state check. */
function isStaleCallbackError(error: unknown): boolean {
  const message = (error as { message?: unknown } | null)?.message;
  return typeof message === 'string' && /invalid state/i.test(message);
}

/**
 * Auth0-backed implementation of PlatformAuthService.
 * Provided via PLATFORM_AUTH_PROVIDER in CoreAuthModule — no other file
 * should import this class directly.
 */
@Injectable()
export class Auth0AuthService extends PlatformAuthService {
  private config = environment.auth_config;

  constructor(
    protected auth: AuthService,
    private router: Router,
    private destroyRef: DestroyRef,
  ) {
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

  /**
   * The Auth0 SDK exchanges `code`/`state` on startup on its own. Calling
   * handleRedirectCallback() here as well would consume the one-time state
   * twice and fail the second exchange, so this only reacts to the outcome.
   */
  initialize(): void {
    this.auth.appState$
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((appState) => {
        const target = sanitizeInternalRedirectUrl(
          (appState as { target?: string } | undefined)?.target,
          AppRoute.secured_dashboard_page.url,
        );
        void this.router.navigateByUrl(target);
      });

    this.auth.error$
      .pipe(
        switchMap((error) =>
          this.auth.isAuthenticated$.pipe(
            take(1),
            map((isAuthenticated) => ({ error, isAuthenticated })),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ error, isAuthenticated }) => {
        if (isStaleCallbackError(error) && isAuthenticated) {
          void this.router.navigateByUrl(AppRoute.secured_dashboard_page.url);
          return;
        }

        if (isSilentSessionError(error)) {
          void this.router.navigate([AppRoute.login_page.url]);
          return;
        }

        void this.router.navigate([AppRoute.login_page.url], {
          state: {
            isError: true,
            description: `${error?.name ?? 'AuthError'} : ${error?.message ?? 'Login failed'}`,
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
