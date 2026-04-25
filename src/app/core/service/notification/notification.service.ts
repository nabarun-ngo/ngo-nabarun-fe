import { Injectable, Inject } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { PushNotificationProvider, PUSH_NOTIFICATION_PROVIDER } from './push-notification-provider.interface';
import { NotificationControllerService } from '../../api-client/services/notification-controller.service';
import { UserIdentityService } from '../user-identity.service';
import { NotificationResponseDto } from '../../api-client/models/notification-response-dto';

export type AppNotification = NotificationResponseDto;

export interface PagedNotifications {
  data: AppNotification[];
  total: number;
  page: number;
  limit: number;
}

const MOBILE_UA_RE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // BehaviorSubjects for real-time updates
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);

  public unreadCount$ = this.unreadCountSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();
  public message$ = new BehaviorSubject<any>(null);

  constructor(
    private notificationController: NotificationControllerService,
    private identityService: UserIdentityService,
    @Inject(PUSH_NOTIFICATION_PROVIDER) private pushProvider: PushNotificationProvider
  ) { }

  // ------------------------------------------------------------------
  // Lifecycle
  // ------------------------------------------------------------------

  /**
   * Initialise push notifications for the currently logged-in user.
   * Registers a foreground listener so incoming notifications immediately
   * update the unread badge count while the user is in the app.
   */
  async setup(): Promise<void> {
    try {
      const userId = this.identityService.loggedInUser?.user_id;
      if (this.identityService.isLoggedIn && userId) {
        console.log('[NotificationService] Secure user found, initializing push provider.');
        await this.pushProvider.init(userId);

        // Wire the foreground listener so notifications received while the
        // user is actively using the app still update the badge / unread count.
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

  // ------------------------------------------------------------------
  // Internal helpers
  // ------------------------------------------------------------------

  private handleIncomingSignal(payload: any): void {
    console.log('[NotificationService] Handling incoming signal…', payload);
    this.message$.next(payload);

    // Refresh server-side unread count, then update the badge
    this.getMyUnreadCount().subscribe({
      next: ({ count }) => {
        console.log('[NotificationService] Refreshed unread count:', count);
        this.updateBadgeCount(count);
      },
      error: (err) => {
        // Fallback: increment locally if the API call fails
        console.warn('[NotificationService] Could not refresh count from server, incrementing locally:', err);
        const current = this.unreadCountSubject.value;
        this.unreadCountSubject.next(current + 1);
        this.updateBadgeCount(current + 1);
      }
    });

    this.playNotificationSound();
  }

  private playNotificationSound(): void {
    try {
      const audio = new Audio('assets/mixkit-bell-notification-933.wav');
      audio.load();
      audio.play().catch(e =>
        console.warn('[NotificationService] Sound play blocked by browser policy:', e)
      );
    } catch (e) {
      console.error('[NotificationService] Error playing sound:', e);
    }
  }

  // ------------------------------------------------------------------
  // Public API – notifications CRUD
  // ------------------------------------------------------------------

  /**
   * Get my unread notifications with pagination (for infinite scroll)
   */
  getMyNotificationsPaged(page: number, limit: number): Observable<PagedNotifications> {
    return this.notificationController.getMyNotifications({
      isArchived: 'N',
      pageSize: limit,
      pageIndex: page
    }).pipe(
      map(m => m.responsePayload),
      map((payload) => {
        const data = payload.content || [];
        const total = payload.totalSize || 0;

        if (page === 0) {
          this.notificationsSubject.next(data);
        }

        return { data, total, page, limit } as PagedNotifications;
      })
    );
  }

  /**
   * Append notifications to the current list (for infinite scroll)
   */
  appendNotifications(newNotifications: AppNotification[]): void {
    const current = this.notificationsSubject.value;
    this.notificationsSubject.next([...current, ...newNotifications]);
  }

  /**
   * Get my unread notification count from the server and update local state.
   */
  getMyUnreadCount(): Observable<{ count: number }> {
    return this.notificationController.getMyUnreadCount().pipe(
      tap((response: any) => {
        const count = response.responsePayload;
        this.unreadCountSubject.next(count);
      }),
      map((response: any) => ({ count: response.responsePayload }))
    );
  }

  /**
   * Mark a single notification as read.
   */
  markAsRead(notificationId: string): Observable<void> {
    return this.notificationController.markAsRead({ id: notificationId }).pipe(
      map(() => void 0),
      tap(() => {
        const currentCount = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, currentCount - 1));

        const notifications = this.notificationsSubject.value;
        const updated = notifications.map(n =>
          n.id === notificationId
            ? { ...n, isRead: true, readAt: new Date().toISOString() } as any
            : n
        );
        this.notificationsSubject.next(updated);
      })
    );
  }

  /**
   * Mark all notifications as read.
   */
  markAllAsRead(): Observable<{ markedCount: number }> {
    return this.notificationController.markAllAsRead().pipe(
      tap(() => {
        this.unreadCountSubject.next(0);
        this.updateBadgeCount(0);

        const notifications = this.notificationsSubject.value;
        const updated = notifications.map(n =>
          ({ ...n, isRead: true, readAt: new Date().toISOString() } as any)
        );
        this.notificationsSubject.next(updated);
      }),
      map(() => ({ markedCount: 0 }))
    );
  }

  /**
   * Archive a notification (removes it from the active list).
   */
  archiveNotification(notificationId: string): Observable<void> {
    return this.notificationController.archiveNotification({ id: notificationId }).pipe(
      map(() => void 0),
      tap(() => {
        const notifications = this.notificationsSubject.value;
        this.notificationsSubject.next(notifications.filter(n => n.id !== notificationId));
      })
    );
  }

  /** Alias for archiveNotification (backend prefers archive over hard delete). */
  deleteNotification(notificationId: string): Observable<void> {
    return this.archiveNotification(notificationId);
  }

  /**
   * Trigger a server-side refresh of the unread count.
   */
  refreshUnreadCount(): void {
    this.getMyUnreadCount().subscribe();
  }

  /**
   * Synchronously read the current cached unread count.
   */
  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Synchronously read the current cached notification list.
   */
  getCurrentNotifications(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Update the PWA / native app icon badge count.
   */
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

  // ------------------------------------------------------------------
  // Utility helpers
  // ------------------------------------------------------------------

  /** Returns true when running on a mobile browser. */
  public isMobileBrowser(): boolean {
    return MOBILE_UA_RE.test(navigator.userAgent);
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    if (ua.includes('Opera')) return 'Opera';
    return 'Unknown';
  }

  private getOSInfo(): string {
    const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
    if (/windows phone/i.test(ua)) return 'Windows Phone';
    if (/win/i.test(ua)) return 'Windows';
    if (/android/i.test(ua)) return 'Android';
    if (/iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream) return 'iOS';
    if (/mac/i.test(ua)) return 'MacOS';
    if (/linux/i.test(ua)) return 'Linux';
    return 'Unknown';
  }
}

