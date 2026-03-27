import { Injectable } from '@angular/core';
import { AuthUser } from '../model/auth-user.model';
import { firstValueFrom, map } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { PlatformAuthService } from './platform-auth.service';

export type LoginType = 'email' | 'password' | 'sms';
export type AuthEventType = 'login_success' | 'login_error';

@Injectable({
  providedIn: 'root'
})
export class UserIdentityService {
  isLoggedIn!: boolean;
  loggedInUser!: AuthUser;
  grantedScopes: string[] = [];
  profileUpdated!: boolean;


  constructor(
    private router: Router,
    private platformAuth: PlatformAuthService,
  ) {

  }

  async configure() {
    this.platformAuth.initialize();
    this.isLoggedIn = await this.isUserLoggedIn();
    if (this.isLoggedIn) {
      this.loggedInUser = await this.getUser();
      console.log('Logged in User ->', this.loggedInUser)
    }
    this.platformAuth.getAccessTokenSilently().subscribe((claims: string) => {
      if (claims && claims) {
        const decodedToken = jwtDecode(claims) as any;
        this.grantedScopes = decodedToken['permissions'] as string[];
        console.log('Granted Scopes ->', this.grantedScopes)
      }
    });
  }




  loginWith(loginType: LoginType, prompt?: string, redirectUrl?: string) {
    this.platformAuth.loginWith(loginType, prompt, redirectUrl);
  }

  logout() {
    this.platformAuth.logout();
  }


  async isUserLoggedIn() {
    return await firstValueFrom(this.platformAuth.isAuthenticated$);
  }

  async getAccessToken() {
    return await firstValueFrom(this.platformAuth.getAccessTokenSilently());
  }

  isAccrediatedTo(access: string): boolean {
    let scopes = this.grantedScopes;
    var result = scopes.includes(access);
    ////console.log('Has ' + access + ' access = ', result);
    return result;
  }

  isAccrediatedToAny(...access: string[]): boolean {
    var result: boolean[] = [];
    access.forEach(async (scope) => {
      result.push(this.isAccrediatedTo(scope));
    });
    return result.includes(true);
  }

  async getUser(): Promise<AuthUser> {
    return await firstValueFrom(this.platformAuth.user$.pipe(map(m => m as AuthUser)))
  }

  async isProfileUpdated() {
    return this.profileUpdated || (await this.getUser())?.profile_updated || false;
  }
  // getUser(): AuthUser {
  //   return this.loggedInUser || {};
  // }


  // async onCallback() {
  //   ////console.log("I am callback")
  //   // if (Capacitor.isNativePlatform()) {
  //   //   await Browser.close();
  //   // }
  // }

  /*
    onEvent(...event_codes: EventType[]) {
      return this.oAuthService.events
        .pipe(filter(data => {
          return event_codes.length == 0 || event_codes.includes(data.type)
        }))
        .pipe(map(data => {
          let response: { status: string; event: EventType; error: { type: string; description: string; state?: string } | undefined, params?: any };
          if (data instanceof OAuthErrorEvent) {
            let error_data = (data as OAuthErrorEvent).params as { error: string; error_description: string, state: string };
            response = {
              status: 'error',
              event: data.type,
              error: {
                type: error_data.error,
                description: error_data.error_description,
                state: error_data.state
              },
              params: (data as OAuthErrorEvent).params
            };
          } else if (data instanceof OAuthSuccessEvent) {
            response = {
              status: 'success',
              event: data.type,
              error: undefined,
              params: (data as OAuthSuccessEvent).info
            }
          } else {
            response = {
              status: 'unknown',
              event: data.type,
              error: undefined,
            }
          }
          return response;
  
        }));
    }
 // this.oAuthService.configure(environment.auth_config);
    // this.oAuthService.setupAutomaticSilentRefresh({}, 'access_token');
    // this.oAuthService.setupAutomaticSilentRefresh({}, 'id_token');
    // ////console.log("Before Login " + this.oAuthService.state)
    // this.oAuthService.loadDiscoveryDocumentAndTryLogin().then(data => {
    //   if (this.oAuthService.state) {
    //     this.router.navigateByUrl(decodeURIComponent(this.oAuthService.state));
    //   }
    // }).catch((err: OAuthErrorEvent) => {
    //   this.onCallback();
    //   let data = err.params as { error: string, error_description: string, state: string };
    //   this.router.navigate([AppRoute.login_page.url], { state: { isError: true, description: data.error + ' : ' + data.error_description, state: data.state } });
    // });

  */

}
