import { Component } from '@angular/core';
import { PageLoaderComponent } from '../../component/page-loader/page-loader.component';

@Component({
  selector: 'app-secured-layout',
  templateUrl: './secured-layout.component.html',
  styleUrls: []
})
export class SecuredLayoutComponent {
  protected httpLoaderConfig = {
    backgroundColor: '#ff0000',
    debounceDelay: 100,
    extraDuration: 300,
    minDuration: 300,
    backdropBackgroundColor: '#777777',
    entryComponent: PageLoaderComponent,
    opacity: '0.9',
    filteredUrlPatterns: [
      'token',
      'openid-configuration',
      'jwks.json',
      'api/users/profile/metrics',
      'api/notifications/me/unread/count',
      'api/notifications/me'

    ]
  }
}
