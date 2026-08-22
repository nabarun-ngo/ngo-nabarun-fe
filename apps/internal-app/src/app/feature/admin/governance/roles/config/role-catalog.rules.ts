import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { RoleCatalogContext, RoleCatalogKind } from '../domain';

export const ROLE_CHIP = 'roles';
export const GROUP_CHIP = 'groups';
export const PERMISSION_CHIP = 'permissions';

export const ROLE_CATALOG_CHIPS = [
  { id: ROLE_CHIP, label: 'Roles' },
  { id: GROUP_CHIP, label: 'Groups' },
  { id: PERMISSION_CHIP, label: 'Permissions' },
] as const;

export function isRoleCatalogChip(chipId: string): boolean {
  return chipId === ROLE_CHIP || chipId === GROUP_CHIP || chipId === PERMISSION_CHIP;
}

export function normalizeRoleCatalogChip(chipId?: string | null): string {
  if (chipId === GROUP_CHIP) return GROUP_CHIP;
  if (chipId === PERMISSION_CHIP) return PERMISSION_CHIP;
  return ROLE_CHIP;
}

export function chipToKind(chipId: string): RoleCatalogKind {
  if (chipId === GROUP_CHIP) return 'group';
  if (chipId === PERMISSION_CHIP) return 'permission';
  return 'role';
}

export function kindToChip(kind: RoleCatalogKind): string {
  if (kind === 'group') return GROUP_CHIP;
  if (kind === 'permission') return PERMISSION_CHIP;
  return ROLE_CHIP;
}

export function createRoleCatalogContext(): RoleCatalogContext {
  return {
    refData: {},
    activeChip: ROLE_CHIP,
    permissionOptions: [],
    roleOptions: [],
  };
}

export function resolveRoleCatalogPermissions(authorization: AuthorizationService) {
  const perms = authorization.effectivePermissions();
  const has = (scope: string) => perms.includes(scope);

  const canCreateRole = has(SCOPE.create.roles);
  const canCreateGroup = has(SCOPE.create.role_groups);
  const canCreatePermission = has(SCOPE.create.permissions);
  const canUpdateRole = has(SCOPE.update.roles);
  const canUpdateGroup = has(SCOPE.update.role_groups);
  const canUpdatePermission = has(SCOPE.update.permissions);
  const canDeleteRole = has(SCOPE.delete.roles);
  const canDeleteGroup = has(SCOPE.delete.role_groups);
  const canDeletePermission = has(SCOPE.delete.permissions);

  return {
    canCreateRole,
    canCreateGroup,
    canCreatePermission,
    canUpdateRole,
    canUpdateGroup,
    canUpdatePermission,
    canDeleteRole,
    canDeleteGroup,
    canDeletePermission,
    canUpdateEntity: canUpdateRole || canUpdateGroup || canUpdatePermission,
    showCreateFab: canCreateRole || canCreateGroup || canCreatePermission,
    canDelete: canDeleteRole || canDeleteGroup || canDeletePermission,
  };
}

export function canCreateKind(
  permissions: ReturnType<typeof resolveRoleCatalogPermissions>,
  kind: RoleCatalogKind,
): boolean {
  if (kind === 'group') return permissions.canCreateGroup;
  if (kind === 'permission') return permissions.canCreatePermission;
  return permissions.canCreateRole;
}

/** Types the operator may create, in the order shown on the create form. */
export function allowedCreateKinds(
  permissions: ReturnType<typeof resolveRoleCatalogPermissions>,
): RoleCatalogKind[] {
  return (['permission', 'role', 'group'] as RoleCatalogKind[])
    .filter(kind => canCreateKind(permissions, kind));
}

export function canUpdateKind(
  permissions: ReturnType<typeof resolveRoleCatalogPermissions>,
  kind: RoleCatalogKind,
): boolean {
  if (kind === 'group') return permissions.canUpdateGroup;
  if (kind === 'permission') return permissions.canUpdatePermission;
  return permissions.canUpdateRole;
}

export function canDeleteKind(
  permissions: ReturnType<typeof resolveRoleCatalogPermissions>,
  kind: RoleCatalogKind,
): boolean {
  if (kind === 'group') return permissions.canDeleteGroup;
  if (kind === 'permission') return permissions.canDeletePermission;
  return permissions.canDeleteRole;
}
