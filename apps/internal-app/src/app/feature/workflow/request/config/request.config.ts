import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, throwError } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import {
  createFollowMenuActions,
  createFollowOperations,
} from 'src/app/shared/correspondence/follow-list-actions';
import type { CorrespondenceFollowService } from 'src/app/shared/correspondence/correspondence-follow.service';
import type { RequestDataSource } from '../data/request-data.source';
import type {
  RequestFilterCriteria,
  RequestListContext,
  RequestPrimaryChip,
  RequestStartForm,
  WorkflowRequest,
} from '../domain';
import {
  buildAssignForm,
  buildDecisionNoteForm,
  buildRequestCreateStep,
  buildWithdrawForm,
  defaultRequestCreateValues,
  memberOptionsFromContext,
  REQUEST_CREATE_STEPS,
  requestCreatePayload,
  requestCriteriaToValues,
  requestValuesToCriteria,
  startFormFromContext,
  validateRequestCreate,
  validateRequestCreateStep,
  buildRequestFilterForm,
  type RequestCreateStep,
} from './request.forms';
import {
  buildRequestAppliedFilters,
  canAssignRequest,
  canCloseRequest,
  canDecideRequest,
  canReassignRequest,
  canStartWorkRequest,
  canWithdrawRequest,
  cloneRequestCriteria,
  countActiveRequestSheetFilters,
  createRequestContext,
  getDefaultCriteriaForChip,
  normalizeRequestChip,
  removeRequestFilterById,
  REQUEST_CHIPS,
  REQUEST_DEFAULT_CHIP,
  resolveRequestPermissions,
  toMemberFieldOptions,
} from './request.rules';
import { buildRequestDetailSections, mapRequestListRow } from './request.view';

export type RequestListConfig = ListDashboardConfig<
  WorkflowRequest,
  RequestFilterCriteria,
  RequestListContext,
  RequestListOperations
>;

export type RequestListOperations = {
  withdrawRequest(request: WorkflowRequest): void;
  followResource(request: WorkflowRequest): void;
  unfollowResource(request: WorkflowRequest): void;
};

const PAGE_SIZE = 12;

export { createRequestContext };

/** Fetches (and caches per type) the start form of the type chosen on step one. */
async function loadStartForm(
  deps: { data: RequestDataSource; context: RequestListContext },
  definitionId: string,
): Promise<RequestStartForm | undefined> {
  if (!definitionId) return undefined;

  const cached = deps.context.startFormsByDefinitionId?.[definitionId];
  if (cached) return cached;

  const startForm = await firstValueFrom(deps.data.fetchStartForm(definitionId));
  deps.context.startFormsByDefinitionId = {
    ...deps.context.startFormsByDefinitionId,
    [definitionId]: startForm,
  };
  return startForm;
}

function decisionNote(values: Record<string, unknown>): string | undefined {
  return String(values['note'] ?? '').trim() || undefined;
}

export function createRequestListConfig(deps: {
  data: RequestDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  follow: CorrespondenceFollowService;
  context: RequestListContext;
}): RequestListConfig {
  const followActions = createFollowMenuActions({
    resourceType: 'request',
    follow: deps.follow,
    authorization: deps.authorization,
  });
  const followOps = createFollowOperations({
    resourceType: 'request',
    follow: deps.follow,
    modal: deps.modal,
    label: 'request',
  });

  return {
    list: {
      pageSize: PAGE_SIZE,
      chips: [...REQUEST_CHIPS],
      defaultChip: REQUEST_DEFAULT_CHIP,
      isValidChip: chip => REQUEST_CHIPS.some(item => item.id === chip),
      route: {
        chipConfig: {
          defaultChip: REQUEST_DEFAULT_CHIP,
          normalize: normalizeRequestChip,
        },
        filterBindings: [
          { param: 'status', criteriaKey: 'status', type: 'csv' },
          { param: 'definitionId', criteriaKey: 'definitionId', type: 'csv' },
          { param: 'filterRequestId', criteriaKey: 'requestId', type: 'string' },
        ],
      },
      cloneCriteria: cloneRequestCriteria,
      getDefaultCriteriaForChip: chip =>
        getDefaultCriteriaForChip(chip as RequestPrimaryChip),
      buildFilterFormDefinition: (chip, refData) =>
        buildRequestFilterForm(
          chip as RequestPrimaryChip,
          refData as RequestListContext['refData'],
        ),
      criteriaToFilterFormValues: (_chip, criteria) =>
        requestCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values) =>
        requestValuesToCriteria(values),
      buildAppliedFilters: criteria => buildRequestAppliedFilters(criteria),
      countActiveSheetFilters: countActiveRequestSheetFilters,
      removeFilterById: removeRequestFilterById,
      loadPage: (query, context) => {
        const chipId = normalizeRequestChip(query.chipId);
        const listContext = context as RequestListContext;
        return deps.data.loadRequestPage({
          ...query,
          chipId,
          criteria: query.criteria as RequestFilterCriteria,
          refData: listContext.refData,
          currentUserId: listContext.currentUserId,
        }).pipe(
          map(page => ({
            items: (page.content ?? []).map(item =>
              mapRequestListRow(item, listContext.refData)),
            totalSize: page.totalSize ?? 0,
            pageIndex: query.pageIndex,
            pageSize: PAGE_SIZE,
          })),
          catchError(() => of({
            items: [],
            totalSize: 0,
            pageIndex: query.pageIndex,
            pageSize: PAGE_SIZE,
          })),
        );
      },
      mapToListRow: (entity, ctx) =>
        mapRequestListRow(entity, ctx.refData as RequestListContext['refData']),
    },
    detail: {
      getTitle: request => request.name || 'Request',
      getEntityId: request => request.id,
      buildViewSections: (request, refData) =>
        buildRequestDetailSections(request, refData as RequestListContext['refData']),
      fetchById: id => deps.data.fetchRequestById(id).pipe(
        catchError(() => of(undefined)),
      ),
      findInList: (items, id) => items
        .map(item => item.payload as WorkflowRequest | undefined)
        .find(item => item?.id === id),
      // List rows carry no timeline or submitted answers, so the sheet reloads
      // the full request once it is open.
      refreshOnOpen: request => deps.data.fetchRequestById(request.id).pipe(
        map(loaded => loaded ? { ...request, ...loaded } : request),
        catchError(() => of(request)),
      ),
      edit: {
        buildEditSummary: context => [
          { label: 'Request', value: context.entity.name },
          { label: 'Status', value: context.entity.status },
        ],
        buildEditForm: () => ({
          id: 'request-edit-stub',
          key: 'request-edit-stub',
          label: 'Edit',
          description: '',
          fields: [],
        }),
        entityToEditValues: () => ({}),
        save: context => of(context.entity),
      },
    },
    create: {
      kind: 'stepper',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      steps: REQUEST_CREATE_STEPS,
      defaultCreateValues: () => defaultRequestCreateValues(),
      // The start form of the picked type only — never every type up front.
      prepareStep: async (step, values) => {
        if (step !== 'request_details') return;
        await loadStartForm(deps, String(values['definitionId'] ?? '').trim());
      },
      buildStepDefinition: (step, values) => buildRequestCreateStep(
        step as RequestCreateStep,
        deps.context.refData,
        memberOptionsFromContext(deps.context),
        startFormFromContext(deps.context, String(values['definitionId'] ?? '').trim()),
      ),
      validateStep: (step, values) => validateRequestCreateStep(
        step as RequestCreateStep,
        values,
        startFormFromContext(deps.context, String(values['definitionId'] ?? '').trim()),
      ),
      createSave: values => {
        const startForm = startFormFromContext(
          deps.context,
          String(values['definitionId'] ?? '').trim(),
        );
        const error = validateRequestCreate(values, startForm);
        if (error) return throwError(() => new Error(error));
        return deps.data.startRequest(requestCreatePayload(values, startForm));
      },
    },
    actionForms: {
      startWorkRequest: {
        kind: 'form',
        title: request => `Start ${request.name || 'request'}`,
        saveLabel: 'Start',
        defaultValues: () => ({}),
        buildForm: () => ({
          id: 'request-start',
          key: 'request-start',
          label: 'Start',
          description: 'Start this request so you can fulfill it.',
          fields: [],
        }),
        save: context => deps.data.startWorkRequest(context.entity.id),
        success: {
          mode: 'reloadList',
          message: 'Request started.',
        },
      },
      assignRequest: {
        kind: 'form',
        title: request => `Assign ${request.name || 'request'}`,
        saveLabel: 'Assign',
        preparationTasks: ['requestMembers'],
        defaultValues: () => ({ assigneeId: '' }),
        buildForm: (_entity, ctx) => buildAssignForm(
          memberOptionsFromContext(
            (ctx.preparationContext as RequestListContext | undefined) ?? deps.context,
          ),
        ),
        validateBeforeSave: context => {
          const assigneeId = String(context.values['assigneeId'] ?? '').trim();
          return assigneeId ? undefined : 'Select an assignee.';
        },
        save: context => {
          const assigneeId = String(context.values['assigneeId'] ?? '').trim();
          if (!assigneeId) return throwError(() => new Error('Select an assignee.'));
          return deps.data.assignRequest(context.entity.id, assigneeId);
        },
        success: {
          mode: 'reloadList',
          message: 'Request assigned.',
        },
      },
      reassignRequest: {
        kind: 'form',
        title: request => `Reassign ${request.name || 'request'}`,
        saveLabel: 'Reassign',
        preparationTasks: ['requestMembers'],
        defaultValues: () => ({ assigneeId: '' }),
        buildForm: (_entity, ctx) => buildAssignForm(
          memberOptionsFromContext(
            (ctx.preparationContext as RequestListContext | undefined) ?? deps.context,
          ),
        ),
        validateBeforeSave: context => {
          const assigneeId = String(context.values['assigneeId'] ?? '').trim();
          return assigneeId ? undefined : 'Select an assignee.';
        },
        save: context => {
          const assigneeId = String(context.values['assigneeId'] ?? '').trim();
          if (!assigneeId) return throwError(() => new Error('Select an assignee.'));
          return deps.data.assignRequest(context.entity.id, assigneeId);
        },
        success: {
          mode: 'reloadList',
          message: 'Request reassigned.',
        },
      },
      closeRequest: {
        kind: 'form',
        title: request => `Mark complete ${request.name || 'request'}`,
        saveLabel: 'Mark complete',
        defaultValues: () => ({ note: '' }),
        buildForm: () => buildDecisionNoteForm('request-close', 'Mark complete'),
        save: context => deps.data.closeRequest(context.entity.id, {
          note: decisionNote(context.values),
        }),
        success: {
          mode: 'reloadList',
          message: 'Request marked complete.',
        },
      },
      approveRequest: {
        kind: 'form',
        title: request => `Approve ${request.name || 'request'}`,
        saveLabel: 'Approve',
        defaultValues: () => ({ note: '' }),
        buildForm: () => buildDecisionNoteForm('request-approve', 'Approve request'),
        save: context => deps.data.approveRequest(context.entity.id, {
          note: decisionNote(context.values),
        }),
        success: {
          mode: 'reloadList',
          message: 'Request approved.',
        },
      },
      rejectRequest: {
        kind: 'form',
        title: request => `Reject ${request.name || 'request'}`,
        saveLabel: 'Reject',
        defaultValues: () => ({ note: '' }),
        buildForm: () => buildDecisionNoteForm('request-reject', 'Reject request'),
        save: context => deps.data.rejectRequest(context.entity.id, {
          note: decisionNote(context.values),
        }),
        success: {
          mode: 'reloadList',
          message: 'Request rejected.',
        },
      },
      withdrawRequest: {
        kind: 'form',
        title: request => `Withdraw ${request.name || 'request'}`,
        saveLabel: 'Withdraw',
        defaultValues: () => ({ note: '' }),
        buildForm: entity => buildWithdrawForm(entity),
        save: context => deps.data.withdrawRequest(context.entity.id, {
          note: decisionNote(context.values),
        }),
        success: {
          mode: 'reloadList',
          message: 'Request withdrawn.',
        },
      },
    },
    operations: {
      withdrawRequest: request => {
        if (!canWithdrawRequest(
          request,
          deps.context.currentUserId,
          resolveRequestPermissions(deps.authorization),
        )) return;
        deps.modal.openNotificationModal({
          title: 'Withdraw request',
          description: 'Are you sure you want to withdraw this request?',
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.withdrawRequest(request.id).subscribe({
            next: () => {
              deps.modal.openNotificationModal({
                title: 'Request withdrawn',
                description: `${request.name || request.id} was withdrawn.`,
              }, 'notification', 'success');
            },
            error: () => {
              deps.modal.openNotificationModal({
                title: 'Withdraw failed',
                description: 'Could not withdraw this request.',
              }, 'notification', 'error');
            },
          });
        });
      },
      followResource: followOps.followResource,
      unfollowResource: followOps.unfollowResource,
    },
    meta: {
      id: 'workflow-request',
      title: 'Requests',
      pageName: 'Requests',
      searchPlaceholder: 'Type · status · request id…',
      filterSheetTitle: 'Filter requests',
      emptyMessage: 'No requests match this filter.',
      detailRouteSync: { idParam: 'requestId', idParamAliases: ['id'] },
    },
    permissions: { resolve: () => resolveRequestPermissions(deps.authorization) },
    behavior: {
      canUpdateEntity: context => !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'requestMembers',
          cache: 'instance',
          run: async (context: RequestListContext) => {
            try {
              const members = await firstValueFrom(
                deps.data.fetchActiveMembers().pipe(
                  catchError(() => of([] as RequestListContext['members'])),
                ),
              );
              context.members = members;
              context.memberOptions = toMemberFieldOptions(members);
              return members;
            } catch {
              context.members = [];
              context.memberOptions = [];
              return [];
            }
          },
        },
      ],
      triggers: {
        init: [],
        filterOpen: [],
        createOpen: ['requestMembers'],
      },
    },
    actions: {
      detailFooter: [
        {
          id: 'startWorkRequest',
          label: 'Start',
          appearance: 'primary',
          when: ctx => canStartWorkRequest(
            ctx.entity as WorkflowRequest | undefined,
            ctx.permissions,
            ctx.activeChip,
          ),
          run: 'startWorkRequest',
          actionFormId: 'startWorkRequest',
        },
        {
          id: 'closeRequest',
          label: 'Mark complete',
          appearance: 'primary',
          when: ctx => canCloseRequest(
            ctx.entity as WorkflowRequest | undefined,
            deps.context.currentUserId,
            ctx.activeChip,
            ctx.permissions,
          ),
          run: 'closeRequest',
          actionFormId: 'closeRequest',
        },
        {
          id: 'approveRequest',
          label: 'Approve',
          appearance: 'primary',
          when: ctx => canDecideRequest(
            ctx.entity as WorkflowRequest | undefined,
            ctx.activeChip,
          ) && !!ctx.permissions['canUpdateEntity'],
          run: 'approveRequest',
          actionFormId: 'approveRequest',
        },
        {
          id: 'rejectRequest',
          label: 'Reject',
          appearance: 'secondary',
          when: ctx => canDecideRequest(
            ctx.entity as WorkflowRequest | undefined,
            ctx.activeChip,
          ) && !!ctx.permissions['canUpdateEntity'],
          run: 'rejectRequest',
          actionFormId: 'rejectRequest',
        },
        {
          id: 'withdrawRequest',
          label: 'Withdraw',
          appearance: 'secondary',
          when: ctx => canWithdrawRequest(
            ctx.entity as WorkflowRequest | undefined,
            deps.context.currentUserId,
            ctx.permissions,
            ctx.activeChip,
          ),
          run: 'withdrawRequest',
          actionFormId: 'withdrawRequest',
        },
      ],
      // Routing lives in the overflow menu so the footer keeps only the action
      // that moves the request forward. Follow sits alongside routing.
      detailMenu: [
        ...followActions,
        {
          id: 'assignRequest',
          label: 'Assign',
          icon: 'person_add',
          when: ctx => canAssignRequest(
            ctx.entity as WorkflowRequest | undefined,
            ctx.permissions,
            ctx.activeChip,
          ),
          run: 'assignRequest',
          actionFormId: 'assignRequest',
        },
        {
          id: 'reassignRequest',
          label: 'Reassign',
          icon: 'swap_horiz',
          when: ctx => canReassignRequest(
            ctx.entity as WorkflowRequest | undefined,
            ctx.permissions,
            ctx.activeChip,
          ),
          run: 'reassignRequest',
          actionFormId: 'reassignRequest',
        },
      ],
      rowMenu: [...followActions],
      floating: [
        {
          id: 'create',
          label: 'New request',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
    },
  };
}
