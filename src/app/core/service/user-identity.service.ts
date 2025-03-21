import { EventEmitter, Inject, Injectable, NgZone, OnInit, Output } from '@angular/core';
import { AuthUser } from '../model/auth-user.model';
import { filter, firstValueFrom, map } from 'rxjs';
import { Router } from '@angular/router';
import { AppRoute } from '../constant/app-routing.const';
import { App } from '@capacitor/app';
import config from 'capacitor.config';
import { Browser } from '@capacitor/browser';
import { SharedDataService } from './shared-data.service';
import { AuthService, IdToken, User } from '@auth0/auth0-angular';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { jwtDecode } from 'jwt-decode';

export type LoginType = 'email' | 'password' | 'sms';
export type AuthEventType = 'login_success' | 'login_error';

@Injectable({
  providedIn: 'root'
})
export class UserIdentityService {
  isLoggedIn!: boolean;
  loggedInUser!: AuthUser;
  grantedScopes: string[]=[];
  profileUpdated!: boolean;


  constructor(
    private oAuthService: AuthService,
    private router: Router,
    private zone: NgZone,
    private sharedDataService: SharedDataService,
  ) {
    this.oAuthService.isAuthenticated$.subscribe(data=>{
      console.log(data)
      return this.isLoggedIn=data;
    });
    this.oAuthService.user$.pipe(map(m=> m as AuthUser)).subscribe(data=>{
      this.loggedInUser=data;
      console.log(data)
    });
    this.oAuthService.getAccessTokenSilently().subscribe((claims: string) => {
      if (claims && claims) {
        const decodedToken = jwtDecode(claims) as any;
        this.grantedScopes=decodedToken['permissions'] as string[];
        console.log(this.grantedScopes)
      }
    });
  }

  configure() {
    if(Capacitor.isNativePlatform()){
      App.addListener('appUrlOpen',  ({ url }) => {
        const app_url= new URL(url);
        console.log(app_url)
         this.zone.run(() => {
          if (url.startsWith(`${config.appId}://`)) {
            if (app_url.searchParams.has("state") && app_url.searchParams.has("code")) {
              this.oAuthService.handleRedirectCallback(url).subscribe(data=>{
                this.router.navigate([data.appState?.target]);
              })
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
    const app_url= new URL(window.location.href);
    if (app_url.searchParams.has("state") && app_url.searchParams.has("code")) {
      this.oAuthService.handleRedirectCallback().subscribe(data=>{
        this.router.navigate([data.appState?.target]);
      })
    }
    this.oAuthService.error$.subscribe(d=>{
      this.router.navigate([AppRoute.login_page.url], { state: { isError: true, description:d.name+' : '+d.message, state: app_url.searchParams.get("state") } });
    })

  }




  loginWith(loginType: LoginType, prompt?: string, redirectUrl?: string) {
    let params: { connection?: string; prompt?: string } = {};
    if (prompt) {
      params.prompt = prompt;
    }
    console.log(loginType)
    let return_url = redirectUrl ? redirectUrl : AppRoute.secured_dashboard_page.url;
    if (loginType == 'email') {
      params.connection = 'email';
      //this.oAuthService.initCodeFlow(additionalState, params);
      this.oAuthService.loginWithRedirect({
        appState: {
          target: return_url
        },
        authorizationParams: {
           connection: 'email',
           prompt:params.prompt as any
        },
        async openUrl(url) {
          if(Capacitor.isNativePlatform()){
            await Browser.open({url:url , windowName:'_self'})
          }else{
            window.location.href=url
          }
        },
      });
    } else if (loginType == 'sms') {
      params.connection = 'sms';
      this.oAuthService.loginWithRedirect({
        appState: {
          target: return_url
        },
        authorizationParams: {
          connection: 'sms',
          prompt:params.prompt as any
        },
        async openUrl(url) {
          if(Capacitor.isNativePlatform()){
            await Browser.open({url:url , windowName:'_self'})
          }else{
            window.location.href=url
          }
        },
      });
    } else {
      //this.oAuthService.initCodeFlow(additionalState, params);
      this.oAuthService.loginWithRedirect({
        appState: {
          target: return_url
        },
        authorizationParams:{
          prompt:params.prompt as any
        },
        async openUrl(url) {
          if(Capacitor.isNativePlatform()){
            await Browser.open({url:url , windowName:'_self'})
          }else{
            window.location.href=url
          }
        },
      });
    }
  }

  logout() {
    // this.oAuthService.revokeTokenAndLogout({
    //   returnTo: window.location.origin,
    //   client_id: environment.auth_config.clientId
    // });
    this.oAuthService.logout({
      clientId:environment.auth_config.clientId,
      logoutParams:{
        returnTo: window.location.origin,
      },
      async openUrl(url) {
        if(Capacitor.isNativePlatform()){
          await Browser.open({url:url , windowName:'_self'})
        }else{
          window.location.href=url
        }
      },
    })
  }

  // async isUserLoggedIn(): Promise<boolean> {
  //   return await firstValueFrom(this.oAuthService.isAuthenticated$);
  // }
  async isUserLoggedIn() {
    return await firstValueFrom(this.oAuthService.isAuthenticated$);
  }

  isAccrediatedTo(access: string): boolean {
    let scopes = this.grantedScopes;
    var result = scopes.includes(access);
    console.log('Has ' + access + ' access = ', result);
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
    return await firstValueFrom(this.oAuthService.user$.pipe(map(m=> m as AuthUser)))
  }

  async isProfileUpdated(){
    return this.profileUpdated || (await this.getUser()).profile_updated;
  }
  // getUser(): AuthUser {
  //   return this.loggedInUser || {};
  // }


  // async onCallback() {
  //   console.log("I am callback")
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
    // console.log("Before Login " + this.oAuthService.state)
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
