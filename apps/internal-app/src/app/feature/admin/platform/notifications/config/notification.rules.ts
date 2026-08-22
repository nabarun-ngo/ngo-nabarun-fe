import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ChipFilter } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { NotificationDeliveryStatus } from '../domain';

export function resolveNotificationPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    canUpdateEntity: false,
    showCreateFab: false,
    canResend: permissions.includes(SCOPE.update.notifications),
  };
}

export const NOTIFICATION_ALL_CHIP = 'all';

/** Audit opens on failures; succeeded and all are one tap away. */
export const NOTIFICATION_DEFAULT_CHIP = 'failed';

export const NOTIFICATION_CHIPS: ChipFilter[] = [
  { id: 'failed', label: 'Failed' },
  { id: 'succeeded', label: 'Succeeded' },
  { id: NOTIFICATION_ALL_CHIP, label: 'All' },
];

export function isValidNotificationChip(chipId: string): boolean {
  return NOTIFICATION_CHIPS.some(chip => chip.id === chipId);
}

export function normalizeNotificationChip(chipId: string | null): string {
  return chipId && isValidNotificationChip(chipId) ? chipId : NOTIFICATION_DEFAULT_CHIP;
}

/** The All chip audits every outcome, so it sends no status to the API. */
export function statusForChip(chipId: string): NotificationDeliveryStatus | undefined {
  return chipId === NOTIFICATION_ALL_CHIP ? undefined : (chipId as NotificationDeliveryStatus);
}
