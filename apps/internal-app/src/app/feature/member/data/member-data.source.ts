import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import {
  CreateUserDto,
  UpdateUserAdminDto,
  UpdateUserProfileDto,
} from 'src/app/core/api/api-client/models';
import { Doc, mapDocDtoToDoc } from 'src/app/shared/models/document.model';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { MemberLinkedConnection, MemberListCriteria, MemberRefData, PagedUser, User } from '../domain';

export interface MemberListFilter {
  firstName?: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  status?: User['status'];
}

export interface MemberListOptions {
  pageIndex?: number;
  pageSize?: number;
  filter?: MemberListFilter;
}

export interface MemberListPageQuery {
  chipId?: string;
  criteria?: MemberListCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
  append?: boolean;
}

export interface MemberDataSource {
  loadListPage(query: MemberListPageQuery): Observable<PagedUser>;
  fetchMembers(options: MemberListOptions): Observable<PagedUser>;
  fetchRefData(countryCode?: string, stateCode?: string): Observable<MemberRefData | undefined>;
  fetchMemberById(id: string): Observable<User | undefined>;
  getMyProfile(): Observable<User>;
  createMember(body: CreateUserDto): Observable<User>;
  deleteMember(id: string): Observable<void>;
  updateMyProfile(body: UpdateUserProfileDto): Observable<User>;
  updateMemberProfile(id: string, body: UpdateUserProfileDto): Observable<User>;
  updateMemberAdmin(id: string, body: UpdateUserAdminDto): Observable<User>;
  updateMemberRoles(idpSub: string, roleCodes: string[]): Observable<void>;
  /** Active role keys for a member from Auth RBAC (not denormalized profile keys). */
  listMemberRoles(idpSub: string): Observable<string[]>;
  listRoleGroupsCatalog(): Observable<KeyValue[]>;
  listMemberRoleGroups(idpSub: string): Observable<string[]>;
  updateMemberRoleGroups(idpSub: string, groupKeys: string[]): Observable<void>;
  listPermissionsCatalog(): Observable<KeyValue[]>;
  listMemberPermissions(idpSub: string): Observable<string[]>;
  updateMemberPermissions(idpSub: string, permissionKeys: string[]): Observable<void>;
  listMemberConnections(id: string): Observable<MemberLinkedConnection[]>;
  grantMemberConnection(id: string, connectionKey: string): Observable<void>;
  revokeMemberConnection(id: string, connectionKey: string): Observable<void>;
  fetchDocuments(entityId: string, refData?: Record<string, KeyValue[]>): Observable<Doc[]>;
  uploadPicture(id: string, base64: string, refData?: Record<string, KeyValue[]>): Observable<Doc>;
  uploadDocument(id: string, base64: string, entityType: string, filename: string): Observable<Doc>;
  initPasswordChange(currentPassword: string, redirectUrl?: string): Observable<{ ticketUrl: string }>;
}

export const MemberDataSource = new InjectionToken<MemberDataSource>('MemberDataSource');

export function mapApiDocsToDocs(docs: Array<Record<string, unknown>> | undefined): Doc[] {
  return (docs ?? []).map(d => mapDocDtoToDoc(d as never));
}
