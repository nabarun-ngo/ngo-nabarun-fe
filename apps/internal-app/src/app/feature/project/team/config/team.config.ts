import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type {
  ListDashboardConfig,
  ListDashboardOperations,
} from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, throwError } from 'rxjs';
import { compareObjects } from 'src/app/shared/utils/utilities.service';
import type { TeamDataSource } from '../data/team-data.source';
import type {
  TeamFilterCriteria,
  TeamListContext,
  TeamMember,
  TeamPrimaryChip,
  TeamRefDataMap,
} from '../domain';
import {
  buildTeamCreateForm,
  buildTeamDeactivateForm,
  buildTeamEditSummary,
  buildTeamFilterForm,
  buildTeamUpdateForm,
  defaultTeamCreateValues,
  teamCreateEntity,
  teamCriteriaToValues,
  teamDeactivateValues,
  teamProjectId,
  teamToUpdateValues,
  teamUpdatePatch,
  teamValuesToCriteria,
} from './team.forms';
import {
  buildTeamAppliedFilters,
  cloneTeamCriteria,
  countActiveTeamSheetFilters,
  getDefaultCriteriaForChip,
  isTeamPrimaryChip,
  normalizeTeamChip,
  removeTeamFilterById,
  resolveTeamPermissions,
  TEAM_DEFAULT_CHIP,
  TEAM_LIST_CHIPS,
} from './team.rules';
import { buildTeamDetailSections, mapTeamListRow, teamMemberLabel } from './team.view';

export type TeamListOperations = ListDashboardOperations;

export type TeamListConfig = ListDashboardConfig<
  TeamMember,
  TeamFilterCriteria,
  TeamListContext,
  TeamListOperations
>;

const PAGE_SIZE = 12;

const TEAM_ROUTE_FILTER_BINDINGS = [
  { param: 'projectId', criteriaKey: 'projectId', type: 'string' as const },
  { param: 'role', criteriaKey: 'role', type: 'string' as const },
  { param: 'userId', criteriaKey: 'userId', type: 'string' as const },
];

export function createTeamListConfig(deps: {
  data: TeamDataSource;
  authorization: AuthorizationService;
  context: TeamListContext;
}): TeamListConfig {
  const memberLabel = (userId: string): string | undefined =>
    deps.context.userOptions.find(option => option.key === userId)?.label;
  const projectLabel = (projectId: string): string | undefined =>
    deps.context.projectOptions.find(option => option.key === projectId)?.label;
  const scopedProject = (criteria?: TeamFilterCriteria): string | undefined =>
    deps.context.projectId ?? criteria?.projectId;

  return {
    list: {
      pageSize: PAGE_SIZE,
      chips: [...TEAM_LIST_CHIPS],
      defaultChip: TEAM_DEFAULT_CHIP,
      isValidChip: isTeamPrimaryChip,
      route: {
        chipConfig: {
          defaultChip: TEAM_DEFAULT_CHIP,
          normalize: chip => normalizeTeamChip(chip),
        },
        filterBindings: TEAM_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneTeamCriteria,
      getDefaultCriteriaForChip: chip =>
        getDefaultCriteriaForChip(chip as TeamPrimaryChip, deps.context.projectId),
      buildFilterFormDefinition: (_chip, refData) =>
        buildTeamFilterForm(refData as TeamRefDataMap, {
          projectOptions: deps.context.projectOptions,
          userOptions: deps.context.userOptions,
          scopedProjectId: deps.context.projectId,
        }),
      criteriaToFilterFormValues: (_chip, criteria) => teamCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        teamValuesToCriteria(values, criteria),
      buildAppliedFilters: (criteria, refData) =>
        buildTeamAppliedFilters(criteria, refData, deps.context),
      countActiveSheetFilters: countActiveTeamSheetFilters,
      removeFilterById: removeTeamFilterById,
      loadPage: (query, ctx) => deps.data.loadListPage({
        chipId: normalizeTeamChip(query.chipId),
        criteria: {
          ...(query.criteria as TeamFilterCriteria),
          projectId: scopedProject(query.criteria as TeamFilterCriteria),
        },
        searchText: query.searchText,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      }).pipe(
        map(page => ({
          items: (page.content ?? []).map(member => mapTeamListRow(
            member,
            ctx.refData as TeamRefDataMap,
            memberLabel(member.userId),
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
      mapToListRow: (member, ctx) => mapTeamListRow(
        member,
        ctx.refData as TeamRefDataMap,
        memberLabel(member.userId),
      ),
    },
    detail: {
      getTitle: member => teamMemberLabel(member, memberLabel(member.userId)),
      getEntityId: member => member.id,
      buildViewSections: (member, refData) => buildTeamDetailSections(
        member,
        refData as TeamRefDataMap,
        {
          memberLabel: memberLabel(member.userId),
          projectLabel: projectLabel(member.projectId),
        },
      ),
      fetchById: id => {
        const projectId = scopedProject();
        return projectId
          ? deps.data.fetchTeamMemberById(projectId, id).pipe(catchError(() => of(undefined)))
          : of(undefined);
      },
      findInList: (items, id) => items
        .map(item => item.payload as TeamMember | undefined)
        .find(member => member?.id === id),
      primaryAction: {
        label: 'Update member',
        when: context => context.canUpdate() && context.entity.isActive,
      },
      edit: {
        buildEditSummary: context => buildTeamEditSummary(
          context.entity,
          teamMemberLabel(context.entity, memberLabel(context.entity.userId)),
        ),
        buildEditForm: context =>
          buildTeamUpdateForm(context.entity, context.refData as TeamRefDataMap),
        entityToEditValues: teamToUpdateValues,
        refreshEditForm: context =>
          buildTeamUpdateForm(context.entity, context.refData as TeamRefDataMap),
        save: context => {
          const merged = { ...context.entity, ...teamUpdatePatch(context.values) };
          const payload = compareObjects(merged, context.entity);
          return deps.data.updateTeamMember(
            context.entity.projectId,
            context.entity.id,
            payload as Partial<TeamMember>,
          );
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      buildCreateForm: refData =>
        buildTeamCreateForm(refData as TeamRefDataMap, {
          projectOptions: deps.context.projectOptions,
          userOptions: deps.context.userOptions,
          scopedProjectId: deps.context.projectId,
        }),
      defaultCreateValues: () => defaultTeamCreateValues(deps.context.projectId),
      validateBeforeCreate: values => {
        if (!(deps.context.projectId ?? teamProjectId(values))) {
          return 'Select the project this member joins.';
        }
        return values['userId'] ? undefined : 'Select the member to add.';
      },
      createSave: values => {
        const projectId = deps.context.projectId ?? teamProjectId(values);
        if (!projectId) {
          return throwError(() => new Error('Select the project this member joins.'));
        }
        return deps.data.addTeamMember(projectId, teamCreateEntity(values));
      },
    },
    actionForms: {
      deactivateMember: {
        kind: 'form',
        title: member => `Deactivate ${teamMemberLabel(member, memberLabel(member.userId))}`,
        saveLabel: 'Deactivate',
        defaultValues: member => teamDeactivateValues(
          member,
          teamMemberLabel(member, memberLabel(member.userId)),
        ),
        buildForm: member => buildTeamDeactivateForm(member),
        save: context => deps.data.deactivateTeamMember(
          context.entity.projectId,
          context.entity.id,
        ),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Team member deactivated.',
        },
      },
    },
    meta: {
      id: 'team-list',
      title: 'Team member',
      pageName: 'Team',
      searchPlaceholder: 'Search by member or responsibility',
      filterSheetTitle: 'Filter team',
      emptyMessage: deps.context.projectId
        ? 'No team members match this filter.'
        : 'Choose a project from the filter to see its team.',
      detailRouteSync: { idParam: 'memberId' },
    },
    permissions: {
      resolve: () => resolveTeamPermissions(deps.authorization),
    },
    behavior: {
      canUpdateEntity: context => !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'teamProjects',
          cache: 'instance',
          run: async (context: TeamListContext) => {
            context.projectOptions = await firstValueFrom(
              deps.data.fetchProjectOptions().pipe(catchError(() => of([]))),
            );
            return context.projectOptions;
          },
        },
        {
          id: 'teamMembers',
          cache: 'instance',
          run: async (context: TeamListContext) => {
            context.userOptions = await firstValueFrom(
              deps.data.fetchUserOptions().pipe(catchError(() => of([]))),
            );
            return context.userOptions;
          },
        },
      ],
      triggers: {
        init: ['teamProjects', 'teamMembers'],
        filterOpen: ['teamProjects', 'teamMembers'],
        createOpen: ['teamProjects', 'teamMembers'],
      },
    },
    actions: {
      floating: [
        {
          id: 'create',
          label: 'Add team member',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
      detailFooter: [
        {
          id: 'deactivateMember',
          label: 'Deactivate',
          appearance: 'primary',
          when: ctx => {
            const entity = ctx.entity as TeamMember | undefined;
            return !!entity
              && !!ctx.permissions['canDeactivate']
              && entity.isActive;
          },
          run: 'deactivateMember',
          actionFormId: 'deactivateMember',
        },
      ],
    },
  };
}
