import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type {
  ListDashboardConfig,
  ListDashboardOperations,
} from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, throwError } from 'rxjs';
import { compareObjects } from 'src/app/shared/utils/utilities.service';
import type { RiskDataSource } from '../data/risk-data.source';
import type {
  ProjectRisk,
  RiskFilterCriteria,
  RiskListContext,
  RiskPrimaryChip,
  RiskRefDataMap,
} from '../domain';
import {
  buildRiskCreateForm,
  buildRiskEditSummary,
  buildRiskFilterForm,
  buildRiskResolveForm,
  buildRiskUpdateForm,
  defaultRiskCreateValues,
  riskCreateEntity,
  riskCriteriaToValues,
  riskProjectId,
  riskResolveValues,
  riskToUpdateValues,
  riskUpdatePatch,
  riskValuesToCriteria,
} from './risk.forms';
import {
  buildRiskAppliedFilters,
  cloneRiskCriteria,
  countActiveRiskSheetFilters,
  getDefaultCriteriaForChip,
  isRiskPrimaryChip,
  isRiskResolvable,
  normalizeRiskChip,
  removeRiskFilterById,
  resolveRiskPermissions,
  RISK_DEFAULT_CHIP,
  RISK_LIST_CHIPS,
} from './risk.rules';
import { buildRiskDetailSections, mapRiskListRow } from './risk.view';

export type RiskListOperations = ListDashboardOperations;

export type RiskListConfig = ListDashboardConfig<
  ProjectRisk,
  RiskFilterCriteria,
  RiskListContext,
  RiskListOperations
>;

const PAGE_SIZE = 12;

const RISK_ROUTE_FILTER_BINDINGS = [
  { param: 'projectId', criteriaKey: 'projectId', type: 'string' as const },
  { param: 'status', criteriaKey: 'status', type: 'string' as const },
  { param: 'severity', criteriaKey: 'severity', type: 'string' as const },
  { param: 'category', criteriaKey: 'category', type: 'string' as const },
  { param: 'ownerId', criteriaKey: 'ownerId', type: 'string' as const },
];

export function createRiskListConfig(deps: {
  data: RiskDataSource;
  authorization: AuthorizationService;
  context: RiskListContext;
}): RiskListConfig {
  const userLabels = (): ReadonlyMap<string, string> =>
    new Map(deps.context.userOptions.map(option => [option.key, option.label]));
  const projectLabel = (projectId: string): string | undefined =>
    deps.context.projectOptions.find(option => option.key === projectId)?.label;
  const scopedProject = (criteria?: RiskFilterCriteria): string | undefined =>
    deps.context.projectId ?? criteria?.projectId;

  return {
    list: {
      pageSize: PAGE_SIZE,
      chips: [...RISK_LIST_CHIPS],
      defaultChip: RISK_DEFAULT_CHIP,
      isValidChip: isRiskPrimaryChip,
      route: {
        chipConfig: {
          defaultChip: RISK_DEFAULT_CHIP,
          normalize: chip => normalizeRiskChip(chip),
        },
        filterBindings: RISK_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneRiskCriteria,
      getDefaultCriteriaForChip: chip =>
        getDefaultCriteriaForChip(chip as RiskPrimaryChip, deps.context.projectId),
      buildFilterFormDefinition: (_chip, refData) =>
        buildRiskFilterForm(refData as RiskRefDataMap, {
          projectOptions: deps.context.projectOptions,
          userOptions: deps.context.userOptions,
          scopedProjectId: deps.context.projectId,
        }),
      criteriaToFilterFormValues: (_chip, criteria) => riskCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        riskValuesToCriteria(values, criteria),
      buildAppliedFilters: (criteria, refData) =>
        buildRiskAppliedFilters(criteria, refData, deps.context),
      countActiveSheetFilters: countActiveRiskSheetFilters,
      removeFilterById: removeRiskFilterById,
      loadPage: (query, ctx) => deps.data.loadListPage({
        chipId: normalizeRiskChip(query.chipId),
        criteria: {
          ...(query.criteria as RiskFilterCriteria),
          projectId: scopedProject(query.criteria as RiskFilterCriteria),
        },
        searchText: query.searchText,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      }).pipe(
        map(page => ({
          items: (page.content ?? []).map(risk =>
            mapRiskListRow(risk, ctx.refData as RiskRefDataMap, userLabels())),
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
      mapToListRow: (risk, ctx) =>
        mapRiskListRow(risk, ctx.refData as RiskRefDataMap, userLabels()),
    },
    detail: {
      getTitle: risk => risk.title,
      getEntityId: risk => risk.id,
      buildViewSections: (risk, refData) =>
        buildRiskDetailSections(risk, refData as RiskRefDataMap, {
          projectLabel: projectLabel(risk.projectId),
          users: userLabels(),
        }),
      fetchById: id => {
        const projectId = scopedProject();
        return projectId
          ? deps.data.fetchRiskById(projectId, id).pipe(catchError(() => of(undefined)))
          : of(undefined);
      },
      findInList: (items, id) => items
        .map(item => item.payload as ProjectRisk | undefined)
        .find(risk => risk?.id === id),
      primaryAction: {
        label: 'Update risk',
        when: context => context.canUpdate(),
      },
      edit: {
        buildEditSummary: context =>
          buildRiskEditSummary(context.entity, context.refData as RiskRefDataMap),
        buildEditForm: context =>
          buildRiskUpdateForm(context.entity, context.refData as RiskRefDataMap),
        entityToEditValues: riskToUpdateValues,
        refreshEditForm: context =>
          buildRiskUpdateForm(context.entity, context.refData as RiskRefDataMap),
        save: context => {
          const merged = { ...context.entity, ...riskUpdatePatch(context.values) };
          const payload = compareObjects(merged, context.entity);
          return deps.data.updateRisk(
            context.entity.projectId,
            context.entity.id,
            payload as Partial<ProjectRisk>,
          );
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      buildCreateForm: refData => buildRiskCreateForm(refData as RiskRefDataMap, {
        projectOptions: deps.context.projectOptions,
        userOptions: deps.context.userOptions,
        scopedProjectId: deps.context.projectId,
      }),
      defaultCreateValues: () => defaultRiskCreateValues(deps.context.projectId),
      validateBeforeCreate: values => {
        if (!(deps.context.projectId ?? riskProjectId(values))) {
          return 'Select the project this risk belongs to.';
        }
        return values['category'] ? undefined : 'Select a risk category.';
      },
      createSave: values => {
        const projectId = deps.context.projectId ?? riskProjectId(values);
        if (!projectId) {
          return throwError(() => new Error('Select the project this risk belongs to.'));
        }
        return deps.data.createRisk(projectId, riskCreateEntity(values));
      },
    },
    actionForms: {
      resolveRisk: {
        kind: 'form',
        title: risk => `Resolve ${risk.title}`,
        saveLabel: 'Resolve risk',
        defaultValues: risk => riskResolveValues(risk),
        buildForm: risk => buildRiskResolveForm(risk),
        save: context => deps.data.resolveRisk(context.entity.projectId, context.entity.id),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Risk resolved.',
        },
      },
    },
    meta: {
      id: 'risk-list',
      title: 'Risk',
      pageName: 'Risks',
      searchPlaceholder: 'Search risks',
      filterSheetTitle: 'Filter risks',
      emptyMessage: deps.context.projectId
        ? 'No risks match this filter.'
        : 'Choose a project from the filter to see its risks.',
      detailRouteSync: { idParam: 'riskId' },
    },
    permissions: {
      resolve: () => resolveRiskPermissions(deps.authorization),
    },
    behavior: {
      canUpdateEntity: context => !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'riskOptions',
          cache: 'instance',
          run: async (context: RiskListContext) => {
            const [projects, users] = await Promise.all([
              firstValueFrom(deps.data.fetchProjectOptions().pipe(catchError(() => of([])))),
              firstValueFrom(deps.data.fetchUserOptions().pipe(catchError(() => of([])))),
            ]);
            context.projectOptions = projects;
            context.userOptions = users;
            return { projects, users };
          },
        },
      ],
      triggers: {
        init: ['riskOptions'],
        filterOpen: ['riskOptions'],
        createOpen: ['riskOptions'],
      },
    },
    actions: {
      floating: [
        {
          id: 'create',
          label: 'Log risk',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
      detailFooter: [
        {
          id: 'resolveRisk',
          label: 'Resolve',
          appearance: 'primary',
          when: ctx => {
            const entity = ctx.entity as ProjectRisk | undefined;
            return !!entity
              && !!ctx.permissions['canResolve']
              && isRiskResolvable(entity);
          },
          run: 'resolveRisk',
          actionFormId: 'resolveRisk',
        },
      ],
    },
  };
}
