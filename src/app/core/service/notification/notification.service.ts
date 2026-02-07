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

const MOBILE_UA_RE = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

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

        // For first page, replace; for subsequent pages, append is handled by component
        if (page === 0) {
          this.notificationsSubject.next(data);
        }

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
   * Append notifications to the current list (for infinite scroll)
   */
  appendNotifications(newNotifications: AppNotification[]): void {
    const current = this.notificationsSubject.value;
    const updated = [...current, ...newNotifications];
    this.notificationsSubject.next(updated);
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
    const isMobile = this.isMobileBrowser();

    this.notificationController.registerFcmToken({
      body: {
        token: token,
        deviceType: 'WEB',
        browser: this.getBrowserInfo(),
        os: this.getOSInfo(),
        deviceName: isMobile ? `Mobile Web (${this.getOSInfo()})` : `Desktop Web (${navigator.platform})`
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
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    if (/windows phone/i.test(userAgent)) return 'Windows Phone';
    if (/win/i.test(userAgent)) return 'Windows';
    if (/android/i.test(userAgent)) return 'Android';
    if (/iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream) return 'iOS';
    if (/mac/i.test(userAgent)) return 'MacOS';
    if (/linux/i.test(userAgent)) return 'Linux';

    return 'Unknown';
  }


  /**
   * Check if running on a mobile browser
   */
  public isMobileBrowser(): boolean {
    return MOBILE_UA_RE.test(navigator.userAgent);
  }
}
