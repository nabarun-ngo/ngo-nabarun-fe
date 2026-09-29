import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { AdminService } from '../../../../admin.service';
import type {
  AdminNotification,
  AdminNotificationUser,
  NotificationDeliveryStatus,
} from '../../domain';
import type { NotificationDataSource, NotificationListQuery } from '../notification-data.source';

function mapNotification(raw: Record<string, unknown>): AdminNotification {
  const userRaw = raw['user'];
  let user: AdminNotificationUser | string | undefined;
  if (typeof userRaw === 'string') {
    user = userRaw;
  } else if (userRaw && typeof userRaw === 'object') {
    const u = userRaw as Record<string, unknown>;
    user = {
      id: u['id'] as string | undefined,
      firstName: u['firstName'] as string | undefined,
      lastName: u['lastName'] as string | undefined,
      email: u['email'] as string | undefined,
    };
  }

  return {
    id: String(raw['id'] ?? ''),
    title: raw['title'] as string | undefined,
    body: raw['body'] as string | undefined,
    type: raw['type'] as string | undefined,
    category: raw['category'] as string | undefined,
    priority: raw['priority'] as string | undefined,
    referenceId: raw['referenceId'] as string | undefined,
    referenceType: raw['referenceType'] as string | undefined,
    user,
    createdAt: raw['createdAt'] as string | undefined,
    status: raw['status'] as NotificationDeliveryStatus | undefined,
  };
}

@Injectable()
export class NotificationApiDataSource implements NotificationDataSource {
  constructor(private readonly admin: AdminService) {}

  list(query: NotificationListQuery): Observable<{ items: AdminNotification[]; totalSize: number }> {
    return this.admin.getUndeliveredNotifications(query).pipe(
      map(page => ({
        items: ((page?.content ?? []) as unknown as Record<string, unknown>[]).map(mapNotification),
        totalSize: page?.totalSize ?? 0,
      })),
    );
  }

  resendPush(id: string): Observable<void> {
    return this.admin.resendPushNotification(id).pipe(map(() => undefined));
  }
}
