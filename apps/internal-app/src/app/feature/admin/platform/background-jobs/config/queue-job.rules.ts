import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type {
  AppliedListFilter,
  ChipFilter,
  ListRouteFilterBinding,
} from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { QueueJobListCriteria, QueueJobStatus } from '../domain';

export const QUEUE_JOB_ALL_CHIP = 'all';

export const QUEUE_JOB_CHIPS: ChipFilter[] = [
  { id: QUEUE_JOB_ALL_CHIP, label: 'All' },
  { id: 'waiting', label: 'Waiting' },
  { id: 'active', label: 'Active' },
  { id: 'delayed', label: 'Delayed' },
  { id: 'completed', label: 'Completed' },
  { id: 'failed', label: 'Failed' },
];

export const QUEUE_JOB_FILTER_BINDINGS: ListRouteFilterBinding[] = [
  { param: 'jobName', criteriaKey: 'jobName', type: 'string' },
  { param: 'queueName', criteriaKey: 'queueName', type: 'string' },
];

export function isValidQueueJobChip(chipId: string): boolean {
  return QUEUE_JOB_CHIPS.some(chip => chip.id === chipId);
}

export function normalizeQueueJobChip(chipId: string | null): string {
  return chipId && isValidQueueJobChip(chipId) ? chipId : QUEUE_JOB_ALL_CHIP;
}

/** The All chip searches every state, so it sends no status to the API. */
export function statusForChip(chipId: string): QueueJobStatus | undefined {
  return chipId === QUEUE_JOB_ALL_CHIP ? undefined : chipId as QueueJobStatus;
}

export function resolveQueueJobPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    canUpdateEntity: false,
    showCreateFab: false,
    canRetry: permissions.includes(SCOPE.update.jobs),
    canManageQueue: permissions.includes(SCOPE.update.jobs),
    canRemove: permissions.includes(SCOPE.delete.jobs),
    canClean: permissions.includes(SCOPE.delete.jobs),
  };
}

export function emptyQueueJobCriteria(): QueueJobListCriteria {
  return {};
}

export function cloneQueueJobCriteria(criteria: QueueJobListCriteria): QueueJobListCriteria {
  return { ...criteria };
}

export function buildQueueJobAppliedFilters(
  criteria: QueueJobListCriteria,
): AppliedListFilter[] {
  const filters: AppliedListFilter[] = [];
  if (criteria.jobName) {
    filters.push({ id: 'jobName', label: `Handler: ${criteria.jobName}` });
  }
  if (criteria.queueName) {
    filters.push({ id: 'queueName', label: `Queue: ${criteria.queueName}` });
  }
  return filters;
}

export function countActiveQueueJobSheetFilters(criteria: QueueJobListCriteria): number {
  return (criteria.jobName ? 1 : 0) + (criteria.queueName ? 1 : 0);
}

export function removeQueueJobFilterById(
  criteria: QueueJobListCriteria,
  pillId: string,
): QueueJobListCriteria {
  const next = cloneQueueJobCriteria(criteria);
  if (pillId === 'jobName') delete next.jobName;
  if (pillId === 'queueName') delete next.queueName;
  return next;
}
