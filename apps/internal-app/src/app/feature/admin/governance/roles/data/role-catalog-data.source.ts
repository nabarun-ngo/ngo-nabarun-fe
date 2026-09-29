import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { RoleCatalogItem } from '../domain';

export interface RoleCatalogCreateInput {
  key: string;
  description?: string;
}

export interface RoleCatalogDataSource {
  listRoles(): Observable<RoleCatalogItem[]>;
  listGroups(): Observable<RoleCatalogItem[]>;
  listPermissions(): Observable<RoleCatalogItem[]>;
  createRole(input: RoleCatalogCreateInput): Observable<RoleCatalogItem>;
  createGroup(input: RoleCatalogCreateInput): Observable<RoleCatalogItem>;
  createPermission(input: RoleCatalogCreateInput): Observable<RoleCatalogItem>;
  updateRole(key: string, description?: string): Observable<RoleCatalogItem>;
  updateGroup(key: string, description?: string): Observable<RoleCatalogItem>;
  updatePermission(key: string, description?: string): Observable<RoleCatalogItem>;
  deleteRole(key: string): Observable<void>;
  deleteGroup(key: string): Observable<void>;
  deletePermission(key: string): Observable<void>;
  syncRolePermissions(key: string, permissionKeys: string[]): Observable<RoleCatalogItem>;
  syncGroupRoles(key: string, roleKeys: string[]): Observable<RoleCatalogItem>;
}

export const RoleCatalogDataSource = new InjectionToken<RoleCatalogDataSource>('RoleCatalogDataSource');
