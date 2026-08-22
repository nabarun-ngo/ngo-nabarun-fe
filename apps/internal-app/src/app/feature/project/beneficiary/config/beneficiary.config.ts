import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type {
  ListDashboardConfig,
  ListDashboardOperations,
} from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, throwError } from 'rxjs';
import { compareObjects } from 'src/app/shared/utils/utilities.service';
import type { BeneficiaryDataSource } from '../data/beneficiary-data.source';
import type {
  Beneficiary,
  BeneficiaryFilterCriteria,
  BeneficiaryListContext,
  BeneficiaryPrimaryChip,
  BeneficiaryRefDataMap,
} from '../domain';
import {
  beneficiaryCreateEntity,
  beneficiaryCriteriaToValues,
  beneficiaryExitValues,
  beneficiaryProjectId,
  beneficiaryToUpdateValues,
  beneficiaryUpdatePatch,
  beneficiaryValuesToCriteria,
  buildBeneficiaryCreateForm,
  buildBeneficiaryEditSummary,
  buildBeneficiaryExitForm,
  buildBeneficiaryFilterForm,
  buildBeneficiaryUpdateForm,
  defaultBeneficiaryCreateValues,
} from './beneficiary.forms';
import {
  BENEFICIARY_DEFAULT_CHIP,
  BENEFICIARY_LIST_CHIPS,
  buildBeneficiaryAppliedFilters,
  cloneBeneficiaryCriteria,
  countActiveBeneficiarySheetFilters,
  getDefaultCriteriaForChip,
  isBeneficiaryEnrolled,
  isBeneficiaryPrimaryChip,
  normalizeBeneficiaryChip,
  removeBeneficiaryFilterById,
  resolveBeneficiaryPermissions,
} from './beneficiary.rules';
import { buildBeneficiaryDetailSections, mapBeneficiaryListRow } from './beneficiary.view';

export type BeneficiaryListOperations = ListDashboardOperations;

export type BeneficiaryListConfig = ListDashboardConfig<
  Beneficiary,
  BeneficiaryFilterCriteria,
  BeneficiaryListContext,
  BeneficiaryListOperations
>;

const PAGE_SIZE = 12;

const BENEFICIARY_ROUTE_FILTER_BINDINGS = [
  { param: 'projectId', criteriaKey: 'projectId', type: 'string' as const },
  { param: 'status', criteriaKey: 'status', type: 'string' as const },
  { param: 'type', criteriaKey: 'type', type: 'string' as const },
  { param: 'category', criteriaKey: 'category', type: 'string' as const },
];

export function createBeneficiaryListConfig(deps: {
  data: BeneficiaryDataSource;
  authorization: AuthorizationService;
  context: BeneficiaryListContext;
}): BeneficiaryListConfig {
  const projectLabel = (projectId: string): string | undefined =>
    deps.context.projectOptions.find(option => option.key === projectId)?.label;
  const scopedProject = (criteria?: BeneficiaryFilterCriteria): string | undefined =>
    deps.context.projectId ?? criteria?.projectId;

  return {
    list: {
      pageSize: PAGE_SIZE,
      chips: [...BENEFICIARY_LIST_CHIPS],
      defaultChip: BENEFICIARY_DEFAULT_CHIP,
      isValidChip: isBeneficiaryPrimaryChip,
      route: {
        chipConfig: {
          defaultChip: BENEFICIARY_DEFAULT_CHIP,
          normalize: chip => normalizeBeneficiaryChip(chip),
        },
        filterBindings: BENEFICIARY_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneBeneficiaryCriteria,
      getDefaultCriteriaForChip: chip =>
        getDefaultCriteriaForChip(chip as BeneficiaryPrimaryChip, deps.context.projectId),
      buildFilterFormDefinition: (_chip, refData) =>
        buildBeneficiaryFilterForm(refData as BeneficiaryRefDataMap, {
          projectOptions: deps.context.projectOptions,
          scopedProjectId: deps.context.projectId,
        }),
      criteriaToFilterFormValues: (_chip, criteria) => beneficiaryCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        beneficiaryValuesToCriteria(values, criteria),
      buildAppliedFilters: (criteria, refData) =>
        buildBeneficiaryAppliedFilters(criteria, refData, deps.context),
      countActiveSheetFilters: countActiveBeneficiarySheetFilters,
      removeFilterById: removeBeneficiaryFilterById,
      loadPage: (query, ctx) => deps.data.loadListPage({
        chipId: normalizeBeneficiaryChip(query.chipId),
        criteria: {
          ...(query.criteria as BeneficiaryFilterCriteria),
          projectId: scopedProject(query.criteria as BeneficiaryFilterCriteria),
        },
        searchText: query.searchText,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      }).pipe(
        map(page => ({
          items: (page.content ?? []).map(beneficiary =>
            mapBeneficiaryListRow(beneficiary, ctx.refData as BeneficiaryRefDataMap)),
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
      mapToListRow: (beneficiary, ctx) =>
        mapBeneficiaryListRow(beneficiary, ctx.refData as BeneficiaryRefDataMap),
    },
    detail: {
      getTitle: beneficiary => beneficiary.name,
      getEntityId: beneficiary => beneficiary.id,
      buildViewSections: (beneficiary, refData) => buildBeneficiaryDetailSections(
        beneficiary,
        refData as BeneficiaryRefDataMap,
        projectLabel(beneficiary.projectId),
      ),
      fetchById: id => {
        const projectId = scopedProject();
        return projectId
          ? deps.data.fetchBeneficiaryById(projectId, id).pipe(catchError(() => of(undefined)))
          : of(undefined);
      },
      findInList: (items, id) => items
        .map(item => item.payload as Beneficiary | undefined)
        .find(beneficiary => beneficiary?.id === id),
      primaryAction: {
        label: 'Update beneficiary',
        when: context => context.canUpdate(),
      },
      edit: {
        buildEditSummary: context =>
          buildBeneficiaryEditSummary(context.entity, context.refData as BeneficiaryRefDataMap),
        buildEditForm: context =>
          buildBeneficiaryUpdateForm(context.entity, context.refData as BeneficiaryRefDataMap),
        entityToEditValues: beneficiaryToUpdateValues,
        refreshEditForm: context =>
          buildBeneficiaryUpdateForm(context.entity, context.refData as BeneficiaryRefDataMap),
        save: context => {
          const merged = { ...context.entity, ...beneficiaryUpdatePatch(context.values) };
          const payload = compareObjects(merged, context.entity);
          return deps.data.updateBeneficiary(
            context.entity.projectId,
            context.entity.id,
            payload as Partial<Beneficiary>,
          );
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      buildCreateForm: refData =>
        buildBeneficiaryCreateForm(refData as BeneficiaryRefDataMap, {
          projectOptions: deps.context.projectOptions,
          scopedProjectId: deps.context.projectId,
        }),
      defaultCreateValues: () => defaultBeneficiaryCreateValues(deps.context.projectId),
      validateBeforeCreate: values => {
        if (!(deps.context.projectId ?? beneficiaryProjectId(values))) {
          return 'Select the project this beneficiary belongs to.';
        }
        return values['enrollmentDate'] ? undefined : 'Select an enrollment date.';
      },
      createSave: values => {
        const projectId = deps.context.projectId ?? beneficiaryProjectId(values);
        if (!projectId) {
          return throwError(() => new Error(
            'Select the project this beneficiary belongs to.',
          ));
        }
        return deps.data.createBeneficiary(projectId, beneficiaryCreateEntity(values));
      },
    },
    actionForms: {
      exitBeneficiary: {
        kind: 'form',
        title: beneficiary => `Record exit for ${beneficiary.name}`,
        saveLabel: 'Record exit',
        defaultValues: beneficiary => beneficiaryExitValues(beneficiary),
        buildForm: beneficiary => buildBeneficiaryExitForm(beneficiary),
        save: context => deps.data.exitBeneficiary(
          context.entity.projectId,
          context.entity.id,
        ),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Beneficiary exit recorded.',
        },
      },
    },
    meta: {
      id: 'beneficiary-list',
      title: 'Beneficiary',
      pageName: 'Beneficiaries',
      searchPlaceholder: 'Search by name, location or contact',
      filterSheetTitle: 'Filter beneficiaries',
      emptyMessage: deps.context.projectId
        ? 'No beneficiaries match this filter.'
        : 'Choose a project from the filter to see its beneficiaries.',
      detailRouteSync: { idParam: 'beneficiaryId' },
    },
    permissions: {
      resolve: () => resolveBeneficiaryPermissions(deps.authorization),
    },
    behavior: {
      canUpdateEntity: context => !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'beneficiaryProjects',
          cache: 'instance',
          run: async (context: BeneficiaryListContext) => {
            context.projectOptions = await firstValueFrom(
              deps.data.fetchProjectOptions().pipe(catchError(() => of([]))),
            );
            return context.projectOptions;
          },
        },
      ],
      triggers: {
        init: ['beneficiaryProjects'],
        filterOpen: ['beneficiaryProjects'],
        createOpen: ['beneficiaryProjects'],
      },
    },
    actions: {
      floating: [
        {
          id: 'create',
          label: 'Enroll beneficiary',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
      detailFooter: [
        {
          id: 'exitBeneficiary',
          label: 'Record exit',
          appearance: 'primary',
          when: ctx => {
            const entity = ctx.entity as Beneficiary | undefined;
            return !!entity
              && !!ctx.permissions['canExit']
              && isBeneficiaryEnrolled(entity);
          },
          run: 'exitBeneficiary',
          actionFormId: 'exitBeneficiary',
        },
      ],
    },
  };
}
