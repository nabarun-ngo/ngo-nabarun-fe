import type {
  ListDetailSection,
  ListRowBadge,
  ListRowIconTone,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { DonorRefData as DonorRefDataKeys } from '../../finance.const';
import type { Donor, DonorMemberSummary, DonorRefData } from '../domain';

function statusBadge(
  status: Donor['status'],
  refData?: DonorRefData,
): ListRowBadge {
  const label = (refData?.[DonorRefDataKeys.refDataKey.status] as KeyValue[] | undefined)
    ?.find(item => item.key === status)?.displayValue
    ?? status;
  switch (status) {
    case 'ACTIVE':
      return { label, tone: 'success' };
    case 'PAUSED':
      return { label, tone: 'warning' };
    case 'WAIVED':
      return { label, tone: 'neutral' };
    case 'DELETED':
      return { label, tone: 'neutral' };
    default:
      return { label, tone: 'neutral' };
  }
}

function iconTone(type: Donor['type']): ListRowIconTone {
  return type === 'GUEST' ? 'amber' : 'indigo';
}

function formatPhone(donor: Donor): string {
  if (!donor.phoneNumber) return '-';
  return `${donor.phoneCode ?? ''}${donor.phoneNumber}`.trim() || '-';
}

function formatListDate(value?: string): string | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function formatDetailDate(value?: string): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatAmount(amount?: number): string {
  if (amount == null) return '-';
  return `₹${amount.toLocaleString('en-IN')}`;
}

function formatOutstandingMonths(months?: string[]): string {
  if (!months?.length) return '-';
  return months
    .map(month => {
      const [year, monthNum] = month.split('-');
      const date = new Date(Number(year), Number(monthNum) - 1, 1);
      if (Number.isNaN(date.getTime())) return month;
      return date.toLocaleString('en-IN', { month: 'short', year: 'numeric' });
    })
    .join(', ');
}

function statusLabel(status: Donor['status'], refData?: DonorRefData): string {
  return (refData?.[DonorRefDataKeys.refDataKey.status] as KeyValue[] | undefined)
    ?.find(item => item.key === status)?.displayValue
    ?? status;
}

export function mapDonorListRow(
  donor: Donor,
  refData?: DonorRefData,
): ListRowItem<Donor> {
  const isGuest = donor.type === 'GUEST';
  return {
    id: donor.id,
    title: donor.fullName ?? donor.id,
    subtitle: donor.email ?? (formatPhone(donor) === '-' ? donor.id : formatPhone(donor)),
    metaRight: formatListDate(donor.createdAt),
    badge: statusBadge(donor.status, refData),
    icon: 'account',
    iconTone: iconTone(donor.type),
    payload: donor,
    metaLeft: !isGuest && donor.preferredAmount
      ? `₹${donor.preferredAmount.toLocaleString('en-IN')} per month`
      : (isGuest ? 'Guest' : 'Member'),
  };
}

/**
 * Detail sections for a member looking at their own donation standing, where the
 * donor record itself is not readable and only the contact fields carried on the
 * donation row are available.
 */
export function buildOwnDonorDetailSections(
  summary: DonorMemberSummary | undefined,
  contact: { fullName?: string; email?: string; phone?: string },
): ListDetailSection[] {
  return [
    {
      type: 'key_value',
      id: 'donor_summary',
      title: 'Summary',
      fields: [
        { label: 'Outstanding amount', value: formatAmount(summary?.outstandingAmount) },
        { label: 'Outstanding months', value: formatOutstandingMonths(summary?.outstandingMonths) },
      ],
      collapsed: false,
    },
    {
      type: 'key_value',
      id: 'donor_contact',
      title: 'Personal Info',
      fields: [
        { label: 'Full name', value: contact.fullName || '-' },
        { label: 'Email', value: contact.email || '-' },
        { label: 'Phone', value: contact.phone || '-' },
      ],
      collapsed: false,
    },
  ];
}

export function buildDonorListDetailSections(
  donor: Donor,
  refData?: DonorRefData,
): ListDetailSection[] {
  const isMember = donor.type === 'MEMBER';
  const sections: ListDetailSection[] = [];

  if (isMember) {
    sections.push({
      type: 'key_value',
      id: 'donor_summary',
      title: 'Summary',
      fields: [
        { label: 'Outstanding amount', value: formatAmount(donor.outstandingAmount) },
        { label: 'Outstanding months', value: formatOutstandingMonths(donor.outstandingMonths) },
      ],
      collapsed: false,
    });
  }

  sections.push({
    type: 'key_value',
    id: 'donor_contact',
    title: 'Personal Info',
    fields: [
      { label: 'Full name', value: donor.fullName ?? '-' },
      { label: 'Email', value: donor.email ?? '-' },
      { label: 'Phone', value: formatPhone(donor) },
      { label: 'Status', value: statusLabel(donor.status, refData) },
      { label: 'Type', value: donor.type === 'GUEST' ? 'Guest' : 'Member' },
    ],
    collapsed: false,
  });

  if (isMember) {
    sections.push({
      type: 'key_value',
      id: 'donor_membership',
      title: 'Preferences',
      fields: [
        { label: 'Preferred amount', value: formatAmount(donor.preferredAmount) },
        { label: 'Status end date', value: formatDetailDate(donor.statusEndDate) },
      ],
      collapsed: false,
    });
  }

  return sections;
}
