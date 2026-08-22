import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type {
  ListDashboardConfig,
  ListDashboardOperations,
} from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, throwError } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { compareObjects } from 'src/app/shared/utils/utilities.service';
import type { AssetDataSource } from '../data/asset-data.source';
import type {
  Asset,
  AssetFilterCriteria,
  AssetListContext,
  AssetPrimaryChip,
  AssetRefDataMap,
} from '../domain';
import {
  assignCustodyPayload,
  assetCreateEntity,
  assetCriteriaToValues,
  assetToUpdateValues,
  assetUpdatePatch,
  assetValuesToCriteria,
  buildAssetCreateForm,
  buildAssetEditSummary,
  buildAssetFilterForm,
  buildAssetUpdateForm,
  buildAssignCustodyForm,
  buildReturnCustodyForm,
  defaultAssetCreateValues,
  defaultAssignCustodyValues,
  defaultReturnCustodyValues,
  returnCustodyNotes,
} from './asset.forms';
import {
  ASSET_DEFAULT_CHIP,
  ASSET_LIST_CHIPS,
  buildAssetAppliedFilters,
  canAssignAsset,
  canReturnAsset,
  cloneAssetCriteria,
  countActiveAssetSheetFilters,
  getDefaultCriteriaForChip,
  isAssetPrimaryChip,
  normalizeAssetChip,
  removeAssetFilterById,
  resolveAssetPermissions,
} from './asset.rules';
import { buildAssetDetailSections, mapAssetToListRow } from './asset.view';

export type AssetListOperations = ListDashboardOperations & {
  deleteAsset(asset: Asset): void;
};

export type AssetListConfig = ListDashboardConfig<
  Asset,
  AssetFilterCriteria,
  AssetListContext,
  AssetListOperations
>;

const PAGE_SIZE = 12;

const ASSET_ROUTE_FILTER_BINDINGS = [
  { param: 'status', criteriaKey: 'status', type: 'string' as const },
  { param: 'category', criteriaKey: 'category', type: 'string' as const },
  { param: 'custodianUserId', criteriaKey: 'custodianUserId', type: 'string' as const },
  { param: 'projectId', criteriaKey: 'projectId', type: 'string' as const },
];

export function createAssetListConfig(deps: {
  data: AssetDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  context: AssetListContext;
  reloadList?: () => void;
}): AssetListConfig {
  const labelMap = (options: { key: string; label: string }[]): ReadonlyMap<string, string> =>
    new Map(options.map(option => [option.key, option.label]));
  const userLabels = (): ReadonlyMap<string, string> => labelMap(deps.context.userOptions);
  const projectLabels = (): ReadonlyMap<string, string> => labelMap(deps.context.projectOptions);
  const expenseLabels = (): ReadonlyMap<string, string> => labelMap(deps.context.expenseOptions);
  const formDeps = () => ({
    projectOptions: deps.context.projectOptions,
    userOptions: deps.context.userOptions,
    expenseOptions: deps.context.expenseOptions,
  });

  return {
    list: {
      pageSize: PAGE_SIZE,
      chips: [...ASSET_LIST_CHIPS],
      defaultChip: ASSET_DEFAULT_CHIP,
      isValidChip: isAssetPrimaryChip,
      route: {
        chipConfig: {
          defaultChip: ASSET_DEFAULT_CHIP,
          normalize: chip => normalizeAssetChip(chip),
        },
        filterBindings: ASSET_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneAssetCriteria,
      getDefaultCriteriaForChip: chip => getDefaultCriteriaForChip(chip as AssetPrimaryChip),
      buildFilterFormDefinition: (_chip, refData) =>
        buildAssetFilterForm(refData as AssetRefDataMap, {
          projectOptions: deps.context.projectOptions,
          userOptions: deps.context.userOptions,
        }),
      criteriaToFilterFormValues: (_chip, criteria) => assetCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        assetValuesToCriteria(values, criteria),
      buildAppliedFilters: (criteria, refData) =>
        buildAssetAppliedFilters(criteria, refData, deps.context),
      countActiveSheetFilters: countActiveAssetSheetFilters,
      removeFilterById: removeAssetFilterById,
      loadPage: (query, ctx) => deps.data.loadListPage({
        chipId: normalizeAssetChip(query.chipId),
        criteria: query.criteria as AssetFilterCriteria,
        searchText: query.searchText,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      }).pipe(
        map(page => ({
          items: (page.content ?? []).map(asset => mapAssetToListRow(
            asset,
            ctx.refData as AssetRefDataMap,
            {
              users: userLabels(),
              projects: projectLabels(),
            },
          )),
          totalSize: page.totalSize ?? 0,
          pageIndex: page.pageIndex ?? query.pageIndex,
          pageSize: page.pageSize ?? query.pageSize,
        })),
        catchError(() => of({
          items: [],
          totalSize: 0,
          pageIndex: query.pageIndex,
          pageSize: query.pageSize,
        })),
      ),
      mapToListRow: (asset, ctx) => mapAssetToListRow(
        asset,
        ctx.refData as AssetRefDataMap,
        {
          users: userLabels(),
          projects: projectLabels(),
        },
      ),
    },
    detail: {
      getTitle: asset => asset.name,
      getEntityId: asset => asset.id,
      buildViewSections: (asset, refData) => buildAssetDetailSections(
        asset,
        refData as AssetRefDataMap,
        {
          users: userLabels(),
          projects: projectLabels(),
          expenses: expenseLabels(),
        },
      ),
      fetchById: id => deps.data.fetchAssetById(id).pipe(catchError(() => of(undefined))),
      findInList: (items, id) => items
        .map(item => item.payload as Asset | undefined)
        .find(asset => asset?.id === id),
      primaryAction: {
        label: 'Update asset',
        when: context => context.canUpdate(),
      },
      edit: {
        buildEditSummary: context =>
          buildAssetEditSummary(context.entity, context.refData as AssetRefDataMap),
        buildEditForm: context =>
          buildAssetUpdateForm(context.entity, context.refData as AssetRefDataMap, formDeps()),
        entityToEditValues: assetToUpdateValues,
        refreshEditForm: context =>
          buildAssetUpdateForm(context.entity, context.refData as AssetRefDataMap, formDeps()),
        save: context => {
          const merged = { ...context.entity, ...assetUpdatePatch(context.values) };
          const payload = compareObjects(merged, context.entity);
          return deps.data.updateAsset(context.entity.id, payload as Partial<Asset>);
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      buildCreateForm: refData => buildAssetCreateForm(refData as AssetRefDataMap, formDeps()),
      defaultCreateValues: () => defaultAssetCreateValues(),
      validateBeforeCreate: values =>
        values['name'] ? undefined : 'Enter the asset name.',
      createSave: values => {
        if (!values['category']) {
          return throwError(() => new Error('Select an asset category.'));
        }
        return deps.data.createAsset(assetCreateEntity(values));
      },
    },
    actionForms: {
      assignCustody: {
        kind: 'form',
        title: asset => `Assign ${asset.name}`,
        saveLabel: 'Assign custody',
        defaultValues: () => defaultAssignCustodyValues(),
        buildForm: () => buildAssignCustodyForm(deps.context.userOptions),
        save: context => {
          const payload = assignCustodyPayload(context.values);
          return deps.data.assignCustody(
            context.entity.id,
            payload.custodianUserId,
            payload.notes,
          );
        },
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Custody assigned.',
        },
      },
      returnCustody: {
        kind: 'form',
        title: asset => `Return ${asset.name}`,
        saveLabel: 'Return custody',
        defaultValues: () => defaultReturnCustodyValues(),
        buildForm: () => buildReturnCustodyForm(),
        save: context => deps.data.returnCustody(
          context.entity.id,
          returnCustodyNotes(context.values),
        ),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Custody returned.',
        },
      },
    },
    operations: {
      deleteAsset(asset: Asset) {
        deps.modal.openNotificationModal({
          title: 'Delete asset?',
          description: `Delete "${asset.name}"? This removes the asset register entry.`,
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.deleteAsset(asset.id).subscribe({
            next: () => {
              deps.reloadList?.();
              deps.modal.openNotificationModal({
                title: 'Deleted',
                description: asset.name,
              }, 'notification', 'success');
            },
            error: () => {
              deps.modal.openNotificationModal({
                title: 'Delete failed',
                description: 'Unable to delete this asset.',
              }, 'notification', 'error');
            },
          });
        });
      },
    },
    meta: {
      id: 'asset-list',
      title: 'Asset',
      pageName: 'Assets',
      searchPlaceholder: 'Search assets',
      filterSheetTitle: 'Filter assets',
      emptyMessage: 'No assets match this filter.',
      detailRouteSync: { idParam: 'assetId' },
    },
    permissions: {
      resolve: () => resolveAssetPermissions(deps.authorization),
    },
    behavior: {
      canUpdateEntity: context => !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'assetOptions',
          cache: 'instance',
          run: async (context: AssetListContext) => {
            const [projects, users, expenses] = await Promise.all([
              firstValueFrom(deps.data.fetchProjectOptions().pipe(catchError(() => of([])))),
              firstValueFrom(deps.data.fetchUserOptions().pipe(catchError(() => of([])))),
              firstValueFrom(deps.data.fetchExpenseOptions().pipe(catchError(() => of([])))),
            ]);
            context.projectOptions = projects;
            context.userOptions = users;
            context.expenseOptions = expenses;
            return { projects, users, expenses };
          },
        },
      ],
      triggers: {
        init: ['assetOptions'],
        filterOpen: ['assetOptions'],
        createOpen: ['assetOptions'],
        editPrepare: ['assetOptions'],
      },
    },
    actions: {
      floating: [
        {
          id: 'create',
          label: 'Register asset',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
      detailFooter: [
        {
          id: 'assignCustody',
          label: 'Assign',
          appearance: 'secondary',
          when: ctx => {
            const entity = ctx.entity as Asset | undefined;
            return !!entity
              && !!ctx.permissions['canAssign']
              && canAssignAsset(entity);
          },
          run: 'assignCustody',
          actionFormId: 'assignCustody',
        },
        {
          id: 'returnCustody',
          label: 'Return',
          appearance: 'secondary',
          when: ctx => {
            const entity = ctx.entity as Asset | undefined;
            return !!entity
              && !!ctx.permissions['canAssign']
              && canReturnAsset(entity);
          },
          run: 'returnCustody',
          actionFormId: 'returnCustody',
        },
        {
          id: 'delete',
          label: 'Delete',
          icon: 'delete',
          appearance: 'secondary',
          when: ctx => {
            const entity = ctx.entity as Asset | undefined;
            return !!entity && !!ctx.permissions['canDelete'];
          },
          run: 'deleteAsset',
        },
      ],
    },
  };
}
