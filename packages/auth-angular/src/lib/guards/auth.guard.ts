import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserIdentityService } from '../services/user-identity.service';
import { AUTH_CONFIG } from '../tokens/auth-config.token';

export { permissionGuard, PermissionGuardOptions } from './permission.guard';

/**
 * Redirects unauthenticated users to `AuthConfig.loginUrl`.
 * Preserves the originally requested URL in router state as `redirect_to`.
 * No bypass logic — apps that need a dev bypass should wrap this guard.
 */
export async function authGuard(): Promise<boolean> {
  const identityService = inject(UserIdentityService);
  const router = inject(Router);
  const config = inject(AUTH_CONFIG);

  if (await identityService.isUserLoggedIn()) {
    return true;
  }

  const request_uri = window.location.pathname + window.location.search;
  const redirect_to = request_uri !== '/' ? request_uri : undefined;
  if (redirect_to) {
    router.navigate([config.loginUrl], { state: { redirect_to } });
  } else {
    router.navigate([config.loginUrl]);
  }
  return false;
}

/**
 * Redirects already-authenticated users to `AuthConfig.postLoginUrl`.
 * No bypass logic — apps that need a dev bypass should wrap this guard.
 */
export async function noAuthGuard(): Promise<boolean> {
  const identityService = inject(UserIdentityService);
  const router = inject(Router);
  const config = inject(AUTH_CONFIG);

  if (await identityService.isUserLoggedIn()) {
    router.navigateByUrl(config.postLoginUrl);
    return false;
  }
  return true;
}
