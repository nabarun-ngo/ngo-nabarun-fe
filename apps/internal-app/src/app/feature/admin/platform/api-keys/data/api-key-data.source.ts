import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { AdminApiKey } from '../domain';

export interface ApiKeyDataSource {
  list(pageIndex: number, pageSize: number): Observable<{ items: AdminApiKey[]; totalSize: number }>;
  listScopes(): Observable<string[]>;
  create(input: { name: string; permissions: string[]; expiresAt?: string }): Observable<AdminApiKey>;
  updatePermissions(id: string, permissions: string[]): Observable<AdminApiKey>;
  revoke(id: string): Observable<void>;
}

export const ApiKeyDataSource = new InjectionToken<ApiKeyDataSource>('ApiKeyDataSource');
