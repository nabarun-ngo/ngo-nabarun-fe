import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';

export function resolveApiKeyPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    canUpdateEntity: permissions.includes(SCOPE.update.apikey),
    showCreateFab: permissions.includes(SCOPE.create.apikey),
    canRevoke: permissions.includes(SCOPE.delete.apikey),
  };
}
