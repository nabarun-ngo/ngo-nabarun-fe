import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type {
  ListDashboardConfig,
  ListDashboardOperations,
} from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { compareObjects } from 'src/app/shared/utils/utilities.service';
import {
  createFollowMenuActions,
  createFollowOperations,
} from 'src/app/shared/correspondence/follow-list-actions';
import type { CorrespondenceFollowService } from 'src/app/shared/correspondence/correspondence-follow.service';
import type { ProjectDataSource } from '../data/project-data.source';
import type {
  Project,
  ProjectFilterCriteria,
  ProjectListContext,
  ProjectPrimaryChip,
  ProjectRefDataMap,
} from '../domain';
import {
  buildProjectCreateForm,
  buildProjectEditSummary,
  buildProjectFilterForm,
  buildProjectUpdateForm,
  defaultProjectCreateValues,
  projectCreateEntity,
  projectCriteriaToValues,
  projectToUpdateValues,
  projectUpdatePatch,
  projectValuesToCriteria,
} from './project.forms';
import {
  buildProjectAppliedFilters,
  canUpdateProject,
  cloneProjectCriteria,
  countActiveProjectSheetFilters,
  getDefaultCriteriaForChip,
  isProjectPrimaryChip,
  normalizeProjectChip,
  PROJECT_DEFAULT_CHIP,
  PROJECT_LIST_CHIPS,
  removeProjectFilterById,
  resolveProjectPermissions,
} from './project.rules';
import {
  buildProjectDashboardLoading,
  buildProjectDashboardSection,
  buildProjectDetailSections,
  mapProjectListRow,
} from './project.view';

/** Child lists reachable from the project detail sheet. */
export type ProjectChildList =
  | 'activities'
  | 'goals'
  | 'beneficiaries'
  | 'milestones'
  | 'team'
  | 'risks';

export type ProjectListOperations = ListDashboardOperations & {
  openActivities: (project: Project) => void;
  openGoals: (project: Project) => void;
  openBeneficiaries: (project: Project) => void;
  openMilestones: (project: Project) => void;
  openTeam: (project: Project) => void;
  openRisks: (project: Project) => void;
  followResource: (project: Project) => void;
  unfollowResource: (project: Project) => void;
};

export type ProjectListConfig = ListDashboardConfig<
  Project,
  ProjectFilterCriteria,
  ProjectListContext,
  ProjectListOperations
>;

const PAGE_SIZE = 12;

const PROJECT_ROUTE_FILTER_BINDINGS = [
  { param: 'status', criteriaKey: 'status', type: 'string' as const },
  { param: 'category', criteriaKey: 'category', type: 'string' as const },
  { param: 'phase', criteriaKey: 'phase', type: 'string' as const },
  { param: 'managerId', criteriaKey: 'managerId', type: 'string' as const },
  { param: 'sponsorId', criteriaKey: 'sponsorId', type: 'string' as const },
  { param: 'location', criteriaKey: 'location', type: 'string' as const },
  { param: 'tags', criteriaKey: 'tags', type: 'csv' as const },
];

export function createProjectListConfig(deps: {
  data: ProjectDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  follow: CorrespondenceFollowService;
  context: ProjectListContext;
  openChildList: (project: Project, child: ProjectChildList) => void;
}): ProjectListConfig {
  const userLabels = (): ReadonlyMap<string, string> =>
    new Map(deps.context.userOptions.map(option => [option.key, option.label]));
  const open = (child: ProjectChildList) =>
    (project: Project): void => deps.openChildList(project, child);
  const followActions = createFollowMenuActions({
    resourceType: 'project',
    follow: deps.follow,
    authorization: deps.authorization,
  });
  const followOps = createFollowOperations({
    resourceType: 'project',
    follow: deps.follow,
    modal: deps.modal,
    label: 'project',
  });

  return {
    list: {
      pageSize: PAGE_SIZE,
      chips: [...PROJECT_LIST_CHIPS],
      defaultChip: PROJECT_DEFAULT_CHIP,
      isValidChip: isProjectPrimaryChip,
      route: {
        chipConfig: {
          defaultChip: PROJECT_DEFAULT_CHIP,
          normalize: chip => normalizeProjectChip(chip),
        },
        filterBindings: PROJECT_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneProjectCriteria,
      getDefaultCriteriaForChip: chip =>
        getDefaultCriteriaForChip(chip as ProjectPrimaryChip),
      buildFilterFormDefinition: (_chip, refData) =>
        buildProjectFilterForm(refData as ProjectRefDataMap, deps.context.userOptions),
      criteriaToFilterFormValues: (_chip, criteria) => projectCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        projectValuesToCriteria(values, criteria),
      buildAppliedFilters: (criteria, refData) =>
        buildProjectAppliedFilters(criteria, refData, deps.context),
      countActiveSheetFilters: countActiveProjectSheetFilters,
      removeFilterById: removeProjectFilterById,
      loadPage: (query, ctx) => deps.data.loadListPage({
        chipId: normalizeProjectChip(query.chipId),
        criteria: query.criteria as ProjectFilterCriteria,
        searchText: query.searchText,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      }).pipe(
        map(page => ({
          items: (page.content ?? []).map(project =>
            mapProjectListRow(project, ctx.refData as ProjectRefDataMap)),
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
      mapToListRow: (project, ctx) =>
        mapProjectListRow(project, ctx.refData as ProjectRefDataMap),
    },
    detail: {
      getTitle: project => project.name,
      getEntityId: project => project.id,
      buildViewSections: (project, refData) =>
        buildProjectDetailSections(project, refData as ProjectRefDataMap, userLabels()),
      documents: {
        buildLoadingSection: buildProjectDashboardLoading,
        loadSection: id => deps.data.fetchDashboard(id).pipe(
          map(buildProjectDashboardSection),
          catchError(() => of(buildProjectDashboardSection())),
        ),
      },
      fetchById: id => deps.data.fetchProjectById(id).pipe(
        catchError(() => of(undefined)),
      ),
      findInList: (items, id) => items
        .map(item => item.payload as Project | undefined)
        .find(project => project?.id === id),
      primaryAction: {
        label: 'Update project',
        when: context => context.canUpdate()
          && canUpdateProject(deps.authorization, context.entity),
      },
      edit: {
        buildEditSummary: context =>
          buildProjectEditSummary(context.entity, context.refData as ProjectRefDataMap),
        buildEditForm: context => buildProjectUpdateForm(
          context.entity,
          context.refData as ProjectRefDataMap,
          deps.context.userOptions,
        ),
        entityToEditValues: projectToUpdateValues,
        refreshEditForm: context => buildProjectUpdateForm(
          context.entity,
          context.refData as ProjectRefDataMap,
          deps.context.userOptions,
        ),
        save: context => {
          const merged = { ...context.entity, ...projectUpdatePatch(context.values) };
          const payload = compareObjects(merged, context.entity);
          return deps.data.updateProject(context.entity.id, payload as Partial<Project>);
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      buildCreateForm: refData =>
        buildProjectCreateForm(refData as ProjectRefDataMap, deps.context.userOptions),
      defaultCreateValues: () => defaultProjectCreateValues(),
      validateBeforeCreate: values => {
        const budget = Number(values['budget']);
        if (!Number.isFinite(budget) || budget <= 0) {
          return 'Enter a budget greater than zero.';
        }
        if (!values['managerId']) {
          return 'Select a project manager.';
        }
        return undefined;
      },
      createSave: values => deps.data.createProject(projectCreateEntity(values)),
    },
    meta: {
      id: 'project-list',
      title: 'Project',
      pageName: 'Projects',
      searchPlaceholder: 'Search by project name or code',
      filterSheetTitle: 'Filter projects',
      emptyMessage: 'No projects match this filter.',
      detailRouteSync: { idParam: 'projectId', idParamAliases: ['id'] },
    },
    permissions: {
      resolve: () => resolveProjectPermissions(deps.authorization),
    },
    behavior: {
      canUpdateEntity: context => !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'projectUsers',
          cache: 'instance',
          run: async (context: ProjectListContext) => {
            context.userOptions = await firstValueFrom(
              deps.data.fetchUserOptions().pipe(catchError(() => of([]))),
            );
            return context.userOptions;
          },
        },
      ],
      triggers: {
        init: ['projectUsers'],
        filterOpen: ['projectUsers'],
        createOpen: ['projectUsers'],
        editPrepare: ['projectUsers'],
      },
    },
    operations: {
      openActivities: open('activities'),
      openGoals: open('goals'),
      openBeneficiaries: open('beneficiaries'),
      openMilestones: open('milestones'),
      openTeam: open('team'),
      openRisks: open('risks'),
      followResource: followOps.followResource,
      unfollowResource: followOps.unfollowResource,
    },
    actions: {
      floating: [
        {
          id: 'create',
          label: 'Add project',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
      detailMenu: [...followActions],
      rowMenu: [
        ...followActions,
        {
          id: 'activities',
          label: 'Activities',
          icon: 'event_note',
          when: ctx => !!ctx.permissions['canReadActivity'],
          run: 'openActivities',
        },
        {
          id: 'goals',
          label: 'Goals',
          icon: 'flag',
          when: ctx => !!ctx.permissions['canReadGoal'],
          run: 'openGoals',
        },
        {
          id: 'beneficiaries',
          label: 'Beneficiaries',
          icon: 'groups',
          when: ctx => !!ctx.permissions['canReadBeneficiary'],
          run: 'openBeneficiaries',
        },
        {
          id: 'milestones',
          label: 'Milestones',
          icon: 'timeline',
          when: ctx => !!ctx.permissions['canReadMilestone'],
          run: 'openMilestones',
        },
        {
          id: 'team',
          label: 'Team',
          icon: 'group',
          when: ctx => !!ctx.permissions['canReadTeam'],
          run: 'openTeam',
        },
        {
          id: 'risks',
          label: 'Risks',
          icon: 'warning_amber',
          when: ctx => !!ctx.permissions['canReadRisk'],
          run: 'openRisks',
        },
      ],
    },
  };
}
