import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

/** Minimal shape of the RBAC snapshot DTO returned by the backend. */
export interface RbacSnapshotDto {
  idpSub: string;
  userId?: string;
  permissions?: string[];
  userRoles?: string[];
  roleGroups?: string[];
  scopedRoles?: Record<string, Record<string, string[]>>;
}

/**
 * Abstraction over the backend call that loads RBAC state.
 * Each consuming app provides its own implementation (e.g. a generated API client service).
 */
export interface RbacDataSource {
  fetchCurrentUser(): Observable<RbacSnapshotDto>;
}

export const RBAC_DATA_SOURCE = new InjectionToken<RbacDataSource>('RBAC_DATA_SOURCE');
