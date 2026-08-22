import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { RbacDataSource } from '@nabarun-ngo/auth-angular';
import { ApiConfiguration } from '../../api/api-client/api-configuration';
import {
  AuthMeService,
  AuthPermissionsService,
  AuthRoleGroupsService,
  AuthRolesService,
  AuthUserRolesService,
} from '../../api/api-client/services';
import { CurrentUserResponseDto } from '../../api/api-client/models/current-user-response-dto';
import { RbacResponseDto } from '../../api/api-client/models/rbac-response-dto';
import { GrantRoleRequestDto } from '../../api/api-client/models/grant-role-request-dto';
import { AddToGroupRequestDto } from '../../api/api-client/models/add-to-group-request-dto';

/** Direct user↔permission grant (until OpenAPI client is regenerated). */
export interface UserPermissionGrantDto {
  id: string;
  idpSub: string;
  permissionId: string;
  permissionKey?: string;
  entityId?: string;
  entityType?: string;
  grantedAt: string;
  revokedAt?: string;
  grantedBy?: string;
  note?: string;
}

interface SuccessEnvelope<T> {
  responsePayload: T;
}

@Injectable({ providedIn: 'root' })
export class RbacApiService implements RbacDataSource {
  constructor(
    private authMe: AuthMeService,
    private authUserRoles: AuthUserRolesService,
    private authRoles: AuthRolesService,
    private authPermissions: AuthPermissionsService,
    private authRoleGroups: AuthRoleGroupsService,
    private http: HttpClient,
    private apiConfig: ApiConfiguration,
  ) {}

  private rootUrl(): string {
    return this.apiConfig.rootUrl?.replace(/\/$/, '') ?? '';
  }

  fetchCurrentUser(): Observable<CurrentUserResponseDto> {
    return this.authMe.meControllerGetMe().pipe(
      map((response) => response.responsePayload!),
    );
  }

  fetchUserAccess(idpSub: string): Observable<RbacResponseDto> {
    return this.authUserRoles.userRolesControllerResolveAccess({ idpSub }).pipe(
      map((response) => response.responsePayload!),
    );
  }

  listUserRoles(idpSub: string, all = false) {
    return this.authUserRoles.userRolesControllerListUserRoles({
      idpSub,
      all: all ? 'true' : undefined,
    }).pipe(
      map((response) => response.responsePayload ?? []),
    );
  }

  listUserGroups(idpSub: string, all = false) {
    return this.authUserRoles.userRolesControllerListUserGroups({
      idpSub,
      all: all ? 'true' : undefined,
    }).pipe(
      map((response) => response.responsePayload ?? []),
    );
  }

  listUserPermissions(idpSub: string, all = false): Observable<UserPermissionGrantDto[]> {
    const params = all ? { all: 'true' } : undefined;
    return this.http
      .get<SuccessEnvelope<UserPermissionGrantDto[]>>(
        `${this.rootUrl()}/api/auth/rbac/users/${encodeURIComponent(idpSub)}/direct-permissions`,
        { params },
      )
      .pipe(map((response) => response.responsePayload ?? []));
  }

  grantRole(idpSub: string, body: GrantRoleRequestDto) {
    return this.authUserRoles.userRolesControllerGrantRole({ idpSub, body }).pipe(
      map((response) => response.responsePayload!),
    );
  }

  revokeRole(idpSub: string, roleId: string) {
    return this.authUserRoles.userRolesControllerRevokeRole({ idpSub, roleId }).pipe(
      map((response) => response.responsePayload!),
    );
  }

  grantPermission(idpSub: string, body: { permissionKey: string; note?: string }) {
    return this.http
      .post<SuccessEnvelope<UserPermissionGrantDto>>(
        `${this.rootUrl()}/api/auth/rbac/users/${encodeURIComponent(idpSub)}/direct-permissions`,
        body,
      )
      .pipe(map((response) => response.responsePayload!));
  }

  revokePermission(idpSub: string, grantId: string) {
    return this.http
      .delete<SuccessEnvelope<UserPermissionGrantDto>>(
        `${this.rootUrl()}/api/auth/rbac/users/${encodeURIComponent(idpSub)}/direct-permissions/${encodeURIComponent(grantId)}`,
      )
      .pipe(map((response) => response.responsePayload!));
  }

  addToGroup(idpSub: string, body: AddToGroupRequestDto) {
    return this.authUserRoles.userRolesControllerAddToGroup({ idpSub, body }).pipe(
      map((response) => response.responsePayload!),
    );
  }

  removeFromGroup(idpSub: string, membershipId: string) {
    return this.authUserRoles.userRolesControllerRemoveFromGroup({ idpSub, membershipId }).pipe(
      map((response) => response.responsePayload!),
    );
  }

  listRolesCatalog(pageIndex = 0, pageSize = 100, includeShadow = false) {
    return this.authRoles.rolesControllerListRoles({ pageIndex, pageSize, includeShadow }).pipe(
      map((response) => response.responsePayload?.content ?? []),
    );
  }

  listRoleGroupsCatalog(pageIndex = 0, pageSize = 100, includeShadow = false) {
    return this.authRoleGroups
      .roleGroupsControllerListRoleGroups({ pageIndex, pageSize, includeShadow })
      .pipe(map((response) => response.responsePayload?.content ?? []));
  }

  listPermissionsCatalog(pageIndex = 0, pageSize = 500) {
    return this.authPermissions.permissionsControllerListPermissions({ pageIndex, pageSize }).pipe(
      map((response) => response.responsePayload?.content ?? []),
    );
  }
}
