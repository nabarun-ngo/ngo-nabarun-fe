import { snapshotFromCurrentUser } from '@nabarun-ngo/auth-core';
import { CurrentUserResponseDto } from '../../api/api-client/models/current-user-response-dto';
import { AppRbacUserAccessSnapshot } from '../tokens/user-rbac.token';

export function mapCurrentUserToRbacSnapshot(
  dto: CurrentUserResponseDto,
): AppRbacUserAccessSnapshot {
  const base = snapshotFromCurrentUser({
    idpSub: dto.idpSub ?? '',
    id: dto.id,
    permissions: dto.permissions,
    userRoles: dto.userRoles,
    roleGroups: dto.roleGroups,
    scopedAccess: dto.scopedAccess,
  });
  const attributes = dto.attributes as Record<string, unknown> | undefined;
  return {
    ...base,
    profileComplete: attributes?.['profileComplete'] === true,
    fullName: dto.fullName,
  };
}
