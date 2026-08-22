import { Inject, Injectable } from '@angular/core';
import { filter, firstValueFrom, take } from 'rxjs';
import {
  contextFrom,
  RbacContext,
  RbacSnapshot,
  scopedRoleKey,
  snapshotFromCurrentUser,
} from '@nabarun-ngo/auth-core';
import { RBAC_DATA_SOURCE, RbacDataSource, RbacSnapshotDto } from '../tokens/rbac-data-source.token';
import { RbacStateService } from './rbac-state.service';

@Injectable({ providedIn: 'root' })
export class AuthorizationService {
  get snapshot$() { return this.state.snapshot$; }
  get loaded$() { return this.state.loaded$; }

  constructor(
    @Inject(RBAC_DATA_SOURCE) private dataSource: RbacDataSource,
    private state: RbacStateService,
  ) {}

  contextFrom(entityType: string, entityId: string): RbacContext {
    return contextFrom(entityType, entityId);
  }

  async load(): Promise<void> {
    const dto = await firstValueFrom(this.dataSource.fetchCurrentUser());
    this.state.setSnapshot(snapshotFromCurrentUser(dto));
  }

  /** Load RBAC state from a DTO that has already been fetched by the caller. */
  loadWith(dto: RbacSnapshotDto): void {
    this.state.setSnapshot(snapshotFromCurrentUser(dto));
  }

  async refresh(): Promise<void> {
    await this.load();
  }

  clear(): void {
    this.state.clear();
  }

  async waitUntilLoaded(): Promise<RbacSnapshot> {
    if (this.state.loaded && this.state.snapshot) {
      return this.state.snapshot;
    }
    return firstValueFrom(
      this.state.snapshot$.pipe(
        filter((snapshot): snapshot is RbacSnapshot => snapshot !== null),
        take(1),
      ),
    );
  }

  effectivePermissions(context?: RbacContext): string[] {
    const snapshot = this.state.snapshot;
    if (!snapshot) {
      return [];
    }
    const global = snapshot.permissions;
    if (!context) {
      return [...global];
    }
    const scoped = snapshot.scopedRoles[scopedRoleKey(context)]?.permissions ?? [];
    return [...new Set([...global, ...scoped])];
  }

  effectiveRoles(context?: RbacContext): string[] {
    const snapshot = this.state.snapshot;
    if (!snapshot) {
      return [];
    }
    const global = snapshot.userRoles;
    if (!context) {
      return [...global];
    }
    const scoped = snapshot.scopedRoles[scopedRoleKey(context)]?.roles ?? [];
    return [...new Set([...global, ...scoped])];
  }
}
