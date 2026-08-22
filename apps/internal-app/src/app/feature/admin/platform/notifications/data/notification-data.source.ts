import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { AdminNotification, NotificationDeliveryStatus } from '../domain';

export interface NotificationListQuery {
  pageIndex: number;
  pageSize: number;
  status?: NotificationDeliveryStatus;
}

export interface NotificationDataSource {
  list(query: NotificationListQuery): Observable<{ items: AdminNotification[]; totalSize: number }>;
  resendPush(id: string): Observable<void>;
}

export const NotificationDataSource = new InjectionToken<NotificationDataSource>('NotificationDataSource');
