/** Entity scope for permission checks (e.g. project-level access). */
export interface RbacContext {
  entityType: string;
  entityId: string;
}

export interface ScopedAccess {
  permissions: string[];
  roles: string[];
  roleGroups: string[];
}

/** Client-side snapshot of resolved RBAC from GET /api/auth/me. */
export interface RbacSnapshot {
  idpSub: string;
  userId?: string;
  permissions: string[];
  userRoles: string[];
  roleGroups: string[];
  scopedRoles: Record<string, ScopedAccess>;
}

export function scopedRoleKey(context: RbacContext): string {
  return `${context.entityType}:${context.entityId}`;
}

export function contextFrom(entityType: string, entityId: string): RbacContext {
  return { entityType, entityId };
}

export function snapshotFromCurrentUser(dto: {
  idpSub: string;
  userId?: string;
  permissions?: string[];
  userRoles?: string[];
  roleGroups?: string[];
  scopedRoles?: Record<string, Record<string, string[]>>;
}): RbacSnapshot {
  const scopedRoles: Record<string, ScopedAccess> = {};
  if (dto.scopedRoles) {
    for (const [key, value] of Object.entries(dto.scopedRoles)) {
      scopedRoles[key] = {
        permissions: value['permissions'] ?? [],
        roles: value['roles'] ?? [],
        roleGroups: value['roleGroups'] ?? [],
      };
    }
  }
  return {
    idpSub: dto.idpSub,
    userId: dto.userId,
    permissions: dto.permissions ?? [],
    userRoles: dto.userRoles ?? [],
    roleGroups: dto.roleGroups ?? [],
    scopedRoles,
  };
}
