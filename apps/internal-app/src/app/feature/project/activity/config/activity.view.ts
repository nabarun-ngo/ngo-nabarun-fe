import { detailKeyValueSection, detailTextField } from '@nabarun-ngo/list-dashboard-angular';
import type {
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type { Activity, ActivityRefDataMap, ActivityStatus } from '../domain';
import { ActivityRefData } from '../domain';

function refLabel(refData: ActivityRefDataMap, section: string, value?: string): string {
  if (!value) {
    return '-';
  }
  return (refData[section] as KeyValue[] | undefined)
    ?.find(item => item.key === value)?.displayValue ?? value;
}

function statusBadge(
  status: ActivityStatus | undefined,
  refData: ActivityRefDataMap,
): ListRowBadge {
  const tone = status === 'IN_PROGRESS'
    ? 'success'
    : status === 'COMPLETED'
      ? 'primary'
      : status === 'CANCELLED'
        ? 'danger'
        : status === 'ON_HOLD'
          ? 'warning'
          : 'neutral';
  return { label: refLabel(refData, ActivityRefData.refDataKey.statuses, status), tone };
}

function money(amount: number | undefined, currency = 'INR'): string {
  if (amount == null) {
    return '-';
  }
  const symbol = currency === 'INR' ? '₹' : `${currency} `;
  return `${symbol}${amount.toLocaleString('en-IN')}`;
}

export function mapActivityListRow(
  activity: Activity,
  refData: ActivityRefDataMap = {},
  projectLabels: ReadonlyMap<string, string> = new Map(),
): ListRowItem<Activity> {
  const project = projectLabels.get(activity.projectId);
  return {
    id: activity.id,
    title: activity.name,
    subtitle: [
      project,
      refLabel(refData, ActivityRefData.refDataKey.types, activity.type),
    ].filter(Boolean).join(' · '),
    metaLeft: refLabel(refData, ActivityRefData.refDataKey.scales, activity.scale),
    metaRight: activity.startDate ? date(activity.startDate, 'dd MMM yyyy') : undefined,
    badge: statusBadge(activity.status, refData),
    icon: 'event',
    iconTone: 'blue',
    payload: activity,
  };
}

export function buildActivityDetailSections(
  activity: Activity,
  refData: ActivityRefDataMap,
  labels: {
    projects?: ReadonlyMap<string, string>;
    users?: ReadonlyMap<string, string>;
  } = {},
): ListDetailSection[] {
  const person = (id?: string): string =>
    id ? labels.users?.get(id) ?? id : '-';

  const details = [
    detailTextField('Activity name', activity.name),
    detailTextField('Project', labels.projects?.get(activity.projectId) ?? activity.projectId),
    detailTextField('Description', activity.description || '-'),
    detailTextField('Type', refLabel(refData, ActivityRefData.refDataKey.types, activity.type)),
    detailTextField('Scale', refLabel(refData, ActivityRefData.refDataKey.scales, activity.scale)),
    detailTextField(
      'Status',
      refLabel(refData, ActivityRefData.refDataKey.statuses, activity.status),
    ),
    detailTextField(
      'Priority',
      refLabel(refData, ActivityRefData.refDataKey.priorities, activity.priority),
    ),
    detailTextField('Start date', activity.startDate ? date(activity.startDate) : '-'),
    detailTextField('End date', activity.endDate ? date(activity.endDate) : '-'),
    detailTextField('Location', activity.location || '-'),
    detailTextField('Venue', activity.venue || '-'),
  ];

  const delivery = [
    detailTextField('Assigned to', person(activity.assignedTo)),
    detailTextField('Organizer', person(activity.organizerId)),
    detailTextField('Estimated cost', money(activity.estimatedCost, activity.currency)),
    detailTextField('Actual cost', money(activity.actualCost, activity.currency)),
    detailTextField(
      'Participants',
      `${activity.actualParticipants ?? 0} of ${activity.expectedParticipants ?? '—'}`,
    ),
    detailTextField('Actual start', activity.actualStartDate ? date(activity.actualStartDate) : '-'),
    detailTextField('Actual end', activity.actualEndDate ? date(activity.actualEndDate) : '-'),
  ];

  return [
    detailKeyValueSection('activity_detail', 'Activity details', details),
    detailKeyValueSection('activity_delivery', 'Delivery & cost', delivery),
  ];
}
