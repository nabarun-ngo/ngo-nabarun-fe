import { Injectable } from '@angular/core';
import { OneSignal } from 'onesignal-ngx';
import { environment } from 'src/environments/environment';
import { PushNotificationProvider } from './push-notification-provider.interface';

@Injectable({
  providedIn: 'root'
})
export class OneSignalProviderService implements PushNotificationProvider {

  constructor(private oneSignal: OneSignal) { }

  async init(userId: string): Promise<void> {
    console.log('[OneSignalProvider] Initializing for user:', userId);
    try {
      await this.oneSignal.init({
        appId: environment.onesignal_app_id,
        allowLocalhostAsSecureOrigin: !environment.production,
        path: '/',
        serviceWorkerPath: 'combined-sw.js',
        serviceWorkerParam: { scope: '/' },
        autoRegister: true
      });
      await this.login(userId);
    } catch (err) {
      console.error('[OneSignalProvider] Initialization failed:', err);
      throw err;
    }
  }

  addForegroundListener(listener: (notification: any) => void): void {
    this.oneSignal.Notifications.addEventListener("foregroundWillDisplay", (event) => {
      // Prevent the default notification popup
      event.preventDefault();
      listener(event.notification);
    });

  }

  async login(userId: string): Promise<void> {
    console.log('[OneSignalProvider] Logging in user:', userId);
    await this.oneSignal.login(userId);
  }

  async logout(): Promise<void> {
    //console.log('[OneSignalProvider] Logging out.');
    //this.oneSignal.logout();
  }
}
