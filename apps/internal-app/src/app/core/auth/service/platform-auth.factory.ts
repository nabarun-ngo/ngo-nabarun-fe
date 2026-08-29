/** Binds PlatformAuthService to Auth0AuthService in CoreModule. */

import { DestroyRef, Injector, Provider } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { PlatformAuthService, Auth0AuthService } from './auth0-auth.service';

export function platformAuthFactory(injector: Injector, router: Router, destroyRef: DestroyRef): PlatformAuthService {
  return new Auth0AuthService(injector.get(AuthService), router, destroyRef);
}

export const PLATFORM_AUTH_PROVIDER: Provider = {
  provide: PlatformAuthService,
  useFactory: platformAuthFactory,
  deps: [Injector, Router, DestroyRef],
};
