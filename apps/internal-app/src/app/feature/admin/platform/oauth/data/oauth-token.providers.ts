import type { Provider } from '@angular/core';
import { OAuthTokenApiDataSource } from './api/oauth-token-api.data-source';
import { OAuthTokenDataSource } from './oauth-token-data.source';

export function provideOAuthTokenDataSource(): Provider[] {
  return [
    OAuthTokenApiDataSource,
    { provide: OAuthTokenDataSource, useExisting: OAuthTokenApiDataSource },
  ];
}
