import { Injectable, NgZone } from '@angular/core';
import { Router } from '@angular/router';
import { App } from '@capacitor/app';
import { Browser } from '@capacitor/browser';
import { Capacitor } from '@capacitor/core';
import { AuthService } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CapacitorAuthService {
  constructor(
    private auth: AuthService,
    private router: Router,
    private zone: NgZone
  ) { }

  public initialize() {
    if (!Capacitor.isNativePlatform()) {
      return;
    }

    App.addListener('appUrlOpen', ({ url }) => {
      this.zone.run(() => {
        if (url.includes('state') && (url.includes('code') || url.includes('error'))) {
          console.log(url)
          this.auth.handleRedirectCallback(url).subscribe((data) => {
            this.router.navigate([data.appState?.target || '/']);
          });
        }
      });
    });
  }

  public getRedirectUri(): string {
    if (Capacitor.isNativePlatform()) {
      const config = environment.mobile_auth_config;
      return `${config.appId}://${config.domain}/capacitor/${config.appId}/callback`;
    }
    return window.location.origin;
  }

  public async openUrl(url: string) {
    if (Capacitor.isNativePlatform()) {
      await Browser.open({ url, windowName: '_self' });
    } else {
      window.location.href = url;
    }
  }
}
