import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { AppliedListFilter, ChipFilter } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type {
  MeetingFilterCriteria,
  MeetingListContext,
  MeetingPrimaryChip,
  MeetingRefData,
} from '../domain';

export const MEETING_DEFAULT_CHIP: MeetingPrimaryChip = 'participating';

export const MEETING_CHIPS: ChipFilter[] = [
  { id: 'participating', label: 'Participating' },
  { id: 'created_by_me', label: 'Created by me' },
];

export function createMeetingContext(options: {
  refData: MeetingRefData;
  currentUserId?: string;
}): MeetingListContext {
  return {
    refData: options.refData,
    activeChip: MEETING_DEFAULT_CHIP,
    currentUserId: options.currentUserId,
    attendeeOptions: [],
    members: [],
  };
}

export function isMeetingPrimaryChip(chip: string): chip is MeetingPrimaryChip {
  return MEETING_CHIPS.some(item => item.id === chip);
}

export function normalizeMeetingChip(value?: string | null): MeetingPrimaryChip {
  return value && isMeetingPrimaryChip(value) ? value : MEETING_DEFAULT_CHIP;
}

export function cloneMeetingCriteria(criteria: MeetingFilterCriteria): MeetingFilterCriteria {
  return { ...criteria };
}

export function getDefaultCriteriaForChip(_chip: MeetingPrimaryChip): MeetingFilterCriteria {
  return {};
}

export function buildMeetingApiFilter(
  chipId: MeetingPrimaryChip,
  criteria: MeetingFilterCriteria = {},
  searchText?: string,
  currentUserId?: string,
): {
  createdById?: string;
  participantId?: string;
  participantEmail?: string;
} {
  const participantEmail =
    (searchText?.trim() || criteria.participantEmail?.trim()) || undefined;
  const createdById = chipId === 'created_by_me'
    ? (currentUserId || criteria.createdById || undefined)
    : (criteria.createdById || undefined);

  return {
    createdById,
    // Participating relies on BE default (current user). Explicit id only when needed.
    participantId: undefined,
    participantEmail,
  };
}

export function buildMeetingAppliedFilters(
  criteria: MeetingFilterCriteria,
): AppliedListFilter[] {
  const pills: AppliedListFilter[] = [];
  if (criteria.participantEmail) {
    pills.push({
      id: 'participantEmail',
      label: `Email: ${criteria.participantEmail}`,
    });
  }
  if (criteria.createdById) {
    pills.push({
      id: 'createdById',
      label: `Created by: ${criteria.createdByName ?? criteria.createdById}`,
    });
  }
  return pills;
}

export function removeMeetingFilterById(
  criteria: MeetingFilterCriteria,
  pillId: string,
): MeetingFilterCriteria {
  const next = { ...criteria };
  if (pillId === 'participantEmail') next.participantEmail = undefined;
  if (pillId === 'createdById') {
    next.createdById = undefined;
    next.createdByName = undefined;
  }
  return next;
}

export function countActiveMeetingSheetFilters(criteria: MeetingFilterCriteria): number {
  return [criteria.participantEmail, criteria.createdById].filter(Boolean).length;
}

export function resolveMeetingPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    showCreateFab: permissions.includes(SCOPE.create.meeting),
    canUpdateEntity: permissions.includes(SCOPE.update.meeting),
  };
}

export function toAttendeeFieldOptions(
  members: { id: string; fullName: string; email: string }[],
): FieldOption[] {
  return members.map(member => ({
    key: member.id,
    label: member.fullName || member.email || member.id,
  }));
}
