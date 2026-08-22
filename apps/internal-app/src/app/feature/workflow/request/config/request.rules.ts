import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { AppliedListFilter, ChipFilter } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type {
  RequestFilterCriteria,
  RequestListContext,
  RequestListScope,
  RequestPrimaryChip,
  RequestRefData,
  WorkflowRequest,
} from '../domain';
import { requestStatus } from '../domain';

export const REQUEST_DEFAULT_CHIP: RequestPrimaryChip = 'my_requests';

export const REQUEST_CHIPS: ChipFilter[] = [
  { id: 'my_requests', label: 'My requests' },
  { id: 'request_inbox', label: 'Request inbox' },
  { id: 'started_by_me', label: 'Started by me' },
];

export function createRequestContext(options: {
  refData: RequestRefData;
  currentUserId?: string;
}): RequestListContext {
  return {
    refData: options.refData,
    activeChip: REQUEST_DEFAULT_CHIP,
    currentUserId: options.currentUserId,
    memberOptions: [],
    members: [],
    startFormsByDefinitionId: {},
  };
}

export function isRequestPrimaryChip(chip: string): chip is RequestPrimaryChip {
  return REQUEST_CHIPS.some(item => item.id === chip);
}

export function normalizeRequestChip(value?: string | null): RequestPrimaryChip {
  if (value === 'claimed_by_me') return 'started_by_me';
  return value && isRequestPrimaryChip(value) ? value : REQUEST_DEFAULT_CHIP;
}

export function cloneRequestCriteria(criteria: RequestFilterCriteria): RequestFilterCriteria {
  return {
    ...criteria,
    status: criteria.status ? [...criteria.status] : undefined,
    definitionId: criteria.definitionId ? [...criteria.definitionId] : undefined,
  };
}

export function getDefaultCriteriaForChip(_chip: RequestPrimaryChip): RequestFilterCriteria {
  return {};
}

export function chipToListScope(chip: RequestPrimaryChip): RequestListScope {
  if (chip === 'request_inbox') return 'inbox';
  if (chip === 'started_by_me') return 'started';
  return 'mine';
}

/**
 * Each list answers a different question, so each offers its own actions:
 * my requests is for tracking and withdrawing, the inbox is for deciding and
 * picking work up, and started by me is for finishing work already owned.
 */
export function isMyRequestsChip(activeChip?: string): boolean {
  return normalizeRequestChip(activeChip) === 'my_requests';
}

export function isRequestInboxChip(activeChip?: string): boolean {
  return normalizeRequestChip(activeChip) === 'request_inbox';
}

export function isStartedByMeChip(activeChip?: string): boolean {
  return normalizeRequestChip(activeChip) === 'started_by_me';
}

export function buildRequestAppliedFilters(
  criteria: RequestFilterCriteria,
): AppliedListFilter[] {
  const pills: AppliedListFilter[] = [];
  if (criteria.requestId) {
    pills.push({ id: 'requestId', label: `ID: ${criteria.requestId}` });
  }
  if (criteria.definitionId?.length) {
    pills.push({ id: 'definitionId', label: `Type: ${criteria.definitionId.join(', ')}` });
  }
  if (criteria.status?.length) {
    pills.push({ id: 'status', label: `Status: ${criteria.status.join(', ')}` });
  }
  return pills;
}

export function removeRequestFilterById(
  criteria: RequestFilterCriteria,
  pillId: string,
): RequestFilterCriteria {
  const next = { ...criteria };
  if (pillId === 'requestId') next.requestId = undefined;
  if (pillId === 'definitionId') next.definitionId = undefined;
  if (pillId === 'status') next.status = undefined;
  return next;
}

export function countActiveRequestSheetFilters(criteria: RequestFilterCriteria): number {
  return [
    criteria.requestId,
    criteria.definitionId?.length,
    criteria.status?.length,
  ].filter(Boolean).length;
}

export function resolveRequestPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    showCreateFab: permissions.includes(SCOPE.create.requests),
    canUpdateEntity: permissions.includes(SCOPE.update.requests),
    canWithdraw: permissions.includes(SCOPE.update.requests)
      || permissions.includes(SCOPE.create.requests),
  };
}

/** Initiator view only, and only while the request has not been started. */
export function canWithdrawRequest(
  request: WorkflowRequest | undefined,
  currentUserId: string | undefined,
  permissions: Record<string, boolean | undefined>,
  activeChip?: string,
): boolean {
  if (!isMyRequestsChip(activeChip)) return false;
  if (!request) return false;
  const status = requestStatus(request);
  if (status !== 'PendingForApproval' && status !== 'YetToStart') return false;
  const isInitiator = !!currentUserId && request.initiatedById === currentUserId;
  return !!permissions['canWithdraw'] && (isInitiator || !!permissions['canUpdateEntity']);
}

export function canStartWorkRequest(
  request: WorkflowRequest | undefined,
  permissions: Record<string, boolean | undefined>,
  activeChip?: string,
): boolean {
  if (!isRequestInboxChip(activeChip)) return false;
  return !!permissions['canUpdateEntity']
    && !!request
    && requestStatus(request) === 'YetToStart';
}

/** Routing hint for inbox work, so it stays available whatever the inbox row is. */
export function canAssignRequest(
  request: WorkflowRequest | undefined,
  permissions: Record<string, boolean | undefined>,
  activeChip?: string,
): boolean {
  if (!isRequestInboxChip(activeChip)) return false;
  if (!permissions['canUpdateEntity'] || !request) return false;
  const status = requestStatus(request);
  return status === 'PendingForApproval' || status === 'YetToStart';
}

export function canReassignRequest(
  request: WorkflowRequest | undefined,
  permissions: Record<string, boolean | undefined>,
  activeChip?: string,
): boolean {
  if (!isStartedByMeChip(activeChip)) return false;
  if (!permissions['canUpdateEntity'] || !request) return false;
  return requestStatus(request) === 'InProgress';
}

/** Started-by-me list already means owned work; show Complete for any In Progress row. */
export function canCloseRequest(
  request: WorkflowRequest | undefined,
  _currentUserId: string | undefined,
  activeChip?: string,
  permissions?: Record<string, boolean | undefined>,
): boolean {
  if (!isStartedByMeChip(activeChip)) return false;
  if (permissions && !permissions['canUpdateEntity']) return false;
  return !!request && requestStatus(request) === 'InProgress';
}

export function canDecideRequest(
  request: WorkflowRequest | undefined,
  activeChip?: string,
): boolean {
  if (!isRequestInboxChip(activeChip)) return false;
  return !!request
    && requestStatus(request) === 'PendingForApproval'
    && !!request.needApproval;
}

export function toMemberFieldOptions(
  members: { id: string; fullName: string; email: string }[],
): FieldOption[] {
  return members.map(member => ({
    key: member.id,
    label: member.fullName || member.email || member.id,
  }));
}
