import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type {
  ListDashboardConfig,
  ListDashboardOperations,
} from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, throwError } from 'rxjs';
import { compareObjects } from 'src/app/shared/utils/utilities.service';
import type { ActivityDataSource } from '../data/activity-data.source';
import type {
  Activity,
  ActivityFilterCriteria,
  ActivityListContext,
  ActivityPrimaryChip,
  ActivityRefDataMap,
} from '../domain';
import {
  activityCreateEntity,
  activityCriteriaToValues,
  activityProjectId,
  activityToUpdateValues,
  activityUpdatePatch,
  activityValuesToCriteria,
  buildActivityCreateForm,
  buildActivityEditSummary,
  buildActivityFilterForm,
  buildActivityUpdateForm,
  buildLinkExpenseForm,
  defaultActivityCreateValues,
} from './activity.forms';
import {
  ACTIVITY_DEFAULT_CHIP,
  ACTIVITY_LIST_CHIPS,
  buildActivityAppliedFilters,
  cloneActivityCriteria,
  countActiveActivitySheetFilters,
  getDefaultCriteriaForChip,
  isActivityPrimaryChip,
  normalizeActivityChip,
  removeActivityFilterById,
  resolveActivityPermissions,
} from './activity.rules';
import { buildActivityDetailSections, mapActivityListRow } from './activity.view';

/** Finance lists reachable from an activity row kebab. */
export type ActivityLinkedFinance = 'donations' | 'expenses';

export type ActivityListOperations = ListDashboardOperations & {
  openLinkedDonations: (activity: Activity) => void;
  openLinkedExpenses: (activity: Activity) => void;
};

export type ActivityListConfig = ListDashboardConfig<
  Activity,
  ActivityFilterCriteria,
  ActivityListContext,
  ActivityListOperations
>;

const PAGE_SIZE = 12;

const ACTIVITY_ROUTE_FILTER_BINDINGS = [
  { param: 'projectId', criteriaKey: 'projectId', type: 'string' as const },
  { param: 'status', criteriaKey: 'status', type: 'string' as const },
  { param: 'type', criteriaKey: 'type', type: 'string' as const },
  { param: 'scale', criteriaKey: 'scale', type: 'string' as const },
  { param: 'assignedTo', criteriaKey: 'assignedTo', type: 'string' as const },
  { param: 'organizerId', criteriaKey: 'organizerId', type: 'string' as const },
];

export function createActivityListConfig(deps: {
  data: ActivityDataSource;
  authorization: AuthorizationService;
  context: ActivityListContext;
  openLinkedFinance: (activity: Activity, target: ActivityLinkedFinance) => void;
}): ActivityListConfig {
  const labelMap = (options: { key: string; label: string }[]): ReadonlyMap<string, string> =>
    new Map(options.map(option => [option.key, option.label]));

  const open = (target: ActivityLinkedFinance) =>
    (activity: Activity): void => deps.openLinkedFinance(activity, target);

  return {
    list: {
      pageSize: PAGE_SIZE,
      chips: [...ACTIVITY_LIST_CHIPS],
      defaultChip: ACTIVITY_DEFAULT_CHIP,
      isValidChip: isActivityPrimaryChip,
      route: {
        chipConfig: {
          defaultChip: ACTIVITY_DEFAULT_CHIP,
          normalize: chip => normalizeActivityChip(chip),
        },
        filterBindings: ACTIVITY_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneActivityCriteria,
      getDefaultCriteriaForChip: chip =>
        getDefaultCriteriaForChip(chip as ActivityPrimaryChip, deps.context.projectId),
      buildFilterFormDefinition: (_chip, refData) =>
        buildActivityFilterForm(refData as ActivityRefDataMap, {
          projectOptions: deps.context.projectOptions,
          userOptions: deps.context.userOptions,
        }),
      criteriaToFilterFormValues: (_chip, criteria) => activityCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        activityValuesToCriteria(values, criteria),
      buildAppliedFilters: (criteria, refData) =>
        buildActivityAppliedFilters(criteria, refData, deps.context),
      countActiveSheetFilters: countActiveActivitySheetFilters,
      removeFilterById: removeActivityFilterById,
      loadPage: (query, ctx) => deps.data.loadListPage({
        chipId: normalizeActivityChip(query.chipId),
        criteria: query.criteria as ActivityFilterCriteria,
        searchText: query.searchText,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      }).pipe(
        map(page => ({
          items: (page.content ?? []).map(activity => mapActivityListRow(
            activity,
            ctx.refData as ActivityRefDataMap,
            labelMap(deps.context.projectOptions),
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
      mapToListRow: (activity, ctx) => mapActivityListRow(
        activity,
        ctx.refData as ActivityRefDataMap,
        labelMap(deps.context.projectOptions),
      ),
    },
    detail: {
      getTitle: activity => activity.name,
      getEntityId: activity => activity.id,
      buildViewSections: (activity, refData) =>
        buildActivityDetailSections(activity, refData as ActivityRefDataMap, {
          projects: labelMap(deps.context.projectOptions),
          users: labelMap(deps.context.userOptions),
        }),
      fetchById: id => deps.data.fetchActivityById(id, deps.context.projectId).pipe(
        catchError(() => of(undefined)),
      ),
      findInList: (items, id) => items
        .map(item => item.payload as Activity | undefined)
        .find(activity => activity?.id === id),
      primaryAction: {
        label: 'Update activity',
        when: context => context.canUpdate(),
      },
      edit: {
        buildEditSummary: context =>
          buildActivityEditSummary(context.entity, context.refData as ActivityRefDataMap),
        buildEditForm: context => buildActivityUpdateForm(
          context.entity,
          context.refData as ActivityRefDataMap,
          deps.context.userOptions,
        ),
        entityToEditValues: activityToUpdateValues,
        refreshEditForm: context => buildActivityUpdateForm(
          context.entity,
          context.refData as ActivityRefDataMap,
          deps.context.userOptions,
        ),
        save: context => {
          const merged = { ...context.entity, ...activityUpdatePatch(context.values) };
          const payload = compareObjects(merged, context.entity);
          return deps.data.updateActivity(
            context.entity.projectId,
            context.entity.id,
            payload as Partial<Activity>,
          );
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      buildCreateForm: refData => buildActivityCreateForm(refData as ActivityRefDataMap, {
        projectOptions: deps.context.projectOptions,
        userOptions: deps.context.userOptions,
        scopedProjectId: deps.context.projectId,
      }),
      defaultCreateValues: () => defaultActivityCreateValues(deps.context.projectId),
      validateBeforeCreate: values => {
        const projectId = deps.context.projectId ?? activityProjectId(values);
        if (!projectId) {
          return 'Select the project this activity belongs to.';
        }
        if (!values['startDate']) {
          return 'Select a start date.';
        }
        if (values['scale'] === 'EVENT' && !values['organizerId']) {
          return 'An event needs an organizer.';
        }
        return undefined;
      },
      createSave: values => {
        const projectId = deps.context.projectId ?? activityProjectId(values);
        if (!projectId) {
          return throwError(() => new Error('Select the project this activity belongs to.'));
        }
        return deps.data.createActivity(projectId, activityCreateEntity(values));
      },
    },
    actionForms: {
      linkExpense: {
        kind: 'form',
        title: activity => `Link expense to ${activity.name}`,
        saveLabel: 'Link expense',
        preparationTasks: ['activityExpenses'],
        defaultValues: () => ({ expenseId: '' }),
        buildForm: () => buildLinkExpenseForm(deps.context.expenseOptions),
        validateBeforeSave: context =>
          String(context.values['expenseId'] ?? '').trim()
            ? undefined
            : 'Select the expense to link.',
        save: context => deps.data.linkExpense(
          context.entity.projectId,
          context.entity.id,
          String(context.values['expenseId']),
        ),
        success: {
          mode: 'reloadList',
          message: 'Expense linked to the activity.',
        },
      },
    },
    meta: {
      id: 'activity-list',
      title: 'Activity',
      pageName: 'Activities',
      searchPlaceholder: 'Search by activity name or location',
      filterSheetTitle: 'Filter activities',
      emptyMessage: 'No activities match this filter.',
      detailRouteSync: { idParam: 'activityId' },
    },
    permissions: {
      resolve: () => resolveActivityPermissions(deps.authorization),
    },
    behavior: {
      canUpdateEntity: context => !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'activityOptions',
          cache: 'instance',
          run: async (context: ActivityListContext) => {
            const [projects, users] = await Promise.all([
              firstValueFrom(deps.data.fetchProjectOptions().pipe(catchError(() => of([])))),
              firstValueFrom(deps.data.fetchUserOptions().pipe(catchError(() => of([])))),
            ]);
            context.projectOptions = projects;
            context.userOptions = users;
            return { projects, users };
          },
        },
        {
          id: 'activityExpenses',
          cache: 'instance',
          run: async (context: ActivityListContext) => {
            context.expenseOptions = await firstValueFrom(
              deps.data.fetchExpenseOptions().pipe(catchError(() => of([]))),
            );
            return context.expenseOptions;
          },
        },
      ],
      triggers: {
        init: ['activityOptions'],
        filterOpen: ['activityOptions'],
        createOpen: ['activityOptions'],
        editPrepare: ['activityOptions'],
      },
    },
    operations: {
      openLinkedDonations: open('donations'),
      openLinkedExpenses: open('expenses'),
    },
    actions: {
      floating: [
        {
          id: 'create',
          label: 'Add activity',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
      rowMenu: [
        {
          id: 'linkedDonations',
          label: 'Linked donations',
          icon: 'volunteer_activism',
          when: ctx => !!ctx.permissions['canReadDonations'],
          run: 'openLinkedDonations',
        },
        {
          id: 'linkedExpenses',
          label: 'Linked expenses',
          icon: 'payments',
          when: ctx => !!ctx.permissions['canReadExpenses'],
          run: 'openLinkedExpenses',
        },
      ],
      detailFooter: [
        {
          id: 'linkExpense',
          label: 'Link expense',
          appearance: 'secondary',
          when: ctx => !!ctx.permissions['canLinkExpense'],
          run: 'linkExpense',
          actionFormId: 'linkExpense',
        },
      ],
    },
  };
}
