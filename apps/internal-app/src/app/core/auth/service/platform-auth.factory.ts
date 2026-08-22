/** Binds PlatformAuthService to WebAuthService (Auth0) in CoreModule. */

import { Injector, Provider } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { PlatformAuthService, WebAuthService } from './platform-auth.service';

export function platformAuthFactory(injector: Injector, router: Router): PlatformAuthService {
  return new WebAuthService(injector.get(AuthService), router);
}

export const PLATFORM_AUTH_PROVIDER: Provider = {
  provide: PlatformAuthService,
  useFactory: platformAuthFactory,
  deps: [Injector, Router],
};
