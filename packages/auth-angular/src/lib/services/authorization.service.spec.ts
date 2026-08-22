import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { snapshotFromCurrentUser } from '@nabarun-ngo/auth-core';
import { AuthorizationService } from './authorization.service';
import { RbacStateService } from './rbac-state.service';
import { RBAC_DATA_SOURCE } from '../tokens/rbac-data-source.token';

describe('AuthorizationService', () => {
  let service: AuthorizationService;
  let state: RbacStateService;

  const globalUser = snapshotFromCurrentUser({
    idpSub: 'auth0|abc',
    permissions: ['read:projects', 'update:users'],
    userRoles: ['admin'],
    roleGroups: ['field_team'],
    scopedRoles: {
      'project:proj-A': {
        permissions: ['update:project'],
        roles: ['volunteer_coordinator'],
        roleGroups: [],
      },
    },
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthorizationService,
        RbacStateService,
        {
          provide: RBAC_DATA_SOURCE,
          useValue: {
            fetchCurrentUser: () => of({
              idpSub: 'auth0|abc',
              permissions: ['read:projects', 'update:users'],
              userRoles: ['admin'],
              roleGroups: ['field_team'],
              scopedRoles: globalUser.scopedRoles,
            }),
          },
        },
      ],
    });
    service = TestBed.inject(AuthorizationService);
    state = TestBed.inject(RbacStateService);
  });

  it('loads global permissions from /api/auth/me snapshot', async () => {
    await service.load();
    expect(service.hasPermission('read:projects')).toBeTrue();
    expect(service.hasPermission('delete:jobs')).toBeFalse();
  });

  it('unions global and scoped permissions for context checks', async () => {
    state.setSnapshot(globalUser);
    const ctx = service.contextFrom('project', 'proj-A');
    expect(service.hasPermissionInContext('read:projects', ctx)).toBeTrue();
    expect(service.hasPermissionInContext('update:project', ctx)).toBeTrue();
    expect(service.effectivePermissions(ctx)).toContain('read:projects');
    expect(service.effectivePermissions(ctx)).toContain('update:project');
  });

  it('scoped-only permissions are not visible outside context', () => {
    state.setSnapshot(globalUser);
    expect(service.hasPermission('update:project')).toBeFalse();
    expect(
      service.hasPermissionInContext('update:project', service.contextFrom('project', 'proj-A')),
    ).toBeTrue();
  });

  it('hasAnyRole checks role keys', () => {
    state.setSnapshot(globalUser);
    expect(service.hasAnyRole('admin', 'guest')).toBeTrue();
  });

  it('clear resets loaded state', () => {
    state.setSnapshot(globalUser);
    service.clear();
    expect(state.loaded).toBeFalse();
    expect(service.hasPermission('read:projects')).toBeFalse();
  });
});
