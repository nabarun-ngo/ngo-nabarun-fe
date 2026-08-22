import type { ListDetailSection, ListRowItem } from '@nabarun-ngo/list-dashboard-core';
import { kvSection, mapAdminRow } from '../../../shared/admin-list.helpers';
import { notificationStatusLabel, type AdminNotification } from '../domain';

export function mapNotificationListRow(notification: AdminNotification): ListRowItem<AdminNotification> {
  return mapAdminRow({
    id: notification.id,
    title: notification.title ?? notification.id,
    subtitle: notification.body,
    metaLeft: notification.category,
    metaRight: notification.createdAt ? new Date(notification.createdAt).toLocaleString() : undefined,
    payload: notification,
  });
}

export function buildNotificationDetailSections(notification: AdminNotification): ListDetailSection[] {
  return [
    kvSection('notification_meta', 'Notification', [
      { label: 'Title', value: notification.title ?? '—' },
      { label: 'Body', value: notification.body ?? '—' },
      { label: 'Type', value: notification.type ?? '—' },
      { label: 'Category', value: notification.category ?? '—' },
      { label: 'Priority', value: notification.priority ?? '—' },
      { label: 'Reference', value: notification.referenceType && notification.referenceId
        ? `${notification.referenceType} · ${notification.referenceId}` : '—' },
      { label: 'Created', value: notification.createdAt ?? '—' },
    ]),
    kvSection('notification_delivery', 'Delivery', [
      { label: 'Status', value: notificationStatusLabel(notification.status) },
    ]),
  ];
}
