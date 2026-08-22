
export interface RbacEntityContext {
  entityId: string;
  entityType: string;
}

export interface RbacAccessSnapshot {
  permissions: string[];
  roles: string[];
  roleGroups: string[];
}

export interface RbacScopedAccessSnapshot extends RbacAccessSnapshot, RbacEntityContext { }

/** Client-side snapshot of resolved RBAC */
export interface RbacUserAccessSnapshot extends RbacAccessSnapshot {
  idpSub: string;
  userId?: string;
  scopedAccess: RbacScopedAccessSnapshot[];
}


