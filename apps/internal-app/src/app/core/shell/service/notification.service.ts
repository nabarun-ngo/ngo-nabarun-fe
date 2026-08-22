import { Inject, Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { PushNotificationProvider, PUSH_NOTIFICATION_PROVIDER } from './push-notification-provider.interface';
import { CorrespondenceNotificationsService } from '../../api/api-client/services/correspondence-notifications.service';
import { IUserIdentityService } from '../../auth/tokens/user-identity.token';
import {
  AppNotification,
  INotificationService,
  PagedNotifications,
} from '../tokens/notification.token';

export type { AppNotification, PagedNotifications };

const MOBILE_UA_RE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

@Injectable({ providedIn: 'root' })
export class NotificationService implements INotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  private messageSubject = new BehaviorSubject<any>(null);

  readonly unreadCount$ = this.unreadCountSubject.asObservable();
  readonly notifications$ = this.notificationsSubject.asObservable();

  constructor(
    private notificationsApi: CorrespondenceNotificationsService,
    @Inject(IUserIdentityService) private identityService: IUserIdentityService,
    @Inject(PUSH_NOTIFICATION_PROVIDER) private pushProvider: PushNotificationProvider,
  ) { }

  async setup(): Promise<void> {
    try {
      const profileId = this.identityService.loggedInUserProfile?.id;
      if (this.identityService.isLoggedIn && profileId) {
        console.log('[NotificationService] Secure user found, initializing push provider.');
        await this.pushProvider.init(profileId);

        this.pushProvider.addForegroundListener((notification: any) => {
          console.log('[NotificationService] Foreground notification received:', notification);
          this.handleIncomingSignal(notification);
        });
      } else {
        console.log('[NotificationService] No secure user logged in, skipping push setup.');
      }
    } catch (error) {
      console.error('[NotificationService] Setup failed:', error);
      throw error;
    }
  }

  private handleIncomingSignal(payload: any): void {
    console.log('[NotificationService] Handling incoming signal…', payload);
    this.messageSubject.next(payload);

    this.getMyUnreadCount().subscribe({
      next: ({ count }) => {
        console.log('[NotificationService] Refreshed unread count:', count);
        this.updateBadgeCount(count);
      },
      error: (err) => {
        console.warn('[NotificationService] Could not refresh count from server, incrementing locally:', err);
        const current = this.unreadCountSubject.value;
        this.unreadCountSubject.next(current + 1);
        this.updateBadgeCount(current + 1);
      },
    });

    this.playNotificationSound();
  }

  private playNotificationSound(): void {
    try {
      const audio = new Audio('assets/mixkit-bell-notification-933.wav');
      audio.load();
      audio.play().catch(e =>
        console.warn('[NotificationService] Sound play blocked by browser policy:', e),
      );
    } catch (e) {
      console.error('[NotificationService] Error playing sound:', e);
    }
  }

  getMyNotificationsPaged(page: number, limit: number): Observable<PagedNotifications> {
    return this.notificationsApi.userNotificationControllerList({
      isArchived: false,
      pageSize: limit,
      pageIndex: page,
    }).pipe(
      map(m => m.responsePayload),
      map((payload) => {
        const data = (payload?.content || []) as AppNotification[];
        const total = payload?.totalSize || 0;

        if (page === 0) {
          this.notificationsSubject.next(data);
        }

        return { data, total, page, limit } as PagedNotifications;
      }),
    );
  }

  appendNotifications(newNotifications: AppNotification[]): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, ...newNotifications]);
  }

  getMyUnreadCount(): Observable<{ count: number }> {
    return this.notificationsApi.userNotificationControllerUnreadCount().pipe(
      tap((response: any) => {
        const count = response.responsePayload;
        this.unreadCountSubject.next(count);
      }),
      map((response: any) => ({ count: response.responsePayload })),
    );
  }

  markAsRead(notificationId: string): Observable<void> {
    return this.notificationsApi.userNotificationControllerMarkRead({ id: notificationId }).pipe(
      map(() => void 0),
      tap(() => {
        const currentCount = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, currentCount - 1));

        const notifications = this.notificationsSubject.value;
        const updated = notifications.map(n =>
          (n as any).id === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() } as any
            : n,
        );
        this.notificationsSubject.next(updated);
      }),
    );
  }

  markAllAsRead(): Observable<{ markedCount: number }> {
    return this.notificationsApi.userNotificationControllerMarkAllRead().pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
        this.updateBadgeCount(0);

        const notifications = this.notificationsSubject.value;
        const updated = notifications.map(n =>
          ({ ...n, isRead: true, readAt: new Date().toISOString() } as any),
        );
        this.notificationsSubject.next(updated);
      }),
      map(() => ({ markedCount: 0 })),
    );
  }

  archiveNotification(notificationId: string): Observable<void> {
    return this.notificationsApi.userNotificationControllerArchive({ id: notificationId }).pipe(
      map(() => void 0),
      tap(() => {
        const notifications = this.notificationsSubject.value;
        this.notificationsSubject.next(notifications.filter(n => (n as any).id !== notificationId));
      }),
    );
  }

  deleteNotification(notificationId: string): Observable<void> {
    return this.archiveNotification(notificationId);
  }

  refreshUnreadCount(): void {
    this.getMyUnreadCount().subscribe();
  }

  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  getCurrentNotifications(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  async updateBadgeCount(count: number): Promise<void> {
    if ('setAppBadge' in navigator) {
      try {
        if (count > 0) {
          await (navigator as any).setAppBadge(count);
        } else {
          await (navigator as any).clearAppBadge();
        }
      } catch (error) {
        console.error('[NotificationService] Failed to update app badge:', error);
      }
    }
  }

  isMobileBrowser(): boolean {
    return MOBILE_UA_RE.test(navigator.userAgent);
  }
}
