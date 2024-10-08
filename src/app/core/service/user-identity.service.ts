import { EventEmitter, Inject, Injectable, NgZone, OnInit, Output } from '@angular/core';
import { AuthConfig, EventType, OAuthErrorEvent, OAuthEvent, OAuthService, OAuthSuccessEvent, ReceivedTokens } from 'angular-oauth2-oidc';
import { AuthUser } from '../model/auth-user.model';
import { filter, map } from 'rxjs';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { AppRoute } from '../constant/app-routing.const';
import { App } from '@capacitor/app';
import config from 'capacitor.config';
import { Browser } from '@capacitor/browser';
import { SharedDataService } from './shared-data.service';

export type LoginType = 'email' | 'password' | 'sms';
export type AuthEventType = 'login_success' | 'login_error';

@Injectable({
  providedIn: 'root'
})
export class UserIdentityService implements OnInit {

  constructor(
    private oAuthService: OAuthService,
    private router: Router,
    private zone: NgZone,
    private sharedDataService: SharedDataService,
  ) {
  }


  ngOnInit(): void {
  }


  mobileCallback() {
    App.addListener('appUrlOpen',  ({ url }) => {
     
      const app_url= new URL(url);
      console.log(app_url)
       this.zone.run(() => {
        if (url.startsWith(`${config.appId}://`)) {
          console.log("App callback ")
          if (app_url.searchParams.has("state") && app_url.searchParams.has("code")) {
            console.log("App callback inside ") 
            let code= app_url.searchParams.get("code");
            this.oAuthService.tryLoginCodeFlow().then(d=>console.log(d))
            // .then(d=>{
            //   console.log(d)
            //   this.sharedDataService.setAuthenticated(this.isUserLoggedIn());
            //   this.router.navigateByUrl(AppRoute.secured_dashboard_page.url);
            // }).catch(err=>{
            //   console.log(err)
            // })
          } else if(app_url.searchParams.has("state") && app_url.searchParams.has("error")){
            Browser.close();
            let description = app_url.searchParams.get("error") + ' : ' + app_url.searchParams.get("error_description");
            this.router.navigate([AppRoute.login_page.url], { state: { isError: true, description:description, state: app_url.searchParams.get("state") } });
          }else {
            Browser.close();
            let description = 'Some unknown error occured.';
            this.router.navigate([AppRoute.login_page.url], { state: { isError: true, description:description, state: app_url.searchParams.get("state") } });
          }
        }
      })
    });
  }

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

  configure() {
    this.oAuthService.configure(environment.auth_config);
    this.oAuthService.setupAutomaticSilentRefresh({}, 'access_token');
    this.oAuthService.setupAutomaticSilentRefresh({}, 'id_token');
    console.log("Before Login " + this.oAuthService.state)
    this.oAuthService.loadDiscoveryDocumentAndTryLogin().then(data => {
      if (this.oAuthService.state) {
        this.router.navigateByUrl(decodeURIComponent(this.oAuthService.state));
      }
    }).catch((err: OAuthErrorEvent) => {
      this.onCallback();
      let data = err.params as { error: string, error_description: string, state: string };
      this.router.navigate([AppRoute.login_page.url], { state: { isError: true, description: data.error + ' : ' + data.error_description, state: data.state } });
    });


  }


  async onCallback() {
    console.log("I am callback")
    // if (Capacitor.isNativePlatform()) {
    //   await Browser.close();
    // }
  }

  loginWith(loginType: LoginType, prompt?: string, redirectUrl?: string) {
    let params: { connection?: string; prompt?: string } = {};
    if (prompt) {
      params.prompt = prompt;
    }
    let additionalState = redirectUrl ? redirectUrl : '';
    if (loginType == 'email') {
      params.connection = 'email';
      this.oAuthService.initCodeFlow(additionalState, params);
    } if (loginType == 'sms') {
      params.connection = 'sms';
      this.oAuthService.initCodeFlow(additionalState, params);
    } else {
      this.oAuthService.initCodeFlow(additionalState, params);
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
