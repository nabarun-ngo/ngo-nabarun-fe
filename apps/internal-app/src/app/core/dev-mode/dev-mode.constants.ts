import { RbacSnapshotDto } from '@nabarun-ngo/auth-angular';
import { SCOPE } from '../constant/auth-scope.const';

/** Flatten all scope strings from the SCOPE constant tree. */
export function flattenAllScopes(scopeTree: typeof SCOPE): string[] {
  const values: string[] = [];
  for (const group of Object.values(scopeTree)) {
    for (const scope of Object.values(group)) {
      values.push(scope);
    }
  }
  return values;
}

export const DEMO_RBAC_SNAPSHOT: RbacSnapshotDto = {
  idpSub: 'dev-mode-bypass',
  userId: 'demo-user',
  permissions: flattenAllScopes(SCOPE),
  userRoles: ['dev-admin'],
  roleGroups: [],
  scopedRoles: {},
};

export const DEMO_USER_GIVEN_NAME = 'Demo User';
