import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import {
  CreateUserDto,
  UpdateUserAdminDto,
  UpdateUserProfileDto,
} from 'src/app/core/api/api-client/models';
import { Doc } from 'src/app/shared/models/document.model';
import { KeyValue } from 'src/app/shared/models/key-value.model';
import {
  DEFAULT_MEMBER_CHIP,
  normalizeMemberChipId,
} from 'src/app/feature/member/config/member.rules';
import { MemberLinkedConnection, MemberListCriteria, MemberRefData, PagedUser, User } from 'src/app/feature/member/domain';
import {
  MemberDataSource,
  MemberListOptions,
  MemberListPageQuery,
} from 'src/app/feature/member/data/member-data.source';
import {
  DEMO_MEMBER_REF_DATA,
  createDemoMember,
  deleteDemoMember,
  findDemoMemberById,
  getDemoMemberConnections,
  getDemoMemberPage,
  getDemoMyProfile,
  grantDemoMemberConnection,
  revokeDemoMemberConnection,
  updateDemoMember,
} from './member-demo.fixtures';
import { applyProfileDtoToUser } from 'src/app/feature/member/config/member.forms';

@Injectable()
export class MemberDemoDataSource implements MemberDataSource {
  loadListPage(query: MemberListPageQuery): Observable<PagedUser> {
    const chipId = normalizeMemberChipId(query.chipId) ?? DEFAULT_MEMBER_CHIP;
    const { items, totalSize } = getDemoMemberPage(
      chipId,
      (query.criteria ?? {}) as MemberListCriteria,
      query.searchText,
      query.pageIndex,
      query.pageSize,
    );
    return of({
      content: items,
      totalSize,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }).pipe(delay(query.append ? 400 : 250));
  }

  fetchMembers(options: MemberListOptions): Observable<PagedUser> {
    return this.loadListPage({
      chipId: DEFAULT_MEMBER_CHIP,
      criteria: {},
      pageIndex: options.pageIndex ?? 0,
      pageSize: options.pageSize ?? 20,
    });
  }

  fetchRefData(_countryCode?: string, _stateCode?: string): Observable<MemberRefData | undefined> {
    return of(DEMO_MEMBER_REF_DATA as Record<string, KeyValue[]>).pipe(delay(100));
  }

  fetchMemberById(id: string): Observable<User | undefined> {
    return of(findDemoMemberById(id)).pipe(delay(150));
  }

  getMyProfile(): Observable<User> {
    return of(getDemoMyProfile()).pipe(delay(150));
  }

  createMember(body: CreateUserDto): Observable<User> {
    try {
      return of(createDemoMember(body)).pipe(delay(200));
    } catch (error) {
      return throwError(() => error);
    }
  }

  deleteMember(id: string): Observable<void> {
    try {
      deleteDemoMember(id);
      return of(undefined).pipe(delay(150));
    } catch (error) {
      return throwError(() => error);
    }
  }

  updateMyProfile(body: UpdateUserProfileDto): Observable<User> {
    const current = getDemoMyProfile();
    const updated = applyProfileDtoToUser(current, body, DEMO_MEMBER_REF_DATA as Record<string, KeyValue[]>);
    updateDemoMember(current.id, updated);
    return of(updated).pipe(delay(200));
  }

  updateMemberProfile(id: string, body: UpdateUserProfileDto): Observable<User> {
    const existing = findDemoMemberById(id);
    if (!existing) {
      throw new Error('Member not found');
    }
    const updated = applyProfileDtoToUser(existing, body, DEMO_MEMBER_REF_DATA as Record<string, KeyValue[]>);
    updateDemoMember(id, { ...updated, email: existing.email });
    return of(updated).pipe(delay(200));
  }

  updateMemberAdmin(id: string, body: UpdateUserAdminDto): Observable<User> {
    const user = findDemoMemberById(id);
    if (!user) {
      throw new Error('Member not found');
    }
    const updated = updateDemoMember(id, { status: body.status ?? user.status });
    return of(updated ?? user).pipe(delay(200));
  }

  updateMemberRoles(_idpSub: string, _roleCodes: string[]): Observable<void> {
    return of(undefined).pipe(delay(100));
  }

  listMemberRoles(idpSub: string): Observable<string[]> {
    const fromList = [getDemoMyProfile(), findDemoMemberById('demo-user-2')]
      .find(user => user?.idpSub === idpSub);
    return of([...(fromList?.roleCodes ?? [])]).pipe(delay(80));
  }

  listRoleGroupsCatalog(): Observable<KeyValue[]> {
    return of(DEMO_MEMBER_REF_DATA['availableRoleGroups'] as KeyValue[]).pipe(delay(80));
  }

  listMemberRoleGroups(idpSub: string): Observable<string[]> {
    const fromList = [getDemoMyProfile(), findDemoMemberById('demo-user-2')]
      .find(user => user?.idpSub === idpSub);
    return of([...(fromList?.roleGroupCodes ?? [])]).pipe(delay(80));
  }

  updateMemberRoleGroups(idpSub: string, groupKeys: string[]): Observable<void> {
    const user = [getDemoMyProfile(), findDemoMemberById('demo-user-2')]
      .find(item => item?.idpSub === idpSub);
    if (user) {
      updateDemoMember(user.id, { roleGroupCodes: [...groupKeys] });
    }
    return of(undefined).pipe(delay(100));
  }

  listPermissionsCatalog(): Observable<KeyValue[]> {
    return of(DEMO_MEMBER_REF_DATA['availablePermissions'] as KeyValue[] ?? []).pipe(delay(80));
  }

  listMemberPermissions(idpSub: string): Observable<string[]> {
    const fromList = [getDemoMyProfile(), findDemoMemberById('demo-user-2')]
      .find(user => user?.idpSub === idpSub);
    return of([...(fromList?.permissionCodes ?? [])]).pipe(delay(80));
  }

  updateMemberPermissions(idpSub: string, permissionKeys: string[]): Observable<void> {
    const user = [getDemoMyProfile(), findDemoMemberById('demo-user-2')]
      .find(item => item?.idpSub === idpSub);
    if (user) {
      updateDemoMember(user.id, { permissionCodes: [...permissionKeys] });
    }
    return of(undefined).pipe(delay(100));
  }

  listMemberConnections(id: string): Observable<MemberLinkedConnection[]> {
    return of(getDemoMemberConnections(id)).pipe(delay(80));
  }

  grantMemberConnection(id: string, connectionKey: string): Observable<void> {
    grantDemoMemberConnection(id, connectionKey);
    return of(undefined).pipe(delay(120));
  }

  revokeMemberConnection(id: string, connectionKey: string): Observable<void> {
    revokeDemoMemberConnection(id, connectionKey);
    return of(undefined).pipe(delay(120));
  }

  fetchDocuments(_entityId: string, _refData?: Record<string, KeyValue[]>): Observable<Doc[]> {
    return of([]).pipe(delay(100));
  }

  uploadPicture(id: string, base64: string, _refData?: Record<string, KeyValue[]>): Observable<Doc> {
    const pictureUrl = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;
    const user = findDemoMemberById(id) ?? getDemoMyProfile();
    updateDemoMember(user.id, { picture: pictureUrl });
    return of({ id: pictureUrl, name: 'profile_pic.png' } as unknown as Doc).pipe(delay(100));
  }

  uploadDocument(_id: string, _base64: string, _entityType: string, filename: string): Observable<Doc> {
    return of({ id: 'demo-doc', name: filename } as unknown as Doc).pipe(delay(100));
  }

  initPasswordChange(_currentPassword: string, _redirectUrl?: string): Observable<{ ticketUrl: string }> {
    return of({ ticketUrl: 'https://example.auth0.com/lo/reset?ticket=demo' }).pipe(delay(100));
  }
}
