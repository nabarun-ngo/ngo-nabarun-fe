import type {
  ListDetailField,
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-angular';
import { KeyValue } from 'src/app/shared/models/key-value.model';
import { Doc } from 'src/app/shared/models/document.model';
import { User } from '../domain';
import { UserConstant } from './member.rules';
import {
  buildAddressViewFields,
  formatDateOfBirth,
  formatMemberDisplayName,
  formatPhoneWithWhatsappLabel,
  labelForRefKey,
  resolveWhatsappTarget,
} from './member.forms';

// ---------------------------------------------------------------------------
// List row (avatar required on every row)
// ---------------------------------------------------------------------------

function statusTone(status: User['status']): ListRowBadge['tone'] {
  switch (status) {
    case 'ACTIVE':
      return 'success';
    case 'BLOCKED':
      return 'danger';
    case 'DRAFT':
      return 'warning';
    case 'DELETED':
      return 'neutral';
    default:
      return 'neutral';
  }
}

/** Status badge: label from USER ref data when available; tone stays frontend-owned. */
export function memberStatusBadge(
  status: User['status'],
  refData?: Record<string, KeyValue[]>,
): ListRowBadge {
  const label =
    labelForRefKey(refData ?? {}, status, UserConstant.refDataKey.userStatuses) ?? status;
  return { label, tone: statusTone(status) };
}

function formatRoles(user: User): string {
  const names = user.roles
    ?.filter(r => r.roleCode !== 'MEMBER')
    .map(r => r.roleName) ?? user.roles?.map(r => r.roleName) ?? [];
  return names.length ? names.join(', ') : 'Member';
}

export function memberAvatarUrl(picture?: string): string | undefined {
  if (!picture?.trim()) {
    return undefined;
  }
  const value = picture.trim();
  if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('data:')) {
    return value;
  }
  return undefined;
}

export function memberInitials(user: User): string {
  const first = user.firstName?.trim()?.[0] ?? '';
  const last = user.lastName?.trim()?.[0] ?? '';
  const combined = `${first}${last}`.toUpperCase();
  if (combined) {
    return combined;
  }
  const fromName = user.fullName?.trim().split(/\s+/).map(part => part[0]).join('').slice(0, 2);
  return fromName?.toUpperCase() || '?';
}

/** Members list rows always carry an avatar (`avatarUrl` or `avatarInitials`). */
export function mapMemberToListRow(
  user: User,
  refData: Record<string, KeyValue[]> = {},
): ListRowItem<User> {
  const avatarUrl = memberAvatarUrl(user.picture);
  return {
    id: user.id,
    title: user.fullName || `${user.firstName} ${user.lastName}`.trim(),
    subtitle: user.email,
    metaLeft: formatRoles(user),
    metaRight: user.primaryNumber?.fullNumber ?? user.primaryNumber?.number,
    badge: memberStatusBadge(user.status, refData),
    avatarUrl,
    avatarInitials: avatarUrl ? undefined : memberInitials(user),
    payload: user,
  };
}

export function mapMembersToListRows(
  users: User[],
  refData: Record<string, KeyValue[]> = {},
): ListRowItem<User>[] {
  return users.map(user => mapMemberToListRow(user, refData));
}

export function filterMembersByRole(users: User[], roleCodes?: string[]): User[] {
  if (!roleCodes?.length) {
    return users;
  }
  return users.filter(u => roleCodes.some(r => u.roleCodes.includes(r)));
}

// ---------------------------------------------------------------------------
// Detail sections (view) + documents
// ---------------------------------------------------------------------------

function field(label: string, value: string | undefined | null): ListDetailField {
  return { label, value: value?.trim() ? String(value) : '—' };
}

function buildCombinedAddressFields(
  user: User,
  refData: Record<string, KeyValue[]>,
): ListDetailField[] {
  const presentFields = buildAddressViewFields(
    user.presentAddress,
    refData,
    'Present address',
    'Present',
  ).map(item => ({ label: item.label, value: item.value }));

  const permanentFields: ListDetailField[] = user.addressSame
    ? [field('Permanent', 'Same as present address')]
    : buildAddressViewFields(
      user.permanentAddress,
      refData,
      'Permanent address',
      'Permanent',
    ).map(item => ({ label: item.label, value: item.value }));

  return [...presentFields, ...permanentFields];
}

export function buildMemberListDetailSections(
  user: User,
  refData: Record<string, KeyValue[]>,
): ListDetailSection[] {
  const whatsappTarget = resolveWhatsappTarget(user);
  const personalFields: ListDetailField[] = [
    field('Name', formatMemberDisplayName(user, refData)),
    ...(user.uniqueMemberId ? [field('Membership number', user.uniqueMemberId)] : []),
    field(
      'Gender',
      labelForRefKey(refData, user.gender, UserConstant.refDataKey.userGenders),
    ),
    field('Date of birth', formatDateOfBirth(user.dateOfBirth)),
    field('Email', user.email),
    field(
      'WhatsApp number',
      formatPhoneWithWhatsappLabel(user.primaryNumber, whatsappTarget, 'primary'),
    ),
    field(
      'Phone number',
      formatPhoneWithWhatsappLabel(user.secondaryNumber, whatsappTarget, 'secondary'),
    ),
  ];

  const addressFields = buildCombinedAddressFields(user, refData);

  return [
    {
      type: 'key_value',
      id: 'personal',
      title: 'Personal info',
      fields: personalFields,
      collapsed: false,
    },
    {
      type: 'key_value',
      id: 'address',
      title: 'Address',
      fields: addressFields,
      collapsed: false,
    },
  ];
}

export function buildMemberDocumentsLoadingSection(): ListDetailSection {
  return {
    type: 'documents',
    id: 'documents',
    title: 'Documents',
    documents: [],
    loading: true,
  };
}

export function buildMemberDocumentsSection(documents: Doc[]): ListDetailSection {
  return {
    type: 'documents',
    id: 'documents',
    title: 'Documents',
    documents,
    loading: false,
  };
}

export function buildMemberSelfProfileSections(
  user: User,
  refData: Record<string, KeyValue[]>,
): ListDetailSection[] {
  return buildMemberListDetailSections(user, refData);
}
