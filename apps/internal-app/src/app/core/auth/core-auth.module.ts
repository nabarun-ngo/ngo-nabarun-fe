import { NgModule, Provider } from '@angular/core';
import { AuthModule as Auth0Module } from '@auth0/auth0-angular';
import {
  AUTH_CONFIG,
  AuthConfig,
  PlatformAuthService,
  RBAC_DATA_SOURCE,
  USER_IDENTITY,
  UserIdentityService as PackageUserIdentityService,
} from '@nabarun-ngo/auth-angular';
import { BYPASS_AUTH, environment } from '../../../environments/environment';
import { AppRoute } from '../constant/app-routing.const';
import { DevModeService } from '../dev-mode/dev-mode.service';
import { PLATFORM_AUTH_PROVIDER } from './service/platform-auth.factory';
import { RbacApiService } from './service/rbac-api.service';
import { UserIdentityService } from './service/user-identity.service';
import { IUserIdentityService } from './tokens/user-identity.token';

/** Platform auth, RBAC, and identity bindings — reads BYPASS_AUTH once here. */
function provideAuth(): Provider[] {
  if (BYPASS_AUTH) {
    return [
      DevModeService,
      { provide: PlatformAuthService, useExisting: DevModeService },
      { provide: RBAC_DATA_SOURCE, useExisting: DevModeService },
      { provide: IUserIdentityService, useExisting: DevModeService },
      { provide: PackageUserIdentityService, useExisting: DevModeService },
      { provide: USER_IDENTITY, useExisting: DevModeService },
    ];
  }

  return [
    UserIdentityService,
    PLATFORM_AUTH_PROVIDER,
    { provide: RBAC_DATA_SOURCE, useExisting: RbacApiService },
    { provide: IUserIdentityService, useExisting: UserIdentityService },
    { provide: PackageUserIdentityService, useExisting: UserIdentityService },
    { provide: USER_IDENTITY, useExisting: UserIdentityService },
  ];
}

@NgModule({
  imports: BYPASS_AUTH ? [] : [Auth0Module.forRoot(environment.auth_config)],
  providers: [
    ...provideAuth(),
    {
      provide: AUTH_CONFIG,
      useValue: {
        loginUrl: AppRoute.login_page.url,
        postLoginUrl: AppRoute.secured_dashboard_page.url,
      } satisfies AuthConfig,
    },
  ],
})
export class CoreAuthModule { }
