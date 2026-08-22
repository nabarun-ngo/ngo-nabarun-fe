import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type {
  ListDashboardConfig,
  ListDashboardOperations,
} from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, throwError } from 'rxjs';
import { compareObjects } from 'src/app/shared/utils/utilities.service';
import type { GoalDataSource } from '../data/goal-data.source';
import type {
  Goal,
  GoalFilterCriteria,
  GoalListContext,
  GoalPrimaryChip,
  GoalRefDataMap,
} from '../domain';
import {
  buildGoalCreateForm,
  buildGoalEditSummary,
  buildGoalFilterForm,
  buildGoalProgressForm,
  buildGoalUpdateForm,
  defaultGoalCreateValues,
  goalCreateEntity,
  goalCriteriaToValues,
  goalProjectId,
  goalToUpdateValues,
  goalUpdatePatch,
  goalValuesToCriteria,
} from './goal.forms';
import {
  buildGoalAppliedFilters,
  cloneGoalCriteria,
  countActiveGoalSheetFilters,
  GOAL_DEFAULT_CHIP,
  GOAL_LIST_CHIPS,
  getDefaultCriteriaForChip,
  isGoalPrimaryChip,
  normalizeGoalChip,
  removeGoalFilterById,
  resolveGoalPermissions,
} from './goal.rules';
import { buildGoalDetailSections, mapGoalListRow } from './goal.view';

export type GoalListOperations = ListDashboardOperations;

export type GoalListConfig = ListDashboardConfig<
  Goal,
  GoalFilterCriteria,
  GoalListContext,
  GoalListOperations
>;

const PAGE_SIZE = 12;

const GOAL_ROUTE_FILTER_BINDINGS = [
  { param: 'projectId', criteriaKey: 'projectId', type: 'string' as const },
  { param: 'status', criteriaKey: 'status', type: 'string' as const },
  { param: 'priority', criteriaKey: 'priority', type: 'string' as const },
];

export function createGoalListConfig(deps: {
  data: GoalDataSource;
  authorization: AuthorizationService;
  context: GoalListContext;
}): GoalListConfig {
  const projectLabel = (projectId: string): string | undefined =>
    deps.context.projectOptions.find(option => option.key === projectId)?.label;
  const scopedProject = (criteria?: GoalFilterCriteria): string | undefined =>
    deps.context.projectId ?? criteria?.projectId;

  return {
    list: {
      pageSize: PAGE_SIZE,
      chips: [...GOAL_LIST_CHIPS],
      defaultChip: GOAL_DEFAULT_CHIP,
      isValidChip: isGoalPrimaryChip,
      route: {
        chipConfig: {
          defaultChip: GOAL_DEFAULT_CHIP,
          normalize: chip => normalizeGoalChip(chip),
        },
        filterBindings: GOAL_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneGoalCriteria,
      getDefaultCriteriaForChip: chip =>
        getDefaultCriteriaForChip(chip as GoalPrimaryChip, deps.context.projectId),
      buildFilterFormDefinition: (_chip, refData) =>
        buildGoalFilterForm(refData as GoalRefDataMap, {
          projectOptions: deps.context.projectOptions,
          scopedProjectId: deps.context.projectId,
        }),
      criteriaToFilterFormValues: (_chip, criteria) => goalCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        goalValuesToCriteria(values, criteria),
      buildAppliedFilters: (criteria, refData) =>
        buildGoalAppliedFilters(criteria, refData, deps.context),
      countActiveSheetFilters: countActiveGoalSheetFilters,
      removeFilterById: removeGoalFilterById,
      loadPage: (query, ctx) => deps.data.loadListPage({
        chipId: normalizeGoalChip(query.chipId),
        criteria: {
          ...(query.criteria as GoalFilterCriteria),
          projectId: scopedProject(query.criteria as GoalFilterCriteria),
        },
        searchText: query.searchText,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      }).pipe(
        map(page => ({
          items: (page.content ?? []).map(goal =>
            mapGoalListRow(goal, ctx.refData as GoalRefDataMap)),
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
      mapToListRow: (goal, ctx) => mapGoalListRow(goal, ctx.refData as GoalRefDataMap),
    },
    detail: {
      getTitle: goal => goal.title,
      getEntityId: goal => goal.id,
      buildViewSections: (goal, refData) =>
        buildGoalDetailSections(goal, refData as GoalRefDataMap, projectLabel(goal.projectId)),
      fetchById: id => {
        const projectId = scopedProject();
        return projectId
          ? deps.data.fetchGoalById(projectId, id).pipe(catchError(() => of(undefined)))
          : of(undefined);
      },
      findInList: (items, id) => items
        .map(item => item.payload as Goal | undefined)
        .find(goal => goal?.id === id),
      primaryAction: {
        label: 'Update goal',
        when: context => context.canUpdate(),
      },
      edit: {
        buildEditSummary: context =>
          buildGoalEditSummary(context.entity, context.refData as GoalRefDataMap),
        buildEditForm: context =>
          buildGoalUpdateForm(context.entity, context.refData as GoalRefDataMap),
        entityToEditValues: goalToUpdateValues,
        refreshEditForm: context =>
          buildGoalUpdateForm(context.entity, context.refData as GoalRefDataMap),
        save: context => {
          const merged = { ...context.entity, ...goalUpdatePatch(context.values) };
          const payload = compareObjects(merged, context.entity);
          return deps.data.updateGoal(
            context.entity.projectId,
            context.entity.id,
            payload as Partial<Goal>,
          );
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      buildCreateForm: refData => buildGoalCreateForm(refData as GoalRefDataMap, {
        projectOptions: deps.context.projectOptions,
        scopedProjectId: deps.context.projectId,
      }),
      defaultCreateValues: () => defaultGoalCreateValues(deps.context.projectId),
      validateBeforeCreate: values =>
        deps.context.projectId ?? goalProjectId(values)
          ? undefined
          : 'Select the project this goal belongs to.',
      createSave: values => {
        const projectId = deps.context.projectId ?? goalProjectId(values);
        if (!projectId) {
          return throwError(() => new Error('Select the project this goal belongs to.'));
        }
        return deps.data.createGoal(projectId, goalCreateEntity(values));
      },
    },
    actionForms: {
      recordProgress: {
        kind: 'form',
        title: goal => `Record progress for ${goal.title}`,
        saveLabel: 'Save progress',
        defaultValues: goal => ({ currentValue: goal.currentValue ?? 0 }),
        buildForm: goal => buildGoalProgressForm(goal),
        validateBeforeSave: context => {
          const value = Number(context.values['currentValue']);
          return Number.isFinite(value) && value >= 0
            ? undefined
            : 'Enter the achieved value.';
        },
        save: context => deps.data.recordProgress(
          context.entity.projectId,
          context.entity.id,
          Number(context.values['currentValue']),
        ),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Goal progress recorded.',
        },
      },
    },
    meta: {
      id: 'goal-list',
      title: 'Goal',
      pageName: 'Goals',
      searchPlaceholder: 'Search goals',
      filterSheetTitle: 'Filter goals',
      emptyMessage: deps.context.projectId
        ? 'No goals match this filter.'
        : 'Choose a project from the filter to see its goals.',
      detailRouteSync: { idParam: 'goalId' },
    },
    permissions: {
      resolve: () => resolveGoalPermissions(deps.authorization),
    },
    behavior: {
      canUpdateEntity: context => !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'goalProjects',
          cache: 'instance',
          run: async (context: GoalListContext) => {
            context.projectOptions = await firstValueFrom(
              deps.data.fetchProjectOptions().pipe(catchError(() => of([]))),
            );
            return context.projectOptions;
          },
        },
      ],
      triggers: {
        init: ['goalProjects'],
        filterOpen: ['goalProjects'],
        createOpen: ['goalProjects'],
      },
    },
    actions: {
      floating: [
        {
          id: 'create',
          label: 'Add goal',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
      detailFooter: [
        {
          id: 'recordProgress',
          label: 'Record progress',
          appearance: 'primary',
          when: ctx => !!ctx.permissions['canRecordProgress'],
          run: 'recordProgress',
          actionFormId: 'recordProgress',
        },
      ],
    },
  };
}
