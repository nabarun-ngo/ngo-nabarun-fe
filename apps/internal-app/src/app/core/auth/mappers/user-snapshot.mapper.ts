import { RbacScopedAccessSnapshot, RbacUserAccessSnapshot } from "@nabarun-ngo/auth-core";
import { CurrentUserResponseDto, EntityScopeResponseDto } from "../../api/api-client/models";
import { AppRbacUserAccessSnapshot } from "../tokens/user-rbac.token";

function toScopedAccess(access: EntityScopeResponseDto): RbacScopedAccessSnapshot {
    return {
        entityId: access.entityId,
        entityType: access.entityType,
        permissions: access.permissions,
        roles: access.userRoles,
        roleGroups: access.roleGroups,
    }
}

export function mapCurrentUserToRbacSnapShot(user: CurrentUserResponseDto): AppRbacUserAccessSnapshot {
    return {
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        permissions: user.permissions,
        roles: user.userRoles,
        roleGroups: user.roleGroups,
        scopedAccess: (user.scopedAccess || []).map(toScopedAccess),
        fullName: user.fullName,
        id: user.id,
        idpSub: user.idpSub,
        profileComplete: (user.attributes as Record<string, any>)['profileComplete'] === 'true',
        userId: user.id,
    } as AppRbacUserAccessSnapshot;
}