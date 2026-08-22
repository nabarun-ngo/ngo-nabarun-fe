import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/** API schema is empty; fields populated at runtime from correspondence endpoints. */
export interface AppNotification {
  id: string;
  isRead?: boolean;
  actionUrl?: string;
  icon?: string;
  type?: string;
  title?: string;
  body?: string;
  createdAt?: string;
  readAt?: string;
  priority?: string;
  category?: string;
}

export interface PagedNotifications {
  data: AppNotification[];
  total: number;
  page: number;
  limit: number;
}

export interface INotificationService {
  readonly unreadCount$: Observable<number>;
  readonly notifications$: Observable<AppNotification[]>;

  setup(): Promise<void>;
  getMyNotificationsPaged(page: number, limit: number): Observable<PagedNotifications>;
  appendNotifications(newNotifications: AppNotification[]): void;
  getMyUnreadCount(): Observable<{ count: number }>;
  markAsRead(notificationId: string): Observable<void>;
  markAllAsRead(): Observable<{ markedCount: number }>;
  archiveNotification(notificationId: string): Observable<void>;
  deleteNotification(notificationId: string): Observable<void>;
  refreshUnreadCount(): void;
  getCurrentUnreadCount(): number;
  getCurrentNotifications(): AppNotification[];
  updateBadgeCount(count: number): Promise<void>;
  isMobileBrowser(): boolean;
}

export const INotificationService = new InjectionToken<INotificationService>('INotificationService');
