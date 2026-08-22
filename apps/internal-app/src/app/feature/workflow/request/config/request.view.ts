import type {
  ListDetailSection,
  ListRowBadge,
  ListRowItem,
} from '@nabarun-ngo/list-dashboard-core';
import {
  detailItemListSection,
  detailKeyValueSection,
  detailTextField,
} from '@nabarun-ngo/list-dashboard-angular';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type { RequestRefData, WorkflowRequest, WorkflowTimelineEntry } from '../domain';
import { personDisplayName, RequestRefDataKeys } from '../domain';

function label(refData: RequestRefData, key: string, value?: string | null): string {
  return ((refData[key] as KeyValue[] | undefined)?.find(item => item.key === value)?.displayValue)
    ?? value
    ?? '-';
}

/** The badge always carries the status; assignment is surfaced in the meta line. */
function statusBadge(status: string | undefined, refData: RequestRefData): ListRowBadge {
  const normalized = status ?? '';
  const text = displayStatus(normalized, refData);
  if (normalized === 'Rejected' || normalized === 'Withdrawn') {
    return { label: text, tone: 'danger' };
  }
  if (normalized === 'Closed') {
    return { label: text, tone: 'success' };
  }
  if (normalized === 'InProgress') {
    return { label: text, tone: 'primary' };
  }
  if (normalized === 'PendingForApproval') {
    return { label: text, tone: 'warning' };
  }
  return { label: normalized ? text : 'Unknown', tone: 'neutral' };
}

function displayStatus(status: string, refData: RequestRefData): string {
  const resolved = label(refData, RequestRefDataKeys.statuses, status);
  return resolved === status ? labelForStatus(status) : resolved;
}

function labelForStatus(status: string): string {
  switch (status) {
    case 'PendingForApproval':
      return 'Pending for Approval';
    case 'YetToStart':
      return 'Yet to Start';
    case 'InProgress':
      return 'In Progress';
    default:
      return status;
  }
}

function metaLeftForRow(request: WorkflowRequest): string | undefined {
  if (request.assignedToMeAtApproval) {
    return 'Assigned to you for approval';
  }
  if (request.status === 'InProgress' && (request.assignee || request.assigneeId || request.claimedBy)) {
    return `Started by ${personDisplayName(
      request.assignee ?? request.claimedBy,
      request.assigneeId ?? request.claimedById,
    )}`;
  }
  if (request.assignee || request.assigneeId) {
    return `Assigned to ${personDisplayName(request.assignee, request.assigneeId)}`;
  }
  if (request.executorRoles?.length) {
    return request.executorRoles.join(', ');
  }
  return undefined;
}

export function mapRequestListRow(
  request: WorkflowRequest,
  refData: RequestRefData = {},
): ListRowItem<WorkflowRequest> {
  const assignedToMe = !!request.assignedToMeAtApproval;
  return {
    id: request.id,
    title: request.name || label(refData, RequestRefDataKeys.types, request.type),
    subtitleParts: [
      {
        text: label(refData, RequestRefDataKeys.types, request.type || request.definitionId),
        emphasis: assignedToMe,
      },
      { text: `#${request.id.slice(0, 8)}`, emphasis: assignedToMe },
      ...(assignedToMe
        ? [{ text: 'Needs your decision', emphasis: true as const }]
        : []),
    ],
    metaLeft: metaLeftForRow(request),
    metaRight: request.createdAt ? date(request.createdAt, 'dd MMM yy') : undefined,
    badge: statusBadge(request.status, refData),
    icon: 'assignment',
    iconTone: assignedToMe
      ? 'amber'
      : request.status === 'PendingForApproval'
        ? 'indigo'
        : request.needApproval
          ? 'indigo'
          : 'blue',
    payload: request,
  };
}

export function buildRequestDetailSections(
  request: WorkflowRequest,
  refData: RequestRefData = {},
): ListDetailSection[] {
  const summary = [
    detailTextField('Request id', request.id),
    detailTextField('Name', request.name || '-'),
    detailTextField(
      'Type',
      label(refData, RequestRefDataKeys.types, request.type || request.definitionId),
    ),
    detailTextField('Status', displayStatus(request.status ?? '', refData)),
    detailTextField(
      'Initiated by',
      personDisplayName(request.initiatedBy, request.initiatedById),
    ),
    detailTextField(
      'Initiated for',
      personDisplayName(request.initiatedFor, request.initiatedForId),
    ),
    ...(request.assigneeId || request.assignee
      ? [detailTextField(
        'Assignee',
        personDisplayName(request.assignee, request.assigneeId),
      )]
      : []),
    ...(request.claimedById || request.claimedBy
      ? [detailTextField(
        'Started by',
        personDisplayName(request.claimedBy, request.claimedById),
      )]
      : []),
    detailTextField(
      'Executor roles',
      request.executorRoles?.length ? request.executorRoles.join(', ') : '-',
    ),
    detailTextField(
      'Executor permissions',
      request.executorPermissions?.length
        ? request.executorPermissions.join(', ')
        : '-',
    ),
    detailTextField('Needs approval', request.needApproval ? 'Yes' : 'No'),
    ...(request.approverRoles?.length
      ? [detailTextField('Approver roles', request.approverRoles.join(', '))]
      : []),
    ...(request.approverPermissions?.length
      ? [detailTextField('Approver permissions', request.approverPermissions.join(', '))]
      : []),
    ...(request.createdAt
      ? [detailTextField('Created', date(request.createdAt, 'dd MMM yyyy hh:mm a'))]
      : []),
    ...(request.completedAt
      ? [detailTextField('Closed', date(request.completedAt, 'dd MMM yyyy hh:mm a'))]
      : []),
    ...(request.decisionNote
      ? [detailTextField('Decision note', request.decisionNote)]
      : []),
  ];

  const fulfillment = [
    detailTextField(
      'Instructions',
      request.executorInstructions?.trim() || 'No fulfillment instructions provided.',
    ),
  ];

  const submitted = (request.submittedFields ?? []).map(field =>
    detailTextField(field.label || field.key, field.value.trim() || '-'));

  return [
    detailKeyValueSection('request_summary', 'Request summary', summary),
    detailKeyValueSection(
      'request_submitted_form',
      'Submitted details',
      submitted.length
        ? submitted
        : [detailTextField('Details', 'No details were submitted with this request.')],
    ),
    // Fulfillment instructions only matter to whoever is about to pick the request up.
    ...(request.status === 'YetToStart'
      ? [detailKeyValueSection('request_fulfillment', 'How to fulfill', fulfillment)]
      : []),
    buildTimelineSection(request.timeline ?? []),
  ];
}

export function buildTimelineSection(
  entries: WorkflowTimelineEntry[],
): ListDetailSection {
  return detailItemListSection(
    'request_activity',
    'Activity',
    entries
      .slice()
      .sort((a, b) => a.sequence - b.sequence)
      .map(entry => ({
        id: entry.id,
        title: entry.eventType,
        subtitle: entry.actorId || undefined,
        metaRight: entry.occurredAt
          ? date(entry.occurredAt, 'dd MMM yy hh:mm a')
          : undefined,
      })),
    { emptyMessage: 'No activity yet' },
  );
}
