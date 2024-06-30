import { EventEmitter, Inject, Injectable, NgZone, OnInit, Output } from '@angular/core';
import { AuthConfig, EventType, OAuthErrorEvent, OAuthEvent, OAuthService, OAuthSuccessEvent, ReceivedTokens } from 'angular-oauth2-oidc';
import { AuthUser } from '../model/auth-user.model';
import { filter, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AppRoute } from '../constant/app-routing.const';
import { BnNgIdleService } from 'bn-ng-idle';

export type LoginType = 'email' | 'password' | 'sms';
export type AuthEventType = 'login_success' | 'login_error';

@Injectable({
  providedIn: 'root'
})
export class UserIdentityService implements OnInit {

  constructor(
    private oAuthService: OAuthService, 
    private router: Router,
    private bnIdle: BnNgIdleService,

  ) { }


  ngOnInit(): void {
  }




  onEvent(...event_codes: EventType[]) {
    return this.oAuthService.events
      .pipe(filter(data => {
        console.log(data, event_codes)
        return event_codes.length == 0 || event_codes.includes(data.type)
      }))
      .pipe(map(data => {
        let response: { status: string; event: EventType; error: { type: string; description: string;state?:string } | undefined, params?: any };
        console.log(data)
        if (data instanceof OAuthErrorEvent) {

          let error_data = (data as OAuthErrorEvent).params as { error: string; error_description: string,state:string };
          response = {
            status: 'error',
            event: data.type,
            error: {
              type: error_data.error,
              description: error_data.error_description,
              state:error_data.state
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

  configure() {
    //console.log(environment.auth_config)
    this.oAuthService.configure(environment.auth_config);
    this.oAuthService.setupAutomaticSilentRefresh({}, 'access_token');
    this.oAuthService.setupAutomaticSilentRefresh({}, 'id_token');
    this.oAuthService.loadDiscoveryDocumentAndTryLogin().catch((err: OAuthErrorEvent) => {
      this.onCallback();
      let data = err.params as { error: string, error_description: string ,state:string};
      this.router.navigate([AppRoute.login_page.url], { state: { isError: true, description: data.error + ' : ' + data.error_description,state:data.state } });
    });
 /**
     * configuring idle timeout
     */
 this.bnIdle.startWatching(environment.inactivityTimeOut).subscribe((isTimedOut: boolean) => {
  if (isTimedOut) {
    console.warn('session expired due to inactivity');
    //if(this.isUserLoggedIn()){
     // this.notificationService.deleteToken();
    //}
    this.logout();
  }
});
  }


  onCallback() {
    //Browser.close();
    // if(environment.mobile){
    //   Browser.close();
    // }
  }

  loginWith(loginType: LoginType, prompt?: string) {
    let params: { connection?: string; prompt?: string } = {};
    if (prompt) {
      params.prompt = prompt;
    }
    if (loginType == 'email') {
      params.connection = 'email';
      this.oAuthService.initCodeFlow('', params);
    } if (loginType == 'sms') {
      params.connection = 'sms';
      this.oAuthService.initCodeFlow('', params);
    } else {
      this.oAuthService.initCodeFlow('', params);
    }
  }

  logout() {
    this.oAuthService.revokeTokenAndLogout({
      returnTo: window.location.origin,
      client_id: environment.auth_config.clientId
    });
  }

  isUserLoggedIn() {
    return this.oAuthService.hasValidAccessToken() && this.oAuthService.hasValidIdToken();
  }

  isAccrediatedTo(access: string): boolean {
    let scopes = this.oAuthService.getGrantedScopes() as string[];
    var result = scopes.includes(access);
    console.log('Has ' + access + ' access = ', result);
    return result;
  }

  isAccrediatedToAny(...access: string[]): boolean {
    var result: boolean[] = [];
    access.forEach(scope => {
      result.push(this.isAccrediatedTo(scope));
    });
    return result.includes(true);
  }

  getUser(): AuthUser {
    return this.oAuthService.getIdentityClaims() as AuthUser;
  }




}
