import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ChipFilter, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type {
  Donor,
  DonorListCriteria,
  DonorListFilter,
  DonorPrimaryChip,
  DonorType,
} from '../domain';
import { donorStatusLabel } from './donor.forms';

export const DONOR_DEFAULT_CHIP: DonorPrimaryChip = 'guest';

export const DONOR_CHIPS: ChipFilter[] = [
  { id: 'guest', label: 'Guest' },
  { id: 'member', label: 'Member' },
];

export function isGuestChip(chipId: DonorPrimaryChip): boolean {
  return chipId === 'guest';
}

export function isMemberChip(chipId: DonorPrimaryChip): boolean {
  return chipId === 'member';
}

export function normalizeDonorChip(value?: string | null): DonorPrimaryChip {
  return value === 'guest' || value === 'member' ? value : DONOR_DEFAULT_CHIP;
}

export function isDonorPrimaryChip(chip: string): chip is DonorPrimaryChip {
  return chip === 'guest' || chip === 'member';
}

export function chipToDonorType(chipId: DonorPrimaryChip): DonorType {
  return chipId === 'guest' ? 'GUEST' : 'MEMBER';
}

export function buildDonorApiFilter(
  chipId: DonorPrimaryChip,
  criteria: DonorListCriteria | undefined,
  searchText?: string,
): DonorListFilter {
  return {
    type: chipToDonorType(chipId),
    q: searchText?.trim() || undefined,
    status: criteria?.status,
  };
}

export function buildDonorAppliedFilters(
  criteria: DonorListCriteria,
  refData: RefDataMap = {},
): AppliedListFilter[] {
  if (!criteria.status) return [];
  return [{
    id: 'status',
    label: `Status: ${donorStatusLabel(criteria.status, refData as Record<string, KeyValue[] | string[] | undefined>)}`,
  }];
}

export function removeDonorFilterById(
  criteria: DonorListCriteria,
  pillId: string,
): DonorListCriteria {
  const next = { ...criteria };
  if (pillId === 'status') next.status = undefined;
  return next;
}

export function countActiveDonorSheetFilters(criteria: DonorListCriteria): number {
  return criteria.status ? 1 : 0;
}

function normalizeName(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

function normalizeEmail(value?: string): string {
  return (value ?? '').trim().toLowerCase();
}

function normalizePhone(donor: Donor): string {
  return `${donor.phoneCode ?? ''}${donor.phoneNumber ?? ''}`.replace(/\s/g, '').toLowerCase();
}

export function guestDonorsCanMerge(first: Donor, second: Donor): boolean {
  return !guestDonorsMergeBlockReason(first, second);
}

export function guestDonorsMergeBlockReason(
  first: Donor,
  second: Donor,
): string | undefined {
  if (normalizeName(first.fullName) !== normalizeName(second.fullName)) {
    return 'Selected donors must have the same name to merge.';
  }

  const emailA = normalizeEmail(first.email);
  const emailB = normalizeEmail(second.email);
  if (emailA && emailB && emailA !== emailB) {
    return 'Selected donors must have the same email when both records include an email.';
  }

  const phoneA = normalizePhone(first);
  const phoneB = normalizePhone(second);
  if (phoneA && phoneB && phoneA !== phoneB) {
    return 'Selected donors must have the same mobile number when both records include a phone number.';
  }

  return undefined;
}

export function sameDonorSelection(
  previous: Donor[] | undefined,
  next: Donor[] | undefined,
): boolean {
  const prevIds = (previous ?? []).map(donor => donor.id).sort().join('|');
  const nextIds = (next ?? []).map(donor => donor.id).sort().join('|');
  return prevIds === nextIds;
}

export function resolveDonorPermissions(authorization: AuthorizationService) {
  const perms = authorization.effectivePermissions();
  return {
    canViewDonors: perms.includes(SCOPE.read.donors),
    canCreateGuest: perms.includes(SCOPE.create.donor_guest),
    showCreateFab: perms.includes(SCOPE.create.donor_guest),
    canUpdateGuest: perms.includes(SCOPE.update.donor_guest),
    canUpdateMember: perms.includes(SCOPE.update.donor_member),
    canMergeGuest: perms.includes(SCOPE.merge.donor_guest),
  };
}

export function validateGuestMergeSelection(
  donors: readonly Donor[],
): string | undefined {
  if (donors.length !== 2) {
    return 'Choose exactly two guest donors to merge.';
  }
  if (donors.some(donor => donor.type !== 'GUEST' || donor.status === 'DELETED')) {
    return 'Only active guest donors can be merged.';
  }
  return guestDonorsMergeBlockReason(donors[0], donors[1]);
}
