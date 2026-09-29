import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import {
  AuthPermissionsService,
  AuthRoleGroupsService,
  AuthRolesService,
} from 'src/app/core/api/api-client/services';
import type { RoleCatalogItem } from '../../domain';
import type { RoleCatalogCreateInput, RoleCatalogDataSource } from '../role-catalog-data.source';

const LARGE_PAGE = 500;

function mapRole(role: {
  id: string;
  key: string;
  description?: string;
  permissionKeys?: string[];
  createdAt: string;
}): RoleCatalogItem {
  return {
    id: role.id,
    kind: 'role',
    key: role.key,
    description: role.description,
    memberKeys: role.permissionKeys ?? [],
    createdAt: role.createdAt,
  };
}

function mapGroup(group: {
  id: string;
  key: string;
  description?: string;
  roleKeys?: string[];
  createdAt: string;
}): RoleCatalogItem {
  return {
    id: group.id,
    kind: 'group',
    key: group.key,
    description: group.description,
    memberKeys: group.roleKeys ?? [],
    createdAt: group.createdAt,
  };
}

function mapPermission(permission: {
  id: string;
  key: string;
  description?: string;
  createdAt: string;
}): RoleCatalogItem {
  return {
    id: permission.id,
    kind: 'permission',
    key: permission.key,
    description: permission.description,
    memberKeys: [],
    createdAt: permission.createdAt,
  };
}

@Injectable()
export class RoleCatalogApiDataSource implements RoleCatalogDataSource {
  constructor(
    private readonly rolesApi: AuthRolesService,
    private readonly groupsApi: AuthRoleGroupsService,
    private readonly permissionsApi: AuthPermissionsService,
  ) {}

  listRoles(): Observable<RoleCatalogItem[]> {
    return this.rolesApi
      .rolesControllerListRoles({ pageIndex: 0, pageSize: LARGE_PAGE, includeShadow: true })
      .pipe(map(r => (r.responsePayload?.content ?? []).map(mapRole)));
  }

  listGroups(): Observable<RoleCatalogItem[]> {
    return this.groupsApi
      .roleGroupsControllerListRoleGroups({ pageIndex: 0, pageSize: LARGE_PAGE, includeShadow: true })
      .pipe(map(r => (r.responsePayload?.content ?? []).map(mapGroup)));
  }

  listPermissions(): Observable<RoleCatalogItem[]> {
    return this.permissionsApi.permissionsControllerListPermissions({
      pageIndex: 0,
      pageSize: LARGE_PAGE,
    }).pipe(
      map(r => (r.responsePayload?.content ?? []).map(mapPermission)),
    );
  }

  createRole(input: RoleCatalogCreateInput): Observable<RoleCatalogItem> {
    return this.rolesApi.rolesControllerCreateRole({ body: input }).pipe(
      map(r => mapRole(r.responsePayload!)),
    );
  }

  createGroup(input: RoleCatalogCreateInput): Observable<RoleCatalogItem> {
    return this.groupsApi.roleGroupsControllerCreateRoleGroup({ body: input }).pipe(
      map(r => mapGroup(r.responsePayload!)),
    );
  }

  createPermission(input: RoleCatalogCreateInput): Observable<RoleCatalogItem> {
    return this.permissionsApi.permissionsControllerCreatePermission({ body: input }).pipe(
      map(r => mapPermission(r.responsePayload!)),
    );
  }

  updateRole(key: string, description?: string): Observable<RoleCatalogItem> {
    return this.rolesApi.rolesControllerUpdateRole({ key, body: { description } }).pipe(
      map(r => mapRole(r.responsePayload!)),
    );
  }

  updateGroup(key: string, description?: string): Observable<RoleCatalogItem> {
    return this.groupsApi.roleGroupsControllerUpdateRoleGroup({ key, body: { description } }).pipe(
      map(r => mapGroup(r.responsePayload!)),
    );
  }

  updatePermission(key: string, description?: string): Observable<RoleCatalogItem> {
    return this.permissionsApi.permissionsControllerUpdatePermission({
      key,
      body: { description },
    }).pipe(
      map(r => mapPermission(r.responsePayload!)),
    );
  }

  deleteRole(key: string): Observable<void> {
    return this.rolesApi.rolesControllerDeleteRole({ key });
  }

  deleteGroup(key: string): Observable<void> {
    return this.groupsApi.roleGroupsControllerDeleteRoleGroup({ key });
  }

  deletePermission(key: string): Observable<void> {
    return this.permissionsApi.permissionsControllerDeletePermission({ key });
  }

  syncRolePermissions(key: string, permissionKeys: string[]): Observable<RoleCatalogItem> {
    return this.rolesApi.rolesControllerSyncRolePermissions({
      key,
      body: { permissionKeys },
    }).pipe(
      map(r => mapRole(r.responsePayload!)),
    );
  }

  syncGroupRoles(key: string, roleKeys: string[]): Observable<RoleCatalogItem> {
    return this.groupsApi.roleGroupsControllerSyncRoleGroupRoles({
      key,
      body: { roleKeys },
    }).pipe(
      map(r => mapGroup(r.responsePayload!)),
    );
  }
}
