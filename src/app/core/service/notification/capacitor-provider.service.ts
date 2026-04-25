import { Injectable } from '@angular/core';
import {
  PushNotifications,
  ActionPerformed,
  PushNotificationSchema,
  Token
} from '@capacitor/push-notifications';
import { FCM } from '@capacitor-community/fcm';
import { PushNotificationProvider } from './push-notification-provider.interface';
import { NotificationControllerService } from '../../api-client/services/notification-controller.service';

/**
 * Capacitor-based push notification provider.
 * Handles all Capacitor + FCM native push logic so that NotificationService
 * remains vendor-agnostic.
 *
 * Wire this as the PUSH_NOTIFICATION_PROVIDER token when running on a
 * native (iOS / Android) platform.
 */
@Injectable({
  providedIn: 'root'
})
export class CapacitorProviderService implements PushNotificationProvider {

  constructor(private notificationController: NotificationControllerService) { }

  // ------------------------------------------------------------------
  // PushNotificationProvider implementation
  // ------------------------------------------------------------------

  async init(userId: string): Promise<void> {
    console.log('[CapacitorProvider] init – userId:', userId);
    await this.login(userId);
    await this.requestAndRegister();
  }

  async login(userId: string): Promise<void> {
    // Capacitor has no separate "login" concept; kept for interface symmetry.
    console.log('[CapacitorProvider] login – userId:', userId);
  }

  async logout(): Promise<void> {
    console.log('[CapacitorProvider] logout');
    try {
      await PushNotifications.unregister();
    } catch (e) {
      console.warn('[CapacitorProvider] unregister failed:', e);
    }
  }

  /**
   * Request OS push permission, register the device, and persist the token
   * to the backend. Called automatically by init().
   */
  private requestAndRegister(): Promise<void> {
    return new Promise(async (resolve, reject) => {
      console.log('[CapacitorProvider] Requesting native push permission…');
      try {
        const result = await PushNotifications.requestPermissions();
        if (result.receive !== 'granted') {
          console.warn('[CapacitorProvider] Permission denied – push notifications will not work.');
          return resolve(); // don't throw; the app should still function
        }

        await PushNotifications.register();

        // Registration success – grab the best token available
        const regListener = await PushNotifications.addListener(
          'registration',
          async (token: Token) => {
            console.log('[CapacitorProvider] Registration token:', token.value);
            let finalToken = token.value;

            try {
              const fcmResult = await FCM.getToken();
              console.log('[CapacitorProvider] FCM token:', fcmResult.token);
              finalToken = fcmResult.token;
            } catch (fcmErr) {
              console.warn('[CapacitorProvider] FCM.getToken() failed, using Capacitor token.', fcmErr);
            }

            this.registerTokenWithBackend(finalToken);
            await regListener.remove();
            resolve();
          }
        );

        // Registration failure
        PushNotifications.addListener('registrationError', (error: any) => {
          console.error('[CapacitorProvider] Registration error:', JSON.stringify(error));
          reject(error);
        });

      } catch (err) {
        console.error('[CapacitorProvider] Error during init:', err);
        reject(err);
      }
    });
  }

  /**
   * Register a callback for foreground push notifications.
   * The listener receives a normalized payload { title, body, data }.
   */
  addForegroundListener(listener: (notification: any) => void): void {
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('[CapacitorProvider] Foreground notification received:', notification);
        listener({
          title: notification.title,
          body: notification.body,
          data: notification.data
        });
      }
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('[CapacitorProvider] Notification action performed:', action);
      }
    );
  }

  // ------------------------------------------------------------------
  // Private helpers
  // ------------------------------------------------------------------

  private registerTokenWithBackend(token: string): void {
    this.notificationController.registerFcmToken({
      body: {
        token,
        deviceType: 'MOBILE',
        browser: 'Native',
        os: this.getOSInfo(),
        deviceName: `Native App (${this.getOSInfo()})`
      }
    }).subscribe({
      next: () => console.log('[CapacitorProvider] Token registered with backend.'),
      error: (err) => console.error('[CapacitorProvider] Failed to register token:', err)
    });
  }

  private getOSInfo(): string {
    const ua = navigator.userAgent;
    if (/android/i.test(ua)) return 'Android';
    if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
    return 'Unknown';
  }
}
