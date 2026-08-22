import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type {
  AppliedListFilter,
  ListRouteFilterBinding,
  RefDataMap,
} from '@nabarun-ngo/list-dashboard-angular';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { MemberListCriteria, MemberPrimaryChip, User } from '../domain';

/** Reference-data keys/name for the member (USER) domain. */
export const UserConstant = {
  refDataName: 'USER',
  refDataKey: {
    countries: 'countries',
    districts: 'districts',
    states: 'states',
    availableRoles: 'availableRoles',
    availableRoleGroups: 'availableRoleGroups',
    availablePermissions: 'availablePermissions',
    phoneCodes: 'phoneCodes',
    userGenders: 'userGenders',
    userStatuses: 'userStatuses',
    userTitles: 'userTitles',
    documentTypes: 'documentTypes',
  },
} as const;

/**
 * DMS entity-type keys preferred when listing/uploading profile documents.
 * Resolved from `documentTypes` ref data when present; otherwise used as fallbacks.
 */
export const MEMBER_DMS_ENTITY_TYPE = {
  profileDocuments: 'PROFILE_DOC',
  profilePicture: 'PROFILE',
} as const;

export type MemberDmsEntityKind = keyof typeof MEMBER_DMS_ENTITY_TYPE;

/** Prefer the named document-type key from USER ref data; fall back to the literal. */
export function resolveMemberDmsEntityType(
  refData: Record<string, KeyValue[]> | undefined,
  kind: MemberDmsEntityKind,
): string {
  const preferred = MEMBER_DMS_ENTITY_TYPE[kind];
  const types = refData?.[UserConstant.refDataKey.documentTypes];
  if (types?.some(item => item.key === preferred)) {
    return preferred;
  }
  return preferred;
}

/**
 * "Me" resolves to the signed-in member and is served outside the list API.
 * "Past" is the blocked-member list filter (status = BLOCKED) — product contract.
 */
export const MEMBER_CHIP_PRESETS: Record<MemberPrimaryChip, { status?: User['status'] }> = {
  me: {},
  active: { status: 'ACTIVE' },
  past: { status: 'BLOCKED' },
};

/** Logical IdP connection keys that can be granted via the admin API. */
export const MEMBER_GRANTABLE_CONNECTION_KEYS = ['default', 'passwordless_email'] as const;

export type MemberGrantableConnectionKey = (typeof MEMBER_GRANTABLE_CONNECTION_KEYS)[number];

/** Human-readable labels for grantable login-method (IdP connection) keys. */
export const MEMBER_CONNECTION_KEY_LABELS: Record<string, string> = {
  default: 'Password',
  passwordless_email: 'Email (passwordless)',
};

/** The primary connection key that must always remain and cannot be revoked. */
export const MEMBER_PRIMARY_CONNECTION_KEY = 'default';


export const DEFAULT_MEMBER_CHIP: MemberPrimaryChip = 'active';

export const MEMBER_LIST_PAGE_SIZE = 12;

export function normalizeMemberChipId(chipId: string | null | undefined): MemberPrimaryChip | undefined {
  if (!chipId) {
    return undefined;
  }
  if (chipId in MEMBER_CHIP_PRESETS) {
    return chipId as MemberPrimaryChip;
  }
  return undefined;
}

export function isMemberPrimaryChip(chip: string): chip is MemberPrimaryChip {
  return chip in MEMBER_CHIP_PRESETS;
}

export function cloneMemberCriteria(criteria: MemberListCriteria): MemberListCriteria {
  return {
    ...criteria,
    role: criteria.role ? [...criteria.role] : undefined,
  };
}

export function getDefaultCriteriaForChip(_chipId: MemberPrimaryChip): MemberListCriteria {
  return {};
}

export function buildMemberApiFilter(
  chipId: MemberPrimaryChip,
  criteria: MemberListCriteria = {},
  searchText?: string,
): {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  status?: User['status'];
} {
  const trimmed = searchText?.trim();
  let firstName = criteria.firstName;
  let lastName = criteria.lastName;
  let email = criteria.email;
  let phoneNumber = criteria.phoneNumber;

  if (trimmed) {
    if (trimmed.includes('@')) {
      email = email ?? trimmed;
    } else if (/^\+?\d[\d\s-]+$/.test(trimmed)) {
      phoneNumber = phoneNumber ?? trimmed;
    } else if (trimmed.includes(' ')) {
      const [first, ...rest] = trimmed.split(/\s+/);
      firstName = firstName ?? first;
      lastName = lastName ?? rest.join(' ');
    } else {
      firstName = firstName ?? trimmed;
    }
  }

  return {
    firstName: firstName || undefined,
    lastName: lastName || undefined,
    email: email || undefined,
    phoneNumber: phoneNumber || undefined,
    status: MEMBER_CHIP_PRESETS[chipId]?.status,
  };
}

function labelsForKeys(values: KeyValue[] | undefined, keys: string[] | undefined): string[] {
  if (!keys?.length || !values?.length) {
    return keys ?? [];
  }
  return keys.map(k => values.find(v => v.key === k)?.displayValue ?? k);
}

export function buildMemberAppliedFilters(
  criteria: MemberListCriteria,
  refData: RefDataMap,
): AppliedListFilter[] {
  const pills: AppliedListFilter[] = [];
  if (criteria.firstName) {
    pills.push({ id: 'firstName', label: `First name: ${criteria.firstName}` });
  }
  if (criteria.lastName) {
    pills.push({ id: 'lastName', label: `Last name: ${criteria.lastName}` });
  }
  if (criteria.email) {
    pills.push({ id: 'email', label: `Email: ${criteria.email}` });
  }
  if (criteria.phoneNumber) {
    pills.push({ id: 'phoneNumber', label: `Phone: ${criteria.phoneNumber}` });
  }
  if (criteria.role?.length) {
    pills.push({
      id: 'role',
      label: `Role: ${labelsForKeys(refData[UserConstant.refDataKey.availableRoles] as KeyValue[] | undefined, criteria.role).join(', ')}`,
    });
  }
  return pills;
}

export function removeMemberFilterById(
  criteria: MemberListCriteria,
  pillId: string,
): MemberListCriteria {
  const next = { ...criteria };
  switch (pillId) {
    case 'firstName':
      next.firstName = undefined;
      break;
    case 'lastName':
      next.lastName = undefined;
      break;
    case 'email':
      next.email = undefined;
      break;
    case 'phoneNumber':
      next.phoneNumber = undefined;
      break;
    case 'role':
      next.role = undefined;
      break;
  }
  return next;
}

export function countActiveSheetFilters(criteria: MemberListCriteria): number {
  let count = 0;
  if (criteria.firstName) count++;
  if (criteria.lastName) count++;
  if (criteria.email) count++;
  if (criteria.phoneNumber) count++;
  if (criteria.role?.length) count++;
  return count;
}

export const MEMBER_LIST_ROUTE_FILTER_BINDINGS: ListRouteFilterBinding[] = [
  { param: 'filterMemberId', criteriaKey: 'filterMemberId', type: 'string' },
  { param: 'firstName', criteriaKey: 'firstName', type: 'string' },
  { param: 'lastName', criteriaKey: 'lastName', type: 'string' },
  { param: 'email', criteriaKey: 'email', type: 'string' },
  { param: 'phoneNumber', criteriaKey: 'phoneNumber', type: 'string' },
  { param: 'role', criteriaKey: 'role', type: 'csv' },
];

export interface MemberPermissions {
  [key: string]: boolean | undefined;
  canUpdateUser: boolean;
  canReadUsers: boolean;
  canCreateUser: boolean;
  canDeleteUser: boolean;
  showCreateFab: boolean;
  canReadUserConnections: boolean;
  canCreateUserConnections: boolean;
  canDeleteUserConnections: boolean;
}

export function resolveMemberPermissions(authorization: AuthorizationService): MemberPermissions {
  const perms = authorization.effectivePermissions();
  const canCreateUser = perms.includes(SCOPE.create.users);
  return {
    canUpdateUser: perms.includes(SCOPE.update.users),
    canReadUsers: perms.includes(SCOPE.read.users),
    canCreateUser,
    canDeleteUser: perms.includes(SCOPE.delete.users),
    showCreateFab: canCreateUser,
    canReadUserConnections: perms.includes(SCOPE.read.user_connections),
    canCreateUserConnections: perms.includes(SCOPE.create.user_connections),
    canDeleteUserConnections: perms.includes(SCOPE.delete.user_connections),
  };
}
