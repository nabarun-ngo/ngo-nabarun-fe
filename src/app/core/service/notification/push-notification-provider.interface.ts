import { InjectionToken } from '@angular/core';

export const PUSH_NOTIFICATION_PROVIDER = new InjectionToken<PushNotificationProvider>('PushNotificationProvider');

export interface PushNotificationProvider {
  init(userId: string): Promise<void>;
  login(userId: string): Promise<void>;
  logout(): Promise<void>;
}
