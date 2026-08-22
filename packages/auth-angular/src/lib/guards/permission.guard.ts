import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { RbacContext } from '@nabarun-ngo/auth-core';
import { AuthorizationService } from '../services/authorization.service';
import { AUTH_CONFIG } from '../tokens/auth-config.token';

export interface PermissionGuardOptions {
  context?: RbacContext;
  requireAll?: boolean;
}

/** Route guard factory — waits for RBAC load then checks permissions. */
export function permissionGuard(
  required: string | string[],
  options?: PermissionGuardOptions,
) {
  const permissions = Array.isArray(required) ? required : [required];

  return async (): Promise<boolean> => {
    const authorization = inject(AuthorizationService);
    const router = inject(Router);
    const config = inject(AUTH_CONFIG);

    await authorization.waitUntilLoaded();

    const check = (p: string) =>
      authorization.effectivePermissions(options?.context).includes(p);

    const allowed = options?.requireAll
      ? permissions.every(check)
      : permissions.some(check);

    if (allowed) {
      return true;
    }

    router.navigateByUrl(config.postLoginUrl);
    return false;
  };
}
