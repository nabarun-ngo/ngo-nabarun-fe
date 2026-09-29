import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { AdminOAuthAccount, AdminOAuthToken, OAuthConnectionTestResult } from '../domain';

export interface OAuthTokenDataSource {
  listProviders(): Observable<string[]>;
  listScopes(provider: string): Observable<string[]>;
  listAccounts(provider: string): Observable<AdminOAuthAccount[]>;
  listTokens(
    provider: string,
    pageIndex: number,
    pageSize: number,
    account?: string,
  ): Observable<{ items: AdminOAuthToken[]; totalSize: number }>;
  authorize(provider: string, scopes: string[]): Observable<{ url: string; state: string }>;
  revoke(provider: string, id: string): Observable<void>;
  testConnection(provider: string, id: string): Observable<OAuthConnectionTestResult>;
}

export const OAuthTokenDataSource = new InjectionToken<OAuthTokenDataSource>('OAuthTokenDataSource');
