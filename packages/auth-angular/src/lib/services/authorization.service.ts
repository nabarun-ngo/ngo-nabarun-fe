import { Inject, Injectable } from '@angular/core';
import { filter, firstValueFrom, Observable, take } from 'rxjs';
import {
  RbacUserAccessSnapshot,
} from '@nabarun-ngo/auth-core';
import { RBAC_DATA_SOURCE, RbacDataSource } from '../tokens/rbac-data-source.token';
import { RbacStateService } from './rbac-state.service';

interface EntityContext {
  entityId: string;
  entityType: string;
}

@Injectable({ providedIn: 'root' })
export class AuthorizationService<T extends RbacUserAccessSnapshot = RbacUserAccessSnapshot> {
  get snapshot$():Observable<T | null> { return this.state.snapshot$; }
  get loaded$() { return this.state.loaded$; }

  constructor(
    @Inject(RBAC_DATA_SOURCE) private dataSource: RbacDataSource<T>,
    private state: RbacStateService<T>,
  ) { }

  async load(): Promise<void> {
    const dto = await firstValueFrom(this.dataSource.fetchCurrentUserSnapshot());
    this.state.setSnapshot(dto);
  }

  /** Load RBAC state from a DTO that has already been fetched by the caller. */
  loadWith(dto: T): void {
    this.state.setSnapshot(dto);
  }

  async refresh(): Promise<void> {
    await this.load();
  }

  clear(): void {
    this.state.clear();
  }

  async waitUntilLoaded(): Promise<RbacUserAccessSnapshot> {
    if (this.state.loaded && this.state.snapshot) {
      return this.state.snapshot;
    }
    return firstValueFrom(
      this.state.snapshot$.pipe(
        filter((snapshot): snapshot is T => snapshot !== null),
        take(1),
      ),
    );
  }

  effectivePermissions(context?: EntityContext): string[] {
    const snapshot = this.state.snapshot;
    if (!snapshot) {
      return [];
    }
    const global = snapshot.permissions;
    if (!context) {
      return [...global];
    }
    const scoped = snapshot.scopedAccess.find((scope) => scope.entityId === context.entityId && scope.entityType === context.entityType)?.permissions ?? [];
    return [...new Set([...global, ...scoped])];
  }

  effectiveRoles(context?: EntityContext): string[] {
    const snapshot = this.state.snapshot;
    if (!snapshot) {
      return [];
    }
    const global = snapshot.roles;
    if (!context) {
      return [...global];
    }
    const scoped = snapshot.scopedAccess.find((scope) => scope.entityId === context.entityId && scope.entityType === context.entityType)?.roles ?? [];
    return [...new Set([...global, ...scoped])];
  }

  effectiveRoleGroups(context?: EntityContext): string[] {
    const snapshot = this.state.snapshot;
    if (!snapshot) {
      return [];
    }
    const global = snapshot.roleGroups;
    if (!context) {
      return [...global];
    }
    const scoped = snapshot.scopedAccess.find((scope) => scope.entityId === context.entityId && scope.entityType === context.entityType)?.roleGroups ?? [];
    return [...new Set([...global, ...scoped])];
  }
}
