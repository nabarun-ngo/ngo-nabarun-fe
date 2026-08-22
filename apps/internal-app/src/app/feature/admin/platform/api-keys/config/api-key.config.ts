import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import { catchError, map, of, throwError } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { notifyFeatureError } from 'src/app/shared/utils/http-error.util';
import {
  ADMIN_ALL_CHIP,
  ADMIN_LIST_CHIPS,
  adminCriteriaToValues,
  adminListRouteBindings,
  adminValuesToCriteria,
  buildEmptyAdminFilterForm,
  buildEmptyAppliedFilters,
  cloneAdminCriteria,
  countEmptySheetFilters,
  emptyAdminCriteria,
  isAdminAllChip,
  removeAdminFilterById,
  type AdminEmptyCriteria,
} from '../../../shared/admin-list.helpers';
import type { ApiKeyDataSource } from '../data/api-key-data.source';
import type { AdminApiKey } from '../domain';
import {
  apiKeyToEditValues,
  buildApiKeyCreateForm,
  buildApiKeyEditForm,
  defaultApiKeyCreateValues,
} from './api-key.forms';
import { resolveApiKeyPermissions } from './api-key.rules';
import { buildApiKeyDetailSections, mapApiKeyListRow } from './api-key.view';

export type ApiKeyListConfig = ListDashboardConfig<
  AdminApiKey,
  AdminEmptyCriteria,
  unknown,
  ApiKeyOperations
>;

export type ApiKeyOperations = {
  revokeKey(key: AdminApiKey): void;
};

const PAGE_SIZE = 20;

export function createApiKeyListConfig(deps: {
  data: ApiKeyDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
}): ApiKeyListConfig {
  const permissions = () => resolveApiKeyPermissions(deps.authorization);

  return {
    meta: {
      id: 'admin-api-keys',
      title: 'API keys',
      pageName: 'API keys',
      searchPlaceholder: 'Search by name',
      emptyMessage: 'No API keys matched your search.',
      detailRouteSync: { idParam: 'keyId' },
    },
    list: {
      pageSize: PAGE_SIZE,
      chips: [...ADMIN_LIST_CHIPS],
      defaultChip: ADMIN_ALL_CHIP,
      isValidChip: isAdminAllChip,
      route: {
        chipConfig: { defaultChip: ADMIN_ALL_CHIP, normalize: () => ADMIN_ALL_CHIP },
        filterBindings: adminListRouteBindings(),
      },
      cloneCriteria: cloneAdminCriteria,
      getDefaultCriteriaForChip: () => emptyAdminCriteria(),
      buildFilterFormDefinition: () => buildEmptyAdminFilterForm(),
      criteriaToFilterFormValues: () => adminCriteriaToValues(),
      filterFormValuesToCriteria: (_c, values, criteria) => adminValuesToCriteria(values, criteria),
      buildAppliedFilters: () => buildEmptyAppliedFilters(),
      countActiveSheetFilters: () => countEmptySheetFilters(),
      removeFilterById: removeAdminFilterById,
      loadPage: (query) => deps.data.list(query.pageIndex, PAGE_SIZE).pipe(
        map(({ items, totalSize }) => ({
          items: items
            .filter(k => !query.searchText || k.name.toLowerCase().includes(query.searchText.toLowerCase()))
            .map(mapApiKeyListRow),
          totalSize,
          pageIndex: query.pageIndex,
          pageSize: PAGE_SIZE,
        })),
        catchError(() => of({
          items: [],
          totalSize: 0,
          pageIndex: query.pageIndex,
          pageSize: PAGE_SIZE,
        })),
      ),
      mapToListRow: entity => mapApiKeyListRow(entity),
    },
    detail: {
      getTitle: key => key.name,
      buildViewSections: key => buildApiKeyDetailSections(key),
      fetchById: () => of(undefined),
      findInList: (items, id) => items
        .map(i => i.payload as AdminApiKey | undefined)
        .find(i => i?.id === id),
      edit: {
        buildEditSummary: ctx => [
          { label: 'Name', value: ctx.entity.name },
        ],
        buildEditForm: ctx => buildApiKeyEditForm(ctx.refData),
        entityToEditValues: apiKeyToEditValues,
        save: ctx => {
          const permissionValues = Array.isArray(ctx.values['permissions'])
            ? (ctx.values['permissions'] as string[])
            : [];
          if (!permissionValues.length) {
            return throwError(() => new Error('Select at least one permission.'));
          }
          return deps.data.updatePermissions(ctx.entity.id, permissionValues);
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: () => !!permissions().showCreateFab,
      buildCreateForm: refData => buildApiKeyCreateForm(refData),
      defaultCreateValues: () => defaultApiKeyCreateValues(),
      createSave: (values) => {
        const name = String(values['name'] ?? '').trim();
        const permissionValues = Array.isArray(values['permissions']) ? (values['permissions'] as string[]) : [];
        if (!name) return throwError(() => new Error('Key name is required.'));
        if (!permissionValues.length) return throwError(() => new Error('Select at least one permission.'));
        return deps.data.create({
          name,
          permissions: permissionValues,
          expiresAt: values['expiresAt'] ? String(values['expiresAt']) : undefined,
        });
      },
    },
    permissions: { resolve: permissions },
    operations: {
      revokeKey(key: AdminApiKey) {
        deps.modal.openNotificationModal({
          title: 'Revoke API key?',
          description: `Revoke "${key.name}"? Any integration using this key will stop working immediately.`,
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.revoke(key.id).subscribe({
            next: () => deps.modal.openNotificationModal({
              title: 'Revoked',
              description: key.name,
            }, 'notification', 'success'),
            error: err => notifyFeatureError(deps.modal, err, {
              title: 'Revoke failed',
              description: err?.message ?? 'Unable to revoke key.',
            }),
          });
        });
      },
    },
    actions: {
      detailFooter: [
        {
          id: 'revoke',
          label: 'Revoke',
          appearance: 'secondary',
          when: ctx => !!permissions().canRevoke && (ctx.entity as AdminApiKey)?.status !== 'expired',
          run: 'revokeKey',
        },
      ],
      floating: [
        {
          id: 'create',
          label: 'Generate key',
          appearance: 'fab',
          icon: 'add',
          when: () => !!permissions().showCreateFab,
          run: 'openCreate',
        },
      ],
    },
  };
}
