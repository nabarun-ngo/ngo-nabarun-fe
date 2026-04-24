import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap, map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, ActionPerformed, PushNotificationSchema, Token } from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { PushNotificationProvider, PUSH_NOTIFICATION_PROVIDER } from './push-notification-provider.interface';
import { NotificationControllerService } from '../../api-client/services/notification-controller.service';
import { UserIdentityService } from '../user-identity.service';
import { NotificationResponseDto } from '../../api-client/models/notification-response-dto';
import { Inject } from '@angular/core';

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
    private identityService: UserIdentityService,
    @Inject(PUSH_NOTIFICATION_PROVIDER) private pushProvider: PushNotificationProvider
  ) {
  }

  /**
   * Automatically setup push notifications based on current identity state
   */
  async setup() {
    try {
      const userId = this.identityService.loggedInUser?.user_id;
      if (this.identityService.isLoggedIn && userId) {
        console.log('[NotificationService] Secure user found, initializing push provider.');
        await this.pushProvider.init(userId);
      } else {
        console.log('[NotificationService] No secure user logged in, skipping push setup.');
      }
    } catch (error) {
      console.error('[NotificationService] Setup failed:', error);
      throw error;
    }
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
   * Ensure service worker is ready (placeholder for future logic)
   */
  private async ensureServiceWorkerReady(): Promise<ServiceWorkerRegistration | null> {
    if ('serviceWorker' in navigator) {
      return await navigator.serviceWorker.ready;
    }
    return null;
  }

  /**
   * Request permission for push notifications
   */
  requestPermission() {
    if (Capacitor.isNativePlatform()) {
      return this.requestNativePermission();
    } else {
      return this.requestWebPermission();
    }
  }

  private requestWebPermission(): Observable<string> {
    return new Observable(observer => {
      console.log('[NotificationService] Web permission request should be handled by OneSignal.');
      // OneSignal handles this automatically or via their SDK
      observer.next('Handled by OneSignal');
      observer.complete();
    });
  }

  private requestNativePermission(): Observable<string> {
    return new Observable(observer => {
      console.log('[NotificationService] Starting requestNativePermission flow...');

      (async () => {
        try {
          const result = await PushNotifications.requestPermissions();
          if (result.receive === 'granted') {
            // Register with Apple / Google to receive push via APNS/FCM
            PushNotifications.register();
            
            // Add listeners for registration success/error
            const registrationListener = await PushNotifications.addListener('registration', async (token: Token) => {
              console.log('[NotificationService] Native Push registration success, token:', token.value);
              
              // For Capacitor-FCM, sometimes we need the FCM specific token
              try {
                const fcmToken = await FCM.getToken();
                console.log('[NotificationService] Native FCM Token obtained:', fcmToken.token);
                this.registerToken(fcmToken.token);
                observer.next(fcmToken.token);
              } catch (err) {
                console.warn('[NotificationService] Failed to get FCM token, using Push token instead', err);
                this.registerToken(token.value);
                observer.next(token.value);
              }
              
              observer.complete();
              await registrationListener.remove();
            });

            PushNotifications.addListener('registrationError', (error: any) => {
              console.error('[NotificationService] Native Push registration error:', JSON.stringify(error));
              observer.error(error);
            });

            // Handle incoming notifications while app is in foreground
            PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
              console.log('[NotificationService] Native Push received:', notification);
              this.handleIncomingSignal({ notification: { title: notification.title, body: notification.body }, data: notification.data });
            });

            // Handle notification click
            PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
              console.log('[NotificationService] Native Push action performed:', notification);
            });
          } else {
            console.error('[NotificationService] Native permission denied');
            observer.error('Permission denied');
          }
        } catch (err) {
          console.error('[NotificationService] Error in native push flow:', err);
          observer.error(err);
        }
      })();
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
   * Listen for incoming messages (Handled by OneSignal)
   */
  listen() {
    // onMessage removal
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
