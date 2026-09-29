import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { OAuthAccountDto, OAuthTokenDto } from 'src/app/core/api/api-client/models';
import { OAuth2TokenVaultService } from 'src/app/core/api/api-client/services';
import type { AdminOAuthAccount, AdminOAuthToken, OAuthConnectionTestResult } from '../../domain';
import type { OAuthTokenDataSource } from '../oauth-token-data.source';

function mapAccount(dto: OAuthAccountDto): AdminOAuthAccount {
  return {
    id: dto.id,
    email: dto.email,
    name: dto.name,
    pictureUrl: dto.pictureUrl,
  };
}

function mapToken(dto: OAuthTokenDto): AdminOAuthToken {
  return {
    id: dto.id,
    accountId: dto.accountId,
    clientId: dto.clientId,
    provider: dto.provider,
    email: dto.email,
    account: dto.account ? mapAccount(dto.account) : undefined,
    expiresAt: dto.expiresAt,
    scopes: dto.scope ?? [],
    tokenType: dto.tokenType,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}

@Injectable()
export class OAuthTokenApiDataSource implements OAuthTokenDataSource {
  constructor(private readonly api: OAuth2TokenVaultService) {}

  listProviders(): Observable<string[]> {
    return this.api.oAuthControllerGetProviders({}).pipe(
      map(response => response.responsePayload ?? []),
    );
  }

  listScopes(provider: string): Observable<string[]> {
    return this.api.oAuthControllerGetScopes({ provider }).pipe(
      map(response => response.responsePayload ?? []),
    );
  }

  listAccounts(provider: string): Observable<AdminOAuthAccount[]> {
    return this.api.oAuthControllerListAccounts({
      provider,
      pageIndex: 0,
      pageSize: 200,
    }).pipe(
      map(response => (response.responsePayload?.content ?? []).map(mapAccount)),
    );
  }

  listTokens(
    provider: string,
    pageIndex: number,
    pageSize: number,
    account?: string,
  ): Observable<{ items: AdminOAuthToken[]; totalSize: number }> {
    return this.api.oAuthControllerListTokens({
      provider,
      pageIndex,
      pageSize,
      account: account?.trim() || undefined,
    }).pipe(
      map(response => ({
        items: response.responsePayload.content.map(mapToken),
        totalSize: response.responsePayload.totalSize,
      })),
    );
  }

  authorize(provider: string, scopes: string[]): Observable<{ url: string; state: string }> {
    return this.api.oAuthControllerGetAuthUrl({
      provider,
      scopes: scopes.join(' '),
    }).pipe(map(response => response.responsePayload));
  }

  revoke(provider: string, id: string): Observable<void> {
    return this.api.oAuthControllerRevokeToken({ provider, id });
  }

  testConnection(provider: string, id: string): Observable<OAuthConnectionTestResult> {
    return this.api.oAuthControllerTestConnection({ provider, id }).pipe(
      map(response => {
        const payload = response.responsePayload;
        return {
          ok: payload.ok,
          tokenId: payload.tokenId,
          provider: payload.provider,
          email: payload.email,
          refreshed: payload.refreshed,
          expiresAt: payload.expiresAt,
          accountName: payload.accountName,
          message: payload.message,
        };
      }),
    );
  }
}
