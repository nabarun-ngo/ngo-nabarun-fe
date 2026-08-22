import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { CustomFormPermissions } from '../domain';

export function resolveCustomFormsPermissions(
  authorization: AuthorizationService,
): CustomFormPermissions {
  const permissions = authorization.effectivePermissions();
  return {
    canRead: permissions.includes(SCOPE.read.custom_forms),
    canCreate: permissions.includes(SCOPE.create.custom_forms),
    canUpdate: permissions.includes(SCOPE.update.custom_forms),
    canDisable: permissions.includes(SCOPE.disable.custom_forms),
  };
}
