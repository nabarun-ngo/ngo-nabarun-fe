import { InjectionToken } from '@angular/core';

export const PUSH_NOTIFICATION_PROVIDER = new InjectionToken<PushNotificationProvider>('PushNotificationProvider');

export interface PushNotificationProvider {
  /**
   * Initialize the push provider for the given user.
   * Implementations should request OS permission and register the device
   * token with the backend as part of this call.
   */
  init(userId: string): Promise<void>;

  /** Associate the push provider session with the given user. */
  login(userId: string): Promise<void>;

  /** Dissociate the push provider session from the current user. */
  logout(): Promise<void>;

  /**
   * Register a callback that fires whenever a push notification arrives
   * while the app is in the foreground.
   */
  addForegroundListener(listener: (notification: any) => void): void;
}
