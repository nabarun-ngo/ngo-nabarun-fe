import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { CronJobContext } from '../domain';

export function createCronJobContext(): CronJobContext {
  return { refData: {} };
}

export function resolveCronJobPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    canUpdateEntity: permissions.includes(SCOPE.update.cron),
    showCreateFab: permissions.includes(SCOPE.update.cron),
    canDelete: permissions.includes(SCOPE.update.cron),
    canRunNow: permissions.includes(SCOPE.update.cron),
  };
}
