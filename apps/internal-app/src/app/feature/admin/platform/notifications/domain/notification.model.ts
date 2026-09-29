export interface AdminNotificationUser {
  id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export type NotificationDeliveryStatus = 'failed' | 'succeeded';

export interface AdminNotification {
  id: string;
  title?: string;
  body?: string;
  type?: string;
  category?: string;
  priority?: string;
  referenceId?: string;
  referenceType?: string;
  user?: AdminNotificationUser | string;
  createdAt?: string;
  status?: NotificationDeliveryStatus;
}

export interface NotificationListContext {
  refData: Record<string, unknown>;
}

export function notificationStatusLabel(status?: NotificationDeliveryStatus): string {
  if (status === 'failed') return 'Failed';
  if (status === 'succeeded') return 'Succeeded';
  return '—';
}

export function notificationUserLabel(user?: AdminNotificationUser | string): string {
  if (!user) return '—';
  if (typeof user === 'string') return user;
  const name = `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim();
  if (name && user.email) return `${name} (${user.email})`;
  return name || user.email || '—';
}
