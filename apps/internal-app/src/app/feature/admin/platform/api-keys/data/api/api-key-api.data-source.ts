import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { ApiKeyResponseDto } from 'src/app/core/api/api-client/models';
import { AdminService } from 'src/app/feature/admin/admin.service';
import type { AdminApiKey } from '../../domain';
import type { ApiKeyDataSource } from '../api-key-data.source';

function mapApiKey(dto: ApiKeyResponseDto): AdminApiKey {
  const expired = !!dto.expiresAt && new Date(dto.expiresAt).getTime() < Date.now();
  return {
    id: dto.id,
    name: dto.name,
    permissions: dto.permissions ?? [],
    expiresAt: dto.expiresAt,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
    token: dto.token,
    status: expired ? 'expired' : 'active',
  };
}

@Injectable()
export class ApiKeyApiDataSource implements ApiKeyDataSource {
  constructor(private readonly admin: AdminService) {}

  list(pageIndex: number, pageSize: number): Observable<{ items: AdminApiKey[]; totalSize: number }> {
    return this.admin.getAPIKeyList(pageIndex, pageSize).pipe(
      map(page => ({
        items: (page?.content ?? []).map(mapApiKey),
        totalSize: page?.totalSize ?? 0,
      })),
    );
  }

  listScopes(): Observable<string[]> {
    return this.admin.getAPIScopeList().pipe(map(scopes => scopes ?? []));
  }

  create(input: { name: string; permissions: string[]; expiresAt?: string }): Observable<AdminApiKey> {
    return this.admin.createAPIKey({
      name: input.name,
      permissions: input.permissions,
      expiresAt: input.expiresAt,
    }).pipe(map(dto => mapApiKey(dto)));
  }

  updatePermissions(id: string, permissions: string[]): Observable<AdminApiKey> {
    return this.admin.updateAPIKeyDetail(id, permissions).pipe(map(dto => mapApiKey(dto)));
  }

  revoke(id: string): Observable<void> {
    return this.admin.revokeAPIKey(id).pipe(map(() => undefined));
  }
}
