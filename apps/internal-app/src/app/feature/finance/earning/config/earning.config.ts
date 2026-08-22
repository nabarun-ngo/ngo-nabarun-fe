import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, switchMap } from 'rxjs';
import type { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import { compareObjects } from 'src/app/shared/utils/utilities.service';
import type { EarningDataSource } from '../data/earning-data.source';
import type {
  Earning,
  EarningFilterCriteria,
  EarningListContext,
  EarningPrimaryChip,
  EarningRefDataMap,
} from '../domain';
import {
  buildEarningCreateForm,
  buildEarningEditSummary,
  buildEarningFilterForm,
  buildEarningUpdateForm,
  defaultEarningCreateValues,
  earningCreateEntity,
  earningCriteriaToValues,
  earningToUpdateValues,
  earningUpdatePatch,
  earningValuesToCriteria,
  EARNING_CREATE_DOCUMENT_HINT,
  EARNING_DOCUMENT_TYPES,
} from './earning.forms';
import {
  buildEarningAppliedFilters,
  canEditEarningStatus,
  cloneEarningCriteria,
  countActiveEarningSheetFilters,
  EARNING_DEFAULT_CHIP,
  EARNING_LIST_CHIPS,
  getDefaultCriteriaForChip,
  isEarningPrimaryChip,
  normalizeEarningChip,
  removeEarningFilterById,
  resolveEarningPermissions,
} from './earning.rules';
import {
  buildEarningDetailSections,
  buildEarningDocuments,
  buildEarningDocumentsLoading,
  mapEarningListRow,
} from './earning.view';

export type EarningListConfig = ListDashboardConfig<
  Earning,
  EarningFilterCriteria,
  EarningListContext
>;

const MOBILE_PAGE_SIZE = 12;

const EARNING_LIST_ROUTE_FILTER_BINDINGS = [
  { param: 'source', criteriaKey: 'source', type: 'string' as const },
  { param: 'category', criteriaKey: 'category', type: 'csv' as const },
  { param: 'status', criteriaKey: 'status', type: 'csv' as const },
  { param: 'startDate', criteriaKey: 'startDate', type: 'string' as const },
  { param: 'endDate', criteriaKey: 'endDate', type: 'string' as const },
];

export function createEarningListConfig(deps: {
  data: EarningDataSource;
  authorization: AuthorizationService;
  context: EarningListContext;
}): EarningListConfig {
  const getAccounts = () => deps.context.payableAccountOptions;

  return {
    list: {
      pageSize: MOBILE_PAGE_SIZE,
      chips: [...EARNING_LIST_CHIPS],
      defaultChip: EARNING_DEFAULT_CHIP,
      isValidChip: isEarningPrimaryChip,
      route: {
        chipConfig: {
          defaultChip: EARNING_DEFAULT_CHIP,
          normalize: chip => normalizeEarningChip(chip),
        },
        filterBindings: EARNING_LIST_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneEarningCriteria,
      getDefaultCriteriaForChip: chip =>
        getDefaultCriteriaForChip(chip as EarningPrimaryChip),
      buildFilterFormDefinition: (chip, refData) =>
        buildEarningFilterForm(
          chip as EarningPrimaryChip,
          refData as EarningRefDataMap,
        ),
      criteriaToFilterFormValues: (_chip, criteria) =>
        earningCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        earningValuesToCriteria(values, criteria),
      buildAppliedFilters: (criteria, refData) =>
        buildEarningAppliedFilters(criteria, refData),
      countActiveSheetFilters: countActiveEarningSheetFilters,
      removeFilterById: removeEarningFilterById,
      loadPage: (query, context) => {
        const chipId = normalizeEarningChip(query.chipId);
        return deps.data.loadListPage({
          chipId,
          criteria: query.criteria as EarningFilterCriteria,
          searchText: query.searchText,
          pageIndex: query.pageIndex,
          pageSize: query.pageSize,
          refData: context.refData as EarningRefDataMap,
        }).pipe(
          map(page => ({
            items: (page.content ?? []).map(mapEarningListRow),
            totalSize: page.totalElements ?? page.totalSize ?? 0,
            pageIndex: query.pageIndex,
            pageSize: MOBILE_PAGE_SIZE,
          })),
          catchError(() => of({
            items: [],
            totalSize: 0,
            pageIndex: query.pageIndex,
            pageSize: MOBILE_PAGE_SIZE,
          })),
        );
      },
      mapToListRow: entity => mapEarningListRow(entity),
    },
    detail: {
      getTitle: earning => earning.id ?? 'Earning',
      buildViewSections: (earning, refData) =>
        buildEarningDetailSections(earning, refData as EarningRefDataMap),
      documents: {
        buildLoadingSection: buildEarningDocumentsLoading,
        loadSection: id => deps.data.fetchDocuments(id).pipe(
          map(buildEarningDocuments),
          catchError(() => of(buildEarningDocuments([]))),
        ),
      },
      fetchById: id => deps.data.fetchEarningById(id).pipe(
        catchError(() => of(undefined)),
      ),
      findInList: (items, id) => items
        .map(item => item.payload as Earning | undefined)
        .find(item => item?.id?.toLowerCase() === id.toLowerCase()),
      primaryAction: {
        label: 'Edit',
        when: context => context.canUpdate()
          && canEditEarningStatus(context.entity.status),
      },
      edit: {
        buildEditSummary: context => buildEarningEditSummary(
          context.entity,
          context.refData as EarningRefDataMap,
        ),
        buildEditForm: context => buildEarningUpdateForm(
          context.entity,
          context.refData as EarningRefDataMap,
          getAccounts(),
        ),
        entityToEditValues: earningToUpdateValues,
        refreshEditForm: context => buildEarningUpdateForm(
          context.entity,
          context.refData as EarningRefDataMap,
          getAccounts(),
        ),
        save: context => {
          const patch = earningUpdatePatch(context.values);
          const merged = { ...context.entity, ...patch } as Earning;
          const payload = compareObjects(merged, context.entity);
          return deps.data.updateEarning(
            context.entity.id!,
            payload as Partial<Earning>,
          );
        },
      },
    },
    create: {
      kind: 'component',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      buildCreateForm: refData =>
        buildEarningCreateForm(refData as EarningRefDataMap, getAccounts()),
      defaultCreateValues: () => defaultEarningCreateValues(),
      validateBeforeCreate: values => {
        const amount = Number(values['amount']);
        if (!Number.isFinite(amount) || amount <= 0) {
          return 'Enter a valid earning amount.';
        }
        if (values['category'] === 'INTEREST' && !values['accountId']) {
          return 'Select a bank or investment account for the interest earning.';
        }
        return undefined;
      },
      createSave: (values, createContext) => {
        const entity = earningCreateEntity(values);
        const documents = (createContext?.['pendingDocuments'] as FileUpload[] | undefined)
          ?? [];
        return deps.data.createEarning(entity).pipe(
          switchMap(created => {
            if (!documents.length) {
              return of(created);
            }
            return deps.data.uploadDocuments(documents, created).pipe(
              map(() => created),
              catchError(() => of(created)),
            );
          }),
        );
      },
    },
    meta: {
      id: 'earning-list',
      title: 'Earning',
      pageName: 'Earnings',
      searchPlaceholder: 'Search by source',
      filterSheetTitle: 'Earning Filters',
      emptyMessage: 'No earnings match this filter.',
      detailRouteSync: { idParam: 'earningId', idParamAliases: ['id'] },
    },
    permissions: {
      resolve: () => resolveEarningPermissions(deps.authorization),
    },
    behavior: {
      canUpdateEntity: context => !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'earningPayableAccounts',
          cache: 'instance',
          run: async (context: EarningListContext) => {
            const accounts = await firstValueFrom(deps.data.fetchPayableAccounts('EARNING_INTEREST'));
            context.payableAccountOptions = accounts.map(account => ({
              key: account.id!,
              label: `${account.accountType === 'INVESTMENT' ? 'Investment' : 'Bank'}: ${account.displayName || account.id!}`,
            }));
            return context.payableAccountOptions;
          },
        },
      ],
      triggers: {
        init: [],
        filterOpen: [],
        createOpen: ['earningPayableAccounts'],
        editPrepare: ['earningPayableAccounts'],
      },
    },
    actions: {
      floating: [
        {
          id: 'create',
          label: 'Add earning',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
    },
  };
}

export { EARNING_CREATE_DOCUMENT_HINT, EARNING_DOCUMENT_TYPES };
