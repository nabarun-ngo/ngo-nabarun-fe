import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type {
  ListDashboardConfig,
  ListDashboardOperations,
} from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, throwError } from 'rxjs';
import { compareObjects } from 'src/app/shared/utils/utilities.service';
import type { MilestoneDataSource } from '../data/milestone-data.source';
import type {
  Milestone,
  MilestoneFilterCriteria,
  MilestoneListContext,
  MilestonePrimaryChip,
  MilestoneRefDataMap,
} from '../domain';
import {
  buildMilestoneCompleteForm,
  buildMilestoneCreateForm,
  buildMilestoneEditSummary,
  buildMilestoneFilterForm,
  buildMilestoneUpdateForm,
  defaultMilestoneCreateValues,
  milestoneCompleteValues,
  milestoneCreateEntity,
  milestoneCriteriaToValues,
  milestoneProjectId,
  milestoneToUpdateValues,
  milestoneUpdatePatch,
  milestoneValuesToCriteria,
} from './milestone.forms';
import {
  buildMilestoneAppliedFilters,
  cloneMilestoneCriteria,
  countActiveMilestoneSheetFilters,
  getDefaultCriteriaForChip,
  isMilestoneOpen,
  isMilestonePrimaryChip,
  MILESTONE_DEFAULT_CHIP,
  MILESTONE_LIST_CHIPS,
  normalizeMilestoneChip,
  removeMilestoneFilterById,
  resolveMilestonePermissions,
} from './milestone.rules';
import { buildMilestoneDetailSections, mapMilestoneListRow } from './milestone.view';

export type MilestoneListOperations = ListDashboardOperations;

export type MilestoneListConfig = ListDashboardConfig<
  Milestone,
  MilestoneFilterCriteria,
  MilestoneListContext,
  MilestoneListOperations
>;

const PAGE_SIZE = 12;

const MILESTONE_ROUTE_FILTER_BINDINGS = [
  { param: 'projectId', criteriaKey: 'projectId', type: 'string' as const },
  { param: 'status', criteriaKey: 'status', type: 'string' as const },
  { param: 'importance', criteriaKey: 'importance', type: 'string' as const },
];

export function createMilestoneListConfig(deps: {
  data: MilestoneDataSource;
  authorization: AuthorizationService;
  context: MilestoneListContext;
}): MilestoneListConfig {
  const projectLabel = (projectId: string): string | undefined =>
    deps.context.projectOptions.find(option => option.key === projectId)?.label;
  const scopedProject = (criteria?: MilestoneFilterCriteria): string | undefined =>
    deps.context.projectId ?? criteria?.projectId;

  return {
    list: {
      pageSize: PAGE_SIZE,
      chips: [...MILESTONE_LIST_CHIPS],
      defaultChip: MILESTONE_DEFAULT_CHIP,
      isValidChip: isMilestonePrimaryChip,
      route: {
        chipConfig: {
          defaultChip: MILESTONE_DEFAULT_CHIP,
          normalize: chip => normalizeMilestoneChip(chip),
        },
        filterBindings: MILESTONE_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneMilestoneCriteria,
      getDefaultCriteriaForChip: chip =>
        getDefaultCriteriaForChip(chip as MilestonePrimaryChip, deps.context.projectId),
      buildFilterFormDefinition: (_chip, refData) =>
        buildMilestoneFilterForm(refData as MilestoneRefDataMap, {
          projectOptions: deps.context.projectOptions,
          scopedProjectId: deps.context.projectId,
        }),
      criteriaToFilterFormValues: (_chip, criteria) => milestoneCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        milestoneValuesToCriteria(values, criteria),
      buildAppliedFilters: (criteria, refData) =>
        buildMilestoneAppliedFilters(criteria, refData, deps.context),
      countActiveSheetFilters: countActiveMilestoneSheetFilters,
      removeFilterById: removeMilestoneFilterById,
      loadPage: (query, ctx) => deps.data.loadListPage({
        chipId: normalizeMilestoneChip(query.chipId),
        criteria: {
          ...(query.criteria as MilestoneFilterCriteria),
          projectId: scopedProject(query.criteria as MilestoneFilterCriteria),
        },
        searchText: query.searchText,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      }).pipe(
        map(page => ({
          items: (page.content ?? []).map(milestone =>
            mapMilestoneListRow(milestone, ctx.refData as MilestoneRefDataMap)),
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
      mapToListRow: (milestone, ctx) =>
        mapMilestoneListRow(milestone, ctx.refData as MilestoneRefDataMap),
    },
    detail: {
      getTitle: milestone => milestone.name,
      getEntityId: milestone => milestone.id,
      buildViewSections: (milestone, refData) => buildMilestoneDetailSections(
        milestone,
        refData as MilestoneRefDataMap,
        projectLabel(milestone.projectId),
      ),
      fetchById: id => {
        const projectId = scopedProject();
        return projectId
          ? deps.data.fetchMilestoneById(projectId, id).pipe(catchError(() => of(undefined)))
          : of(undefined);
      },
      findInList: (items, id) => items
        .map(item => item.payload as Milestone | undefined)
        .find(milestone => milestone?.id === id),
      primaryAction: {
        label: 'Update milestone',
        when: context => context.canUpdate(),
      },
      edit: {
        buildEditSummary: context =>
          buildMilestoneEditSummary(context.entity, context.refData as MilestoneRefDataMap),
        buildEditForm: context =>
          buildMilestoneUpdateForm(context.entity, context.refData as MilestoneRefDataMap),
        entityToEditValues: milestoneToUpdateValues,
        refreshEditForm: context =>
          buildMilestoneUpdateForm(context.entity, context.refData as MilestoneRefDataMap),
        save: context => {
          const merged = { ...context.entity, ...milestoneUpdatePatch(context.values) };
          const payload = compareObjects(merged, context.entity);
          return deps.data.updateMilestone(
            context.entity.projectId,
            context.entity.id,
            payload as Partial<Milestone>,
          );
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      buildCreateForm: refData => buildMilestoneCreateForm(refData as MilestoneRefDataMap, {
        projectOptions: deps.context.projectOptions,
        scopedProjectId: deps.context.projectId,
      }),
      defaultCreateValues: () => defaultMilestoneCreateValues(deps.context.projectId),
      validateBeforeCreate: values => {
        if (!(deps.context.projectId ?? milestoneProjectId(values))) {
          return 'Select the project this milestone belongs to.';
        }
        return values['targetDate'] ? undefined : 'Select a target date.';
      },
      createSave: values => {
        const projectId = deps.context.projectId ?? milestoneProjectId(values);
        if (!projectId) {
          return throwError(() => new Error('Select the project this milestone belongs to.'));
        }
        return deps.data.createMilestone(projectId, milestoneCreateEntity(values));
      },
    },
    actionForms: {
      completeMilestone: {
        kind: 'form',
        title: milestone => `Mark ${milestone.name} achieved`,
        saveLabel: 'Mark achieved',
        defaultValues: milestone => milestoneCompleteValues(milestone),
        buildForm: milestone => buildMilestoneCompleteForm(milestone),
        save: context => deps.data.completeMilestone(
          context.entity.projectId,
          context.entity.id,
        ),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Milestone marked as achieved.',
        },
      },
    },
    meta: {
      id: 'milestone-list',
      title: 'Milestone',
      pageName: 'Milestones',
      searchPlaceholder: 'Search milestones',
      filterSheetTitle: 'Filter milestones',
      emptyMessage: deps.context.projectId
        ? 'No milestones match this filter.'
        : 'Choose a project from the filter to see its milestones.',
      detailRouteSync: { idParam: 'milestoneId' },
    },
    permissions: {
      resolve: () => resolveMilestonePermissions(deps.authorization),
    },
    behavior: {
      canUpdateEntity: context => !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'milestoneProjects',
          cache: 'instance',
          run: async (context: MilestoneListContext) => {
            context.projectOptions = await firstValueFrom(
              deps.data.fetchProjectOptions().pipe(catchError(() => of([]))),
            );
            return context.projectOptions;
          },
        },
      ],
      triggers: {
        init: ['milestoneProjects'],
        filterOpen: ['milestoneProjects'],
        createOpen: ['milestoneProjects'],
      },
    },
    actions: {
      floating: [
        {
          id: 'create',
          label: 'Add milestone',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
      detailFooter: [
        {
          id: 'completeMilestone',
          label: 'Mark achieved',
          appearance: 'primary',
          when: ctx => {
            const entity = ctx.entity as Milestone | undefined;
            return !!entity
              && !!ctx.permissions['canComplete']
              && isMilestoneOpen(entity);
          },
          run: 'completeMilestone',
          actionFormId: 'completeMilestone',
        },
      ],
    },
  };
}
