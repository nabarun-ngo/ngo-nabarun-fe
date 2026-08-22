import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import { catchError, forkJoin, map, of, switchMap, tap, throwError } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { notifyFeatureError } from 'src/app/shared/utils/http-error.util';
import {
  adminCriteriaToValues,
  adminListRouteBindings,
  adminValuesToCriteria,
  buildEmptyAdminFilterForm,
  buildEmptyAppliedFilters,
  cloneAdminCriteria,
  countEmptySheetFilters,
  emptyAdminCriteria,
  filterBySearchText,
  removeAdminFilterById,
  type AdminEmptyCriteria,
} from '../../../shared/admin-list.helpers';
import type { RoleCatalogDataSource } from '../data/role-catalog-data.source';
import type { RoleCatalogContext, RoleCatalogItem, RoleCatalogKind } from '../domain';
import {
  buildRoleCatalogCreateForm,
  buildRoleCatalogEditForm,
  defaultRoleCatalogCreateValues,
  roleCatalogKindLabel,
  roleCatalogToEditValues,
} from './role-catalog.forms';
import {
  GROUP_CHIP,
  PERMISSION_CHIP,
  ROLE_CATALOG_CHIPS,
  ROLE_CHIP,
  allowedCreateKinds,
  canCreateKind,
  canDeleteKind,
  canUpdateKind,
  chipToKind,
  isRoleCatalogChip,
  kindToChip,
  normalizeRoleCatalogChip,
  resolveRoleCatalogPermissions,
} from './role-catalog.rules';
import { buildRoleCatalogDetailSections, mapRoleCatalogListRow } from './role-catalog.view';

export type RoleCatalogListConfig = ListDashboardConfig<
  RoleCatalogItem,
  AdminEmptyCriteria,
  RoleCatalogContext,
  { deleteCatalogItem(item: RoleCatalogItem): void }
>;

const PAGE_SIZE = 20;

function sameKeySet(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every(key => set.has(key));
}

export function createRoleCatalogListConfig(deps: {
  data: RoleCatalogDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  context: RoleCatalogContext;
  reloadList?: () => void;
  showChip?: (chipId: string) => void;
}): RoleCatalogListConfig {
  const permissions = () => resolveRoleCatalogPermissions(deps.authorization);

  /** Preselects the type matching the chip the operator is browsing. */
  const defaultCreateKind = (): RoleCatalogKind => {
    const allowed = allowedCreateKinds(permissions());
    const fromChip = chipToKind(deps.context.activeChip);
    return allowed.includes(fromChip) ? fromChip : (allowed[0] ?? fromChip);
  };

  const loadByChip = (chipId: string) => {
    if (chipId === GROUP_CHIP) return deps.data.listGroups();
    if (chipId === PERMISSION_CHIP) return deps.data.listPermissions();
    return deps.data.listRoles();
  };

  const refreshMappingOptions = () =>
    forkJoin([deps.data.listPermissions(), deps.data.listRoles()]).pipe(
      map(([perms, roles]) => {
        deps.context.permissionOptions = perms.map(p => ({ key: p.key, label: p.key }));
        deps.context.roleOptions = roles.map(r => ({ key: r.key, label: r.key }));
        return null;
      }),
      catchError(() => of(null)),
    );

  return {
    meta: {
      id: 'admin-role-catalog',
      title: 'Roles Catalog',
      pageName: 'Roles Catalog',
      searchPlaceholder: 'Search by key',
      emptyMessage: 'Nothing to show.',
      detailRouteSync: { idParam: 'roleCatalogId' },
    },
    list: {
      pageSize: PAGE_SIZE,
      chips: [...ROLE_CATALOG_CHIPS],
      defaultChip: ROLE_CHIP,
      isValidChip: isRoleCatalogChip,
      route: {
        chipConfig: { defaultChip: ROLE_CHIP, normalize: normalizeRoleCatalogChip },
        filterBindings: adminListRouteBindings(),
      },
      cloneCriteria: cloneAdminCriteria,
      getDefaultCriteriaForChip: () => emptyAdminCriteria(),
      buildFilterFormDefinition: () => buildEmptyAdminFilterForm(),
      criteriaToFilterFormValues: () => adminCriteriaToValues(),
      filterFormValuesToCriteria: (_c, v, criteria) => adminValuesToCriteria(v, criteria),
      buildAppliedFilters: () => buildEmptyAppliedFilters(),
      countActiveSheetFilters: () => countEmptySheetFilters(),
      removeFilterById: removeAdminFilterById,
      loadPage: query => {
        const chipId = normalizeRoleCatalogChip(query.chipId);
        deps.context.activeChip = chipId;
        return refreshMappingOptions().pipe(
          switchMap(() => loadByChip(chipId)),
          map(items => {
            const filtered = filterBySearchText(items, query.searchText, i => i.key);
            return {
              items: filtered.map(mapRoleCatalogListRow),
              totalSize: filtered.length,
              pageIndex: 0,
              pageSize: PAGE_SIZE,
            };
          }),
          catchError(() => of({ items: [], totalSize: 0, pageIndex: 0, pageSize: PAGE_SIZE })),
        );
      },
      mapToListRow: entity => mapRoleCatalogListRow(entity),
    },
    detail: {
      getTitle: item => item.key,
      getEntityId: item => item.id,
      buildViewSections: item => buildRoleCatalogDetailSections(item),
      fetchById: id => forkJoin([
        deps.data.listRoles(),
        deps.data.listGroups(),
        deps.data.listPermissions(),
      ]).pipe(
        map(([roles, groups, permissions]) =>
          [...roles, ...groups, ...permissions].find(i => i.id === id),
        ),
        catchError(() => of(undefined)),
      ),
      findInList: (items, id) =>
        items.map(i => i.payload as RoleCatalogItem | undefined).find(i => i?.id === id),
      primaryAction: {
        label: 'Edit',
        when: ctx => canUpdateKind(permissions(), ctx.entity.kind),
      },
      edit: {
        buildEditSummary: ctx => [
          { label: 'Key', value: ctx.entity.key },
          { label: 'Type', value: roleCatalogKindLabel(ctx.entity.kind) },
        ],
        buildEditForm: ctx => buildRoleCatalogEditForm(ctx.entity.kind, {
          permissionOptions: deps.context.permissionOptions,
          roleOptions: deps.context.roleOptions,
        }),
        entityToEditValues: roleCatalogToEditValues,
        save: ctx => {
          const description = String(ctx.values['description'] ?? '').trim() || undefined;
          const memberKeys = Array.isArray(ctx.values['memberKeys'])
            ? (ctx.values['memberKeys'] as string[])
            : [];

          if (ctx.entity.kind === 'permission') {
            return deps.data.updatePermission(ctx.entity.key, description);
          }

          if (ctx.entity.kind === 'role') {
            const descriptionChanged = (description ?? '') !== (ctx.entity.description ?? '');
            const membersChanged = !sameKeySet(memberKeys, ctx.entity.memberKeys);
            const update$ = descriptionChanged
              ? deps.data.updateRole(ctx.entity.key, description)
              : of(ctx.entity);
            return update$.pipe(
              switchMap(item =>
                membersChanged
                  ? deps.data.syncRolePermissions(item.key, memberKeys)
                  : of(item),
              ),
            );
          }

          const descriptionChanged = (description ?? '') !== (ctx.entity.description ?? '');
          const membersChanged = !sameKeySet(memberKeys, ctx.entity.memberKeys);
          const update$ = descriptionChanged
            ? deps.data.updateGroup(ctx.entity.key, description)
            : of(ctx.entity);
          return update$.pipe(
            switchMap(item =>
              membersChanged
                ? deps.data.syncGroupRoles(item.key, memberKeys)
                : of(item),
            ),
          );
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: () => allowedCreateKinds(permissions()).length > 0,
      buildCreateForm: () => buildRoleCatalogCreateForm(allowedCreateKinds(permissions())),
      defaultCreateValues: () => defaultRoleCatalogCreateValues(defaultCreateKind()),
      createSave: values => {
        const kind = values['kind'] as RoleCatalogKind | undefined;
        const key = String(values['key'] ?? '').trim();
        const description = String(values['description'] ?? '').trim() || undefined;
        if (!kind) return throwError(() => new Error('Type is required.'));
        if (!key) return throwError(() => new Error('Key is required.'));
        if (!canCreateKind(permissions(), kind)) {
          return throwError(() => new Error('You are not allowed to create this type.'));
        }
        const created$ =
          kind === 'permission'
            ? deps.data.createPermission({ key, description })
            : kind === 'group'
              ? deps.data.createGroup({ key, description })
              : deps.data.createRole({ key, description });
        // The new entry belongs to its own chip, so follow it there when the
        // operator created a type other than the one being browsed.
        return created$.pipe(tap(() => {
          const chipId = kindToChip(kind);
          if (chipId !== deps.context.activeChip) deps.showChip?.(chipId);
        }));
      },
    },
    permissions: { resolve: permissions },
    operations: {
      deleteCatalogItem(item: RoleCatalogItem) {
        deps.modal.openNotificationModal({
          title: `Delete ${item.kind}?`,
          description: `Soft-delete "${item.key}"? This cannot be used while deleted.`,
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          const delete$ =
            item.kind === 'permission'
              ? deps.data.deletePermission(item.key)
              : item.kind === 'group'
                ? deps.data.deleteGroup(item.key)
                : deps.data.deleteRole(item.key);
          delete$.subscribe({
            next: () => {
              deps.reloadList?.();
              deps.modal.openNotificationModal({
                title: 'Deleted',
                description: item.key,
              }, 'notification', 'success');
            },
            error: err => notifyFeatureError(deps.modal, err, {
              title: 'Delete failed',
              description: err?.error?.message ?? err?.message ?? 'Unable to delete.',
            }),
          });
        });
      },
    },
    actions: {
      detailMenu: [
        {
          id: 'delete',
          label: 'Delete',
          icon: 'delete',
          when: ctx => {
            const entity = ctx.entity as RoleCatalogItem | undefined;
            return !!entity && canDeleteKind(permissions(), entity.kind);
          },
          run: 'deleteCatalogItem',
        },
      ],
      floating: [
        {
          id: 'create',
          label: 'Create',
          appearance: 'fab',
          icon: 'add',
          when: () => allowedCreateKinds(permissions()).length > 0,
          run: 'openCreate',
        },
      ],
    },
  };
}
