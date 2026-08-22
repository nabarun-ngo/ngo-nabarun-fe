import {
  LinkedConnectionDto,
  UserListResponseDto,
  UserRefDataResponseDto,
  UserResponseDto,
} from 'src/app/core/api/api-client/models';
import { mapPagedResult } from 'src/app/shared/models/paged-result.model';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { UserConstant } from '../config/member.rules';
import { MemberLinkedConnection, PagedUser, Role, User } from '../domain';

type RefDataItem = {
  key?: string;
  value?: string;
  displayValue?: string;
  description?: string;
  countryCode?: string;
  stateCode?: string;
};

function titleCaseStatus(status: string): string {
  return status
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function mapRefItems(items: RefDataItem[] | undefined): KeyValue[] {
  return (items ?? [])
    .filter(item => !!item.key)
    .map(item => ({
      key: item.key!,
      displayValue: item.displayValue ?? item.value ?? item.key!,
      value: item.value,
      description: item.description,
      countryCode: item.countryCode,
      stateCode: item.stateCode,
    }));
}

function mapStatusItems(statuses: string[] | undefined): KeyValue[] {
  return (statuses ?? [])
    .filter(status => !!status)
    .map(status => ({
      key: status,
      displayValue: titleCaseStatus(status),
      value: status,
    }));
}

/** Normalizes USER reference-data DTO to dashboard KeyValue buckets. */
export function mapUserRefData(dto?: UserRefDataResponseDto | null): Record<string, KeyValue[]> {
  if (!dto) {
    return {};
  }
  return {
    [UserConstant.refDataKey.userStatuses]: mapStatusItems(dto.userStatuses),
    [UserConstant.refDataKey.userTitles]: mapRefItems(dto.userTitles as RefDataItem[]),
    [UserConstant.refDataKey.userGenders]: mapRefItems(dto.userGenders as RefDataItem[]),
    [UserConstant.refDataKey.documentTypes]: mapRefItems(dto.documentTypes as RefDataItem[]),
    [UserConstant.refDataKey.countries]: mapRefItems(dto.countries as RefDataItem[]),
    [UserConstant.refDataKey.states]: mapRefItems(dto.states as RefDataItem[]),
    [UserConstant.refDataKey.districts]: mapRefItems(dto.districts as RefDataItem[]),
    [UserConstant.refDataKey.phoneCodes]: mapRefItems(dto.phoneCodes as RefDataItem[]),
    [UserConstant.refDataKey.availableRoles]: mapRefItems(dto.availableRoles as RefDataItem[]),
  };
}

/** Role key → display name, resolved from the RBAC role catalog. */
export type RoleLabelLookup = ReadonlyMap<string, string>;

export function mapUserDtoToUser(user: unknown, roleLabels?: RoleLabelLookup): User {
  const u = user as Record<string, unknown>;
  const roleKeys = Array.isArray(u['roleKeys'])
    ? (u['roleKeys'] as string[]).filter((k): k is string => typeof k === 'string' && !!k.trim())
    : undefined;
  const rolesFromDto = (u['roles'] as Array<Record<string, unknown>> | undefined) ?? [];
  const roles: Role[] = rolesFromDto.length
    ? rolesFromDto.map(role => ({
      roleCode: role['roleCode'] as string,
      description: role['description'] as string | undefined,
      roleName: role['roleName'] as string,
    } as Role))
    : (roleKeys ?? []).map(key => ({
      roleCode: key,
      roleName: roleLabels?.get(key) ?? key,
    } as Role));
  const roleCodes = roleKeys ?? roles.map(role => role.roleCode);
  return {
    about: u['about'] as string | undefined,
    activeDonor: !!u['activeDonor'],
    addressSame: (u['addressSame'] ?? u['isSameAddress']) as boolean | undefined,
    blocked: !!(u['blocked'] ?? u['status'] === 'BLOCKED'),
    createdOn: (u['createdOn'] ?? u['createdAt']) as string,
    dateOfBirth: u['dateOfBirth'] as string | undefined,
    email: u['email'] as string,
    firstName: u['firstName'] as string,
    fullName: u['fullName'] as string,
    gender: u['gender'] as string | undefined,
    id: u['id'] as string,
    lastName: u['lastName'] as string,
    loginMethod: (u['loginMethod'] as string[]) ?? [],
    middleName: u['middleName'] as string | undefined,
    permanentAddress: u['permanentAddress'] as User['permanentAddress'],
    picture: u['picture'] as string | undefined,
    presentAddress: u['presentAddress'] as User['presentAddress'],
    primaryNumber: (u['primaryNumber'] ?? u['primaryPhone']) as User['primaryNumber'],
    publicProfile: !!(u['publicProfile'] ?? u['isPublic']),
    roles,
    secondaryNumber: (u['secondaryNumber'] ?? u['secondaryPhone']) as User['secondaryNumber'],
    socialMediaLinks: ((u['socialMediaLinks'] as Array<Record<string, unknown>>) ?? []).map(link => ({
      linkName: link['linkName'] as string,
      linkType: link['linkType'] as User['socialMediaLinks'][number]['linkType'],
      linkValue: link['linkValue'] as string,
    })),
    status: u['status'] as User['status'],
    title: u['title'] as string | undefined,
    userId: (u['userId'] ?? u['id']) as string | undefined,
    idpSub: u['idpSub'] as string | undefined,
    roleHistory: u['roleHistory'] as User['roleHistory'],
    roleCodes,
    roleGroupCodes: Array.isArray(u['roleGroupCodes'])
      ? (u['roleGroupCodes'] as string[])
      : [],
    permissionCodes: Array.isArray(u['permissionCodes'])
      ? (u['permissionCodes'] as string[])
      : [],
  };
}

export function mapPagedUserDtoToPagedUser(
  dto: UserListResponseDto | Record<string, unknown>,
  roleLabels?: RoleLabelLookup,
): PagedUser {
  const d = dto as Record<string, unknown>;
  const normalized = {
    content: (d['items'] ?? d['content'] ?? []) as UserResponseDto[],
    totalSize: (d['total'] ?? d['totalSize'] ?? 0) as number,
    pageIndex: (d['pageIndex'] ?? 0) as number,
    pageSize: (d['pageSize'] ?? 0) as number,
  };
  return mapPagedResult(normalized, item => mapUserDtoToUser(item, roleLabels));
}

export function mapLinkedConnectionDto(dto: LinkedConnectionDto): MemberLinkedConnection {
  return {
    connectionKey: dto.connectionKey,
    connectionName: dto.connectionName,
    type: dto.type,
    provider: dto.provider,
    isPrimary: !!dto.isPrimary,
  };
}
