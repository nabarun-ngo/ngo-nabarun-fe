import { RbacUserAccessSnapshot } from '@nabarun-ngo/auth-core';

/** Session snapshot from GET /auth/me, including app profile extras. */
export interface AppRbacUserAccessSnapshot extends RbacUserAccessSnapshot {
  profileComplete: boolean;
  fullName?: string;
}
