import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { DonationRefData as DonationRefDataKeys } from '../../finance.const';
import type {
  DonationFilterCriteria,
  DonationListContext,
  DonationPrimaryChip,
  DonationRefData,
  DonationStatusGroups,
} from '../domain';

export const DONATION_DEFAULT_CHIP: DonationPrimaryChip = 'mine';
export const DONATION_CHIPS = [
  { id: 'mine', label: 'Mine' },
  { id: 'all_outstanding', label: 'All Outstanding' },
  { id: 'all_closed', label: 'All Closed' },
] as const;

export function buildDonationMineOutstandingRouteQuery(
  refData?: DonationRefData,
): { donationStatus: string } {
  return {
    donationStatus: donationStatusGroups(refData).outstanding.join(','),
  };
}

export function createDonationContext(options: {
  refData: DonationRefData;
  forEventId?: string;
  projectLabel?: string;
}): DonationListContext {
  return {
    refData: options.refData,
    activeChip: DONATION_DEFAULT_CHIP,
    presets: { forEventId: options.forEventId, projectLabel: options.projectLabel },
    donors: [],
    donorOptions: [],
    payableAccountOptions: [],
    createOptions: {
      donors: [],
      donorOptions: [],
      typeOptionsByDonor: {},
      eventOptions: [],
      lockProjectDonation: !!options.forEventId,
    },
  };
}

export function normalizeDonationChip(value?: string | null): DonationPrimaryChip {
  if (value === 'donation_mine') return 'mine';
  if (value === 'donation_all_outstanding') return 'all_outstanding';
  if (value === 'donation_all_closed') return 'all_closed';
  return DONATION_CHIPS.some(chip => chip.id === value)
    ? value as DonationPrimaryChip
    : DONATION_DEFAULT_CHIP;
}

export function donationStatusGroups(refData?: DonationRefData): DonationStatusGroups {
  const value = refData?.[DonationRefDataKeys.refDataKey.statusGroups];
  if (value && !Array.isArray(value) && 'outstanding' in value) {
    return value as DonationStatusGroups;
  }
  return {
    outstanding: [],
    closed: [],
    excluded: [],
  };
}

export function donationStatuses(
  chip: DonationPrimaryChip,
  criteria: DonationFilterCriteria,
  refData?: DonationRefData,
): string[] | undefined {
  const groups = donationStatusGroups(refData);
  const preset = chip === 'all_outstanding'
    ? groups.outstanding
    : chip === 'all_closed' ? groups.closed : undefined;
  if (!criteria.status?.length) return preset;
  if (!preset) return criteria.status;
  const intersection = criteria.status.filter(status => preset.includes(status));
  return intersection.length ? intersection : preset;
}

export function buildDonationApiFilter(
  chip: DonationPrimaryChip,
  criteria: DonationFilterCriteria,
  searchText?: string,
  refData?: DonationRefData,
) {
  const mine = chip === 'mine';
  return {
    donationId: searchText?.trim() || criteria.donationId || undefined,
    status: donationStatuses(chip, criteria, refData),
    type: criteria.type?.length ? criteria.type : undefined,
    startDate: criteria.startDate || undefined,
    endDate: criteria.endDate || undefined,
    donorId: mine ? undefined : criteria.memberId,
    donorName: mine ? undefined : criteria.memberName,
    isGuest: !mine && criteria.guestDonor ? 'Y' as const : undefined,
    forEventId: criteria.forEventId || undefined,
  };
}

export function applyDonationProjectScope(
  criteria: DonationFilterCriteria,
  forEventId: string,
): DonationFilterCriteria {
  return { ...criteria, guestDonor: true, forEventId };
}

export function resolveDonationPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  const canCreate = permissions.includes(SCOPE.create.donation)
    || permissions.includes(SCOPE.create.donation_guest);
  return {
    showCreateFab: canCreate,
    canUpdateEntity: permissions.includes(SCOPE.update.donation),
  };
}
