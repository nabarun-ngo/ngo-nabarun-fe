import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';
import { NotificationControllerService } from '../../api-client/services/notification-controller.service';
import { NotificationResponseDto } from '../../api-client/models/notification-response-dto';

export type AppNotification = NotificationResponseDto;

export interface PagedNotifications {
  data: AppNotification[];
  total: number;
  page: number;
  limit: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // BehaviorSubjects for real-time updates
  private unreadCountSubject = new BehaviorSubject<number>(0);
  private notificationsSubject = new BehaviorSubject<AppNotification[]>([]);
  private broadcastChannel: BroadcastChannel | null = null;

  public unreadCount$ = this.unreadCountSubject.asObservable();
  public notifications$ = this.notificationsSubject.asObservable();
  public message$ = new BehaviorSubject<any>(null);

  constructor(
    private notificationController: NotificationControllerService,
    private messaging: Messaging
  ) {
  }

  /**
   * Listen for communication from the service worker
   */

  private handleIncomingSignal(payload: any) {
    console.log('[NotificationService] Handling incoming signal...', payload);
    this.message$.next(payload);
    this.refreshUnreadCount();
    this.playNotificationSound();

    // Update Badge
    const currentCount = this.unreadCountSubject.value;
    console.log('[NotificationService] Updating badge count from', currentCount);
    this.updateBadgeCount(currentCount + 1);
  }

  private playNotificationSound() {
    try {
      const audio = new Audio('assets/mixkit-bell-notification-933.wav');
      audio.load();
      audio.play().catch(e => console.warn('[NotificationService] Sound play blocked by browser policy:', e));
    } catch (e) {
      console.error('[NotificationService] Error playing sound:', e);
    }
  }


  /**
   * Get my notifications
   */
  getMyNotifications(includeArchived: boolean = false, page: number = 1, limit: number = 20): Observable<PagedNotifications> {
    return this.notificationController.getMyNotifications({
      isArchived: includeArchived,
      pageIndex: page,
      pageSize: limit
    }).pipe(
      map((response: any) => {
        // Casting to any to handle potential type mismatch in generated code
        // Expected response: SuccessResponse<PagedResult<Notification>>
        const payload = response.responsePayload || {};
        const data = payload.data || [];
        const total = payload.total || 0;

        this.notificationsSubject.next(data);

        return {
          data: data,
          total: total,
          page: page,
          limit: limit
        } as PagedNotifications;
      })
    );
  }

  /**
   * Get my unread notifications
   * Note: Using getMyNotifications with isRead=false
   */
  getMyUnreadNotifications(): Observable<AppNotification[]> {
    return this.notificationController.getMyNotifications({
      isRead: false,
      pageSize: 100, // Fetch a reasonable amount
      pageIndex: 0
    }).pipe(
      map((response: any) => {
        const payload = response.responsePayload || {};
        const data = payload.data || [];
        this.notificationsSubject.next(data);
        return data as AppNotification[];
      })
    );
  }

  /**
   * Get my unread notification count
   */
  getMyUnreadCount(): Observable<{ count: number }> {
    return this.notificationController.getMyUnreadCount().pipe(
      tap((response: any) => {
        // SuccessResponseNumber
        const count = response.responsePayload;
        this.unreadCountSubject.next(count);
      }),
      map((response: any) => ({ count: response.responsePayload }))
    );
  }

  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): Observable<void> {
    return this.notificationController.markAsRead({ id: notificationId }).pipe(
      map(() => void 0),
      tap(() => {
        // Update local state
        const currentCount = this.unreadCountSubject.value;
        this.unreadCountSubject.next(Math.max(0, currentCount - 1));

        // Update notification list
        const notifications = this.notificationsSubject.value;
        const updated = notifications.map(n =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } as any : n
        );
        this.notificationsSubject.next(updated);
      })
    );
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): Observable<{ markedCount: number }> {
    return this.notificationController.markAllAsRead().pipe(
      tap(() => {
        this.unreadCountSubject.next(0);

        // Update notification list
        const notifications = this.notificationsSubject.value;
        const updated = notifications.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() } as any));
        this.notificationsSubject.next(updated);
      }),
      map(() => ({ markedCount: 0 })) // API doesn't return count, so return 0 or fetch?
    );
  }

  /**
   * Archive notification
   */
  archiveNotification(notificationId: string): Observable<void> {
    return this.notificationController.archiveNotification({ id: notificationId }).pipe(
      map(() => void 0),
      tap(() => {
        // Remove from local list
        const notifications = this.notificationsSubject.value;
        const filtered = notifications.filter(n => n.id !== notificationId);
        this.notificationsSubject.next(filtered);
      })
    );
  }

  /**
   * Delete notification
   * Using archive as delete is not explicitly exposed in controller or backend might prefer archive.
   */
  deleteNotification(notificationId: string): Observable<void> {
    return this.archiveNotification(notificationId);
  }

  /**
   * Refresh unread count
   */
  refreshUnreadCount(): void {
    this.getMyUnreadCount().subscribe();
  }

  /**
   * Refresh notifications
   */
  refreshNotifications(): void {
    this.getMyUnreadNotifications().subscribe();
  }

  /**
   * Get current unread count value
   */
  getCurrentUnreadCount(): number {
    return this.unreadCountSubject.value;
  }

  /**
   * Get current notifications value
   */
  getCurrentNotifications(): AppNotification[] {
    return this.notificationsSubject.value;
  }

  /**
   * Register Firebase messaging service worker and wait for it to be ready
   */
  private async ensureServiceWorkerReady(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      console.log('[NotificationService] Service worker is available');
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        let registration = registrations.find(r => r.active?.scriptURL.includes('firebase-messaging-sw.js'));

        if (!registration) {
          console.log('[NotificationService] Registering new firebase-messaging-sw.js...');
          registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
            scope: '/',
            type: 'classic'
          });
        }

        // Wait for the worker to be active if it's still installing
        if (registration.installing || registration.waiting) {
          console.log('[NotificationService] Waiting for service worker to activate...');
          const worker = registration.installing || registration.waiting;
          if (worker) {
            await new Promise<void>((resolve) => {
              worker.addEventListener('statechange', (e: any) => {
                if (e.target.state === 'activated') resolve();
              });
              // Safety timeout
              setTimeout(resolve, 5000);
            });
          }
        }

        console.log('[NotificationService] Service worker is ready');
        return registration;
      } catch (error) {
        console.error('[NotificationService] Service worker registration failed:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Request permission for push notifications
   */
  requestPermission() {
    return new Observable(observer => {
      console.log('[NotificationService] Starting requestPermission flow...');

      // 1. Request Browser Permission FIRST (independent of Service Worker)
      window.Notification.requestPermission().then(permission => {
        if (permission !== 'granted') {
          console.error('[NotificationService] Permission denied by user');
          observer.error('Permission denied');
          return;
        }

        console.log('[NotificationService] Permission granted, now preparing Service Worker...');

        // 2. Ensure Service Worker is ready
        this.ensureServiceWorkerReady().then(registration => {
          if (!registration) {
            console.error('[NotificationService] Could not initialize Service Worker');
            observer.error('Service Worker failure');
            return;
          }

          // 3. Get FCM Token using the specific registration
          console.log('[NotificationService] Getting FCM token...');
          getToken(this.messaging, {
            vapidKey: environment.firebase_vapidKey,
            serviceWorkerRegistration: registration
          })
            .then(token => {
              console.log('[NotificationService] FCM Token obtained:', token);
              this.registerToken(token);
              observer.next(token);
              observer.complete();
            })
            .catch(error => {
              console.error('[NotificationService] FCM token retrieval failed:', error);
              observer.error(error);
            });
        }).catch(err => {
          console.error('[NotificationService] SW Setup failed:', err);
          observer.error(err);
        });
      });
    });
  }

  private registerToken(token: string) {
    this.notificationController.registerFcmToken({
      body: {
        token: token,
        deviceType: 'WEB',
        browser: this.getBrowserInfo(),
        os: this.getOSInfo(),
        deviceName: navigator.platform
      }
    }).subscribe({
      next: () => console.log('FCM token registered with server'),
      error: (err) => console.error('Failed to register FCM token', err)
    });
  }

  /**
   * Listen for incoming messages
   */
  listen() {
    onMessage(this.messaging, (payload) => {
      this.handleIncomingSignal(payload);
    });
  }

  /**
   * Update app badge count (for PWA icon badge)
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
        console.error('Failed to update app badge:', error);
      }
    }
  }

  /**
   * Get browser information
   */
  private getBrowserInfo(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';

    return 'Unknown';
  }

  /**
   * Get OS information
   */
  private getOSInfo(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Win')) return 'Windows';
    if (userAgent.includes('Mac')) return 'MacOS';
    if (userAgent.includes('Linux')) return 'Linux';
    if (userAgent.includes('Android')) return 'Android';
    if (userAgent.includes('iOS')) return 'iOS';

    return 'Unknown';
  }
}
