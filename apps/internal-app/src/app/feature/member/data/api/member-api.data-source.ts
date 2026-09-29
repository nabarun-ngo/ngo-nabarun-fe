import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, shareReplay, switchMap } from 'rxjs';
import {
  CreateUserDto,
  UpdateUserAdminDto,
  UpdateUserProfileDto,
  UploadDocumentRequestDto,
} from 'src/app/core/api/api-client/models';
import { DmsService, UsersService } from 'src/app/core/api/api-client/services';
import { RbacApiService } from 'src/app/core/auth/service/rbac-api.service';
import { Doc } from 'src/app/shared/models/document.model';
import { KeyValue } from 'src/app/shared/models/key-value.model';
import {
  buildMemberApiFilter,
  DEFAULT_MEMBER_CHIP,
  normalizeMemberChipId,
  resolveMemberDmsEntityType,
} from '../../config/member.rules';
import { applyProfileDtoToUser } from '../../config/member.forms';
import { MemberLinkedConnection, MemberListCriteria, PagedUser, User } from '../../domain';
import {
  mapLinkedConnectionDto,
  mapPagedUserDtoToPagedUser,
  mapUserDtoToUser,
  mapUserRefData,
  RoleLabelLookup,
} from '../member-data.mapper';
import {
  MemberDataSource,
  MemberListOptions,
  MemberListPageQuery,
  mapApiDocsToDocs,
} from '../member-data.source';

@Injectable()
export class MemberApiDataSource implements MemberDataSource {
  private roleLabelsCache?: Observable<RoleLabelLookup>;

  constructor(
    private usersApi: UsersService,
    private dmsApi: DmsService,
    private rbacApi: RbacApiService,
  ) {}

  /** Role display names from the RBAC catalog; member payloads carry role keys only. */
  private roleLabels(): Observable<RoleLabelLookup> {
    this.roleLabelsCache ??= this.rbacApi.listRolesCatalog(0, 100, true).pipe(
      map(roles => new Map(roles.map(role => [role.key, role.description?.trim() || role.key]))),
      catchError(() => of(new Map<string, string>())),
      shareReplay({ bufferSize: 1, refCount: false }),
    );
    return this.roleLabelsCache;
  }

  loadListPage(query: MemberListPageQuery): Observable<PagedUser> {
    const chipId = normalizeMemberChipId(query.chipId) ?? DEFAULT_MEMBER_CHIP;
    const criteria = (query.criteria ?? {}) as MemberListCriteria;
    const filter = buildMemberApiFilter(chipId, criteria, query.searchText);
    return this.fetchMembers({
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      filter,
    });
  }

  fetchMembers(options: MemberListOptions): Observable<PagedUser> {
    const filter = options.filter ?? {};
    return forkJoin({
      page: this.usersApi.userControllerListUsers({
        pageIndex: options.pageIndex,
        pageSize: options.pageSize,
        firstName: filter.firstName,
        lastName: filter.lastName,
        email: filter.email,
        phoneNumber: filter.phoneNumber,
        status: filter.status,
      }).pipe(map(d => d.responsePayload)),
      roleLabels: this.roleLabels(),
    }).pipe(
      map(({ page, roleLabels }) => mapPagedUserDtoToPagedUser(page!, roleLabels)),
    );
  }

  fetchRefData(countryCode?: string, stateCode?: string): Observable<Record<string, KeyValue[]> | undefined> {
    return this.usersApi.userControllerGetReferenceData({ countryCode, stateCode }).pipe(
      map(d => mapUserRefData(d.responsePayload)),
    );
  }

  fetchMemberById(id: string): Observable<User | undefined> {
    return forkJoin({
      member: this.usersApi.userControllerGetUserById({ id }).pipe(map(d => d.responsePayload)),
      roleLabels: this.roleLabels(),
    }).pipe(
      map(({ member, roleLabels }) => (member ? mapUserDtoToUser(member, roleLabels) : undefined)),
    );
  }

  getMyProfile(): Observable<User> {
    return forkJoin({
      member: this.usersApi.userControllerGetMyProfile().pipe(map(d => d.responsePayload!)),
      roleLabels: this.roleLabels(),
    }).pipe(
      map(({ member, roleLabels }) => mapUserDtoToUser(member, roleLabels)),
    );
  }

  createMember(body: CreateUserDto): Observable<User> {
    return forkJoin({
      member: this.usersApi.userControllerCreateUser({ body }).pipe(map(d => d.responsePayload!)),
      roleLabels: this.roleLabels(),
    }).pipe(
      map(({ member, roleLabels }) => mapUserDtoToUser(member, roleLabels)),
    );
  }

  deleteMember(id: string): Observable<void> {
    return this.usersApi.userControllerDeleteUser({ id });
  }

  updateMyProfile(body: UpdateUserProfileDto): Observable<User> {
    return forkJoin({
      member: this.usersApi.userControllerUpdateMyProfile({ body }).pipe(map(d => d.responsePayload!)),
      roleLabels: this.roleLabels(),
    }).pipe(
      map(({ member, roleLabels }) => mapUserDtoToUser(member, roleLabels)),
    );
  }

  updateMemberProfile(id: string, body: UpdateUserProfileDto): Observable<User> {
    return this.fetchMemberById(id).pipe(
      switchMap(user => {
        if (!user) {
          throw new Error('Member not found');
        }
        return this.fetchRefData().pipe(
          map(refData => applyProfileDtoToUser(user, body, refData ?? {})),
        );
      }),
    );
  }

  updateMemberAdmin(id: string, body: UpdateUserAdminDto): Observable<User> {
    return forkJoin({
      member: this.usersApi.userControllerUpdateUserAdmin({ id, body }).pipe(map(d => d.responsePayload!)),
      roleLabels: this.roleLabels(),
    }).pipe(
      map(({ member, roleLabels }) => mapUserDtoToUser(member, roleLabels)),
    );
  }

  updateMemberRoles(idpSub: string, roleCodes: string[]): Observable<void> {
    return forkJoin([
      this.rbacApi.listUserRoles(idpSub, true),
      this.rbacApi.listRolesCatalog(),
    ]).pipe(
      switchMap(([userRoles, _catalog]) => {
        const currentKeys = new Set(
          userRoles
            .map(r => r.roleKey)
            .filter((k): k is string => !!k),
        );
        const targetKeys = new Set(roleCodes);
        const toRevoke = userRoles.filter(r => {
          const key = r.roleKey;
          return key && currentKeys.has(key) && !targetKeys.has(key);
        });
        const toGrant = roleCodes.filter(code => !currentKeys.has(code));
        const revokeOps = toRevoke
          .filter(g => g.id)
          .map(g => this.rbacApi.revokeRole(idpSub, g.id!));
        const grantOps = toGrant.map(roleKey =>
          this.rbacApi.grantRole(idpSub, { roleKey }),
        );
        const ops = [...revokeOps, ...grantOps];
        if (!ops.length) {
          return of(undefined);
        }
        return forkJoin(ops).pipe(map(() => undefined));
      }),
    );
  }

  /** Live Auth memberships — used when opening staff admin edit. */
  listMemberRoles(idpSub: string): Observable<string[]> {
    return this.rbacApi.listUserRoles(idpSub, true).pipe(
      map(memberships =>
        memberships
          .filter(m => !m.revokedAt && !!m.roleKey)
          .map(m => m.roleKey as string),
      ),
    );
  }

  listRoleGroupsCatalog(): Observable<KeyValue[]> {
    return this.rbacApi.listRoleGroupsCatalog().pipe(
      map(groups =>
        groups.map(group => ({
          key: group.key,
          displayValue: group.description?.trim() || group.key,
        })),
      ),
    );
  }

  listMemberRoleGroups(idpSub: string): Observable<string[]> {
    return this.rbacApi.listUserGroups(idpSub, true).pipe(
      map(memberships =>
        memberships
          .filter(m => !m.revokedAt && !!m.groupKey)
          .map(m => m.groupKey as string),
      ),
    );
  }

  updateMemberRoleGroups(idpSub: string, groupKeys: string[]): Observable<void> {
    return this.rbacApi.listUserGroups(idpSub, true).pipe(
      switchMap(memberships => {
        const active = memberships.filter(m => !m.revokedAt && !!m.groupKey);
        const currentKeys = new Set(active.map(m => m.groupKey as string));
        const targetKeys = new Set(groupKeys);
        const toRemove = active.filter(m => m.groupKey && !targetKeys.has(m.groupKey));
        const toAdd = groupKeys.filter(key => !currentKeys.has(key));
        const ops = [
          ...toRemove
            .filter(m => m.id)
            .map(m => this.rbacApi.removeFromGroup(idpSub, m.id!)),
          ...toAdd.map(groupKey => this.rbacApi.addToGroup(idpSub, { groupKey })),
        ];
        if (!ops.length) {
          return of(undefined);
        }
        return forkJoin(ops).pipe(map(() => undefined));
      }),
    );
  }

  listPermissionsCatalog(): Observable<KeyValue[]> {
    return this.rbacApi.listPermissionsCatalog().pipe(
      map(permissions =>
        permissions.map(permission => ({
          key: permission.key,
          displayValue: permission.description?.trim() || permission.key,
        })),
      ),
    );
  }

  listMemberPermissions(idpSub: string): Observable<string[]> {
    return this.rbacApi.listUserPermissions(idpSub, true).pipe(
      map(grants =>
        grants
          .filter(g => !g.revokedAt && !!g.permissionKey)
          .map(g => g.permissionKey as string),
      ),
    );
  }

  updateMemberPermissions(idpSub: string, permissionKeys: string[]): Observable<void> {
    return this.rbacApi.listUserPermissions(idpSub, true).pipe(
      switchMap(grants => {
        const active = grants.filter(g => !g.revokedAt && !!g.permissionKey);
        const currentKeys = new Set(active.map(g => g.permissionKey as string));
        const targetKeys = new Set(permissionKeys);
        const toRemove = active.filter(g => g.permissionKey && !targetKeys.has(g.permissionKey));
        const toAdd = permissionKeys.filter(key => !currentKeys.has(key));
        const ops = [
          ...toRemove.filter(g => g.id).map(g => this.rbacApi.revokePermission(idpSub, g.id)),
          ...toAdd.map(permissionKey => this.rbacApi.grantPermission(idpSub, { permissionKey })),
        ];
        if (!ops.length) {
          return of(undefined);
        }
        return forkJoin(ops).pipe(map(() => undefined));
      }),
    );
  }

  listMemberConnections(id: string): Observable<MemberLinkedConnection[]> {
    return this.usersApi.userControllerGetUserConnections({ id }).pipe(
      map(d => (d.responsePayload ?? []).map(mapLinkedConnectionDto)),
    );
  }

  grantMemberConnection(id: string, connectionKey: string): Observable<void> {
    return this.usersApi.userControllerGrantUserConnection({
      id,
      body: { connectionKey },
    }).pipe(map(() => undefined));
  }

  revokeMemberConnection(id: string, connectionKey: string): Observable<void> {
    return this.usersApi.userControllerRevokeUserConnection({ id, connectionKey });
  }

  fetchDocuments(
    entityId: string,
    refData?: Record<string, KeyValue[]>,
  ): Observable<Doc[]> {
    const entityType = resolveMemberDmsEntityType(refData, 'profileDocuments');
    return this.dmsApi.dms2ControllerListDocuments({ entityType, entityId }).pipe(
      map(d => mapApiDocsToDocs(d.responsePayload?.data as unknown as Array<Record<string, unknown>> | undefined)),
    );
  }

  uploadPicture(
    id: string,
    base64: string,
    refData?: Record<string, KeyValue[]>,
  ): Observable<Doc> {
    const entityType = resolveMemberDmsEntityType(refData, 'profilePicture');
    return this.uploadDocument(id, base64, entityType, 'profile_pic.png');
  }

  uploadDocument(id: string, base64: string, entityType: string, filename: string): Observable<Doc> {
    const body: UploadDocumentRequestDto = {
      contentType: base64.includes('pdf') ? 'application/pdf' : 'image/png',
      fileBase64: base64,
      fileName: filename,
      mappings: [{ entityId: id, entityType }],
    };
    return this.dmsApi.dms2ControllerUploadDocument({ body }).pipe(
      map(d => mapApiDocsToDocs([d.responsePayload as unknown as Record<string, unknown>])[0]),
    );
  }

  initPasswordChange(currentPassword: string, redirectUrl?: string): Observable<{ ticketUrl: string }> {
    return this.usersApi.userControllerInitiatePasswordChange({
      body: { currentPassword, redirectUrl },
    }).pipe(
      map(d => {
        const ticketUrl = d.responsePayload?.ticketUrl;
        if (!ticketUrl) {
          throw new Error('Password change ticket URL missing from response.');
        }
        return { ticketUrl };
      }),
    );
  }
}
