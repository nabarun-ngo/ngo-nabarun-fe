import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { JsonStorePermissions } from '../domain';

export function resolveJsonStorePermissions(
  authorization: AuthorizationService,
): JsonStorePermissions {
  const permissions = authorization.effectivePermissions();
  return {
    canRead: permissions.includes(SCOPE.read.json_documents),
    canCreate: permissions.includes(SCOPE.create.json_documents),
    canUpdate: permissions.includes(SCOPE.update.json_documents),
    canDelete: permissions.includes(SCOPE.delete.json_documents),
  };
}
