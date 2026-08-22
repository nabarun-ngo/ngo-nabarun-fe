import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  createEditableMessageActionForm,
  type ListDashboardConfig,
} from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, throwError } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { date, shareToWhatsApp } from 'src/app/shared/utils/utilities.service';
import type { MeetingDataSource } from '../data/meeting-data.source';
import type {
  AgendaItem,
  Meeting,
  MeetingFilterCriteria,
  MeetingListContext,
  MeetingPrimaryChip,
} from '../domain';
import { isMeetingCancelled, isMeetingEnded } from '../domain';
import {
  agendaItemsToRows,
  agendaRowsToItems,
  attendeesFromSelectedIds,
  buildMeetingCreateStep,
  buildMeetingEntityFromForm,
  buildMeetingFilterForm,
  defaultMeetingCreateValues,
  MEETING_CREATE_STEPS,
  meetingCriteriaToValues,
  meetingToEditValues,
  meetingValuesToCriteria,
  memberOptionsFromContext,
  selectedAttendeeIds,
  validateMeetingBasics,
  validateMeetingCreateStep,
  type MeetingAgendaRow,
  type MeetingCreateStep,
} from './meeting.forms';
import {
  buildMeetingAppliedFilters,
  cloneMeetingCriteria,
  countActiveMeetingSheetFilters,
  createMeetingContext,
  getDefaultCriteriaForChip,
  MEETING_CHIPS,
  MEETING_DEFAULT_CHIP,
  normalizeMeetingChip,
  removeMeetingFilterById,
  resolveMeetingPermissions,
  toAttendeeFieldOptions,
} from './meeting.rules';
import {
  buildMeetingDetailSections,
  mapMeetingToListRow,
} from './meeting.view';

export type MeetingListConfig = ListDashboardConfig<
  Meeting,
  MeetingFilterCriteria,
  MeetingListContext,
  MeetingListOperations
>;

export type MeetingListOperations = {
  shareMeetingWhatsApp(meeting: Meeting): void;
  cancelMeeting(meeting: Meeting): void;
};

const MOBILE_PAGE_SIZE = 12;

export { createMeetingContext };

export function createMeetingListConfig(deps: {
  data: MeetingDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  context: MeetingListContext;
}): MeetingListConfig {
  const permissions = () => resolveMeetingPermissions(deps.authorization);

  return {
    list: {
      pageSize: MOBILE_PAGE_SIZE,
      chips: [...MEETING_CHIPS],
      defaultChip: MEETING_DEFAULT_CHIP,
      isValidChip: chip => MEETING_CHIPS.some(item => item.id === chip),
      route: {
        chipConfig: {
          defaultChip: MEETING_DEFAULT_CHIP,
          normalize: normalizeMeetingChip,
        },
        filterBindings: [
          { param: 'participantEmail', criteriaKey: 'participantEmail', type: 'string' },
          { param: 'createdById', criteriaKey: 'createdById', type: 'string' },
        ],
      },
      cloneCriteria: cloneMeetingCriteria,
      getDefaultCriteriaForChip: chip =>
        getDefaultCriteriaForChip(chip as MeetingPrimaryChip),
      buildFilterFormDefinition: (chip, refData) =>
        buildMeetingFilterForm(
          chip as MeetingPrimaryChip,
          refData as MeetingListContext['refData'],
          memberOptionsFromContext(deps.context),
        ),
      criteriaToFilterFormValues: (_chip, criteria) =>
        meetingCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values) =>
        meetingValuesToCriteria(values, deps.context.members),
      buildAppliedFilters: criteria => buildMeetingAppliedFilters(criteria),
      countActiveSheetFilters: countActiveMeetingSheetFilters,
      removeFilterById: removeMeetingFilterById,
      loadPage: (query, context) => {
        const chipId = normalizeMeetingChip(query.chipId);
        const listContext = context as MeetingListContext;
        return deps.data.loadMeetingPage({
          ...query,
          chipId,
          criteria: query.criteria as MeetingFilterCriteria,
          refData: listContext.refData,
          currentUserId: listContext.currentUserId,
        }).pipe(
          map(page => ({
            items: (page.content ?? []).map(mapMeetingToListRow),
            totalSize: page.totalSize ?? 0,
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
      mapToListRow: entity => mapMeetingToListRow(entity),
    },
    detail: {
      getTitle: meeting => meeting.summary || 'Meeting',
      buildViewSections: meeting => buildMeetingDetailSections(meeting),
      fetchById: id => deps.data.fetchMeetingById(id).pipe(
        catchError(() => of(undefined)),
      ),
      findInList: (items, id) => items
        .map(item => item.payload as Meeting | undefined)
        .find(item => item?.id === id),
      edit: {
        buildEditSummary: context => [
          { label: 'Summary', value: context.entity.summary },
          { label: 'Status', value: context.entity.status },
          {
            label: 'When',
            value: context.entity.startTime
              ? date(context.entity.startTime, 'dd MMM yyyy hh:mm a')
              : '-',
          },
        ],
        buildEditForm: context => buildMeetingCreateStep('basics', context.refData as MeetingListContext['refData']),
        entityToEditValues: meetingToEditValues,
        save: context => {
          const basicsError = validateMeetingBasics(context.values);
          if (basicsError) {
            return throwError(() => new Error(basicsError));
          }
          const entity = buildMeetingEntityFromForm(
            context.values,
            context.entity.agenda ?? [],
            context.entity.attendees ?? [],
          );
          return deps.data.updateMeeting(context.entity.id, entity);
        },
      },
    },
    create: {
      kind: 'stepper',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      steps: MEETING_CREATE_STEPS,
      customSteps: {
        agenda: { rendererKey: 'meetingAgenda' },
        attendees: { rendererKey: 'meetingAttendees' },
      },
      defaultCreateValues: () => defaultMeetingCreateValues(),
      buildStepDefinition: (step, _values, _runtime) =>
        buildMeetingCreateStep(
          step as MeetingCreateStep,
          deps.context.refData,
        ),
      validateStep: (step, values, runtime) =>
        validateMeetingCreateStep(
          step as MeetingCreateStep,
          values,
          runtime?.['customStepData'] as Record<string, unknown> | undefined,
        ),
      createSave: (values, runtime) => {
        const custom = (runtime?.['customStepData'] as Record<string, unknown> | undefined) ?? {};
        const agenda = agendaRowsToItems(
          (custom['agenda'] as MeetingAgendaRow[] | undefined) ?? [],
        );
        const attendeeIds = (custom['attendees'] as string[] | undefined) ?? [];
        if (!agenda.length) {
          return throwError(() => new Error('Add at least one agenda item.'));
        }
        if (!attendeeIds.length) {
          return throwError(() => new Error('Add at least one attendee.'));
        }
        const basicsError = validateMeetingBasics(values);
        if (basicsError) {
          return throwError(() => new Error(basicsError));
        }
        const attendees = attendeesFromSelectedIds(attendeeIds, deps.context.members);
        const entity = buildMeetingEntityFromForm(values, agenda, attendees);
        return deps.data.createMeeting({
          ...entity,
          createdById: deps.context.currentUserId,
        });
      },
    },
    actionForms: {
      shareMeeting: createEditableMessageActionForm<Meeting>({
        id: 'meeting-share-message',
        title: meeting => isMeetingEnded(meeting) ? 'Share minutes' : 'Share invite',
        fieldLabel: 'Message preview',
        saveLabel: 'Share on WhatsApp',
        defaultMessage: buildWhatsAppMessage,
        submit: message => {
          shareToWhatsApp(message);
          return of(undefined);
        },
      }),
      editMeeting: {
        kind: 'stepper',
        title: () => 'Update meeting',
        saveLabel: 'Save',
        preparationTasks: ['meetingMembers'],
        steps: MEETING_CREATE_STEPS,
        customSteps: {
          agenda: { rendererKey: 'meetingAgenda' },
          attendees: { rendererKey: 'meetingAttendees' },
        },
        defaultValues: entity => meetingToEditValues(entity),
        defaultCustomStepData: entity => ({
          agenda: agendaItemsToRows(entity.agenda),
          attendees: selectedAttendeeIds(entity),
        }),
        buildStepDefinition: (step, _values, _ctx) =>
          buildMeetingCreateStep(step as MeetingCreateStep, deps.context.refData),
        validateStep: (step, values, ctx) =>
          validateMeetingCreateStep(
            step as MeetingCreateStep,
            values,
            ctx.customStepData,
          ),
        save: ctx => {
          const agenda = agendaRowsToItems(
            (ctx.customStepData['agenda'] as MeetingAgendaRow[] | undefined) ?? [],
          );
          const attendeeIds = (ctx.customStepData['attendees'] as string[] | undefined) ?? [];
          if (!agenda.length) {
            return throwError(() => new Error('Add at least one agenda item.'));
          }
          if (!attendeeIds.length) {
            return throwError(() => new Error('Add at least one attendee.'));
          }
          const basicsError = validateMeetingBasics(ctx.values);
          if (basicsError) {
            return throwError(() => new Error(basicsError));
          }
          const attendees = attendeesFromSelectedIds(attendeeIds, deps.context.members);
          const entity = buildMeetingEntityFromForm(ctx.values, agenda, attendees);
          return deps.data.updateMeeting(ctx.entity.id, entity);
        },
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Meeting updated.',
        },
      },
    },
    operations: {
      shareMeetingWhatsApp: meeting => {
        shareToWhatsApp(buildWhatsAppMessage(meeting));
      },
      cancelMeeting: meeting => {
        if (!meeting?.id || isMeetingCancelled(meeting) || isMeetingEnded(meeting)) {
          return;
        }
        deps.modal.openNotificationModal({
          title: 'Cancel meeting',
          description: 'Are you sure you want to cancel this meeting?',
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.cancelMeeting(meeting.id).subscribe({
            next: () => {
              deps.modal.openNotificationModal({
                title: 'Meeting cancelled',
                description: `${meeting.summary} was cancelled.`,
              }, 'notification', 'success');
            },
            error: () => {
              deps.modal.openNotificationModal({
                title: 'Cancel failed',
                description: 'Could not cancel this meeting.',
              }, 'notification', 'error');
            },
          });
        });
      },
    },
    meta: {
      id: 'communication-meeting',
      title: 'Events & Meetings',
      pageName: 'Events & Meetings',
      searchPlaceholder: 'Participant email…',
      filterSheetTitle: 'Filter meetings',
      emptyMessage: 'No meetings match this filter.',
      detailRouteSync: { idParam: 'meetingId', idParamAliases: ['id'] },
    },
    permissions: { resolve: () => permissions() },
    behavior: {
      canUpdateEntity: context => !!context.permissions['canUpdateEntity'],
    },
    preparation: {
      tasks: [
        {
          id: 'meetingMembers',
          cache: 'instance',
          run: async (context: MeetingListContext) => {
            try {
              const members = await firstValueFrom(
                deps.data.fetchActiveMembers().pipe(
                  catchError(() => of([] as MeetingListContext['members'])),
                ),
              );
              context.members = members;
              context.attendeeOptions = toAttendeeFieldOptions(members);
              return members;
            } catch {
              context.members = [];
              context.attendeeOptions = [];
              return [];
            }
          },
        },
      ],
      triggers: {
        init: [],
        filterOpen: ['meetingMembers'],
        createOpen: ['meetingMembers'],
        editPrepare: ['meetingMembers'],
      },
    },
    actions: {
      detailFooter: [
        {
          id: 'cancelMeeting',
          label: 'Cancel event',
          appearance: 'secondary',
          when: ctx => {
            const entity = ctx.entity as Meeting | undefined;
            return !!ctx.permissions['canUpdateEntity']
              && !!entity
              && !isMeetingCancelled(entity)
              && !isMeetingEnded(entity);
          },
          run: 'cancelMeeting',
        },
        {
          id: 'shareInvite',
          label: 'Share invite',
          appearance: 'secondary',
          when: ctx => {
            const entity = ctx.entity as Meeting | undefined;
            return !!entity && !isMeetingEnded(entity);
          },
          run: 'shareMeetingWhatsApp',
          actionFormId: 'shareMeeting',
        },
        {
          id: 'shareMinutes',
          label: 'Share minutes',
          appearance: 'secondary',
          when: ctx => {
            const entity = ctx.entity as Meeting | undefined;
            return !!entity && isMeetingEnded(entity);
          },
          run: 'shareMeetingWhatsApp',
          actionFormId: 'shareMeeting',
        },
        {
          id: 'editMeeting',
          label: 'Update',
          appearance: 'primary',
          when: ctx => {
            const entity = ctx.entity as Meeting | undefined;
            return !!ctx.permissions['canUpdateEntity']
              && !!entity
              && !isMeetingCancelled(entity);
          },
          run: 'editMeeting',
          actionFormId: 'editMeeting',
        },
      ],
      floating: [
        {
          id: 'create',
          label: 'Schedule meeting',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
    },
  };
}

function buildWhatsAppMessage(meeting: Meeting): string {
  const ended = isMeetingEnded(meeting);
  const lines: string[] = [];
  const divider = '━━━━━━━━━━━━━━━━━━━';
  lines.push(ended ? '📅 *MEETING MINUTES*' : '📅 *MEETING INVITATION*');
  lines.push(divider, '');
  lines.push(`📢✨ *${meeting.summary.trim()}* ✨📢`, '');
  lines.push(
    `🗓️ *Date:* ${date(meeting.startTime)}`,
    `🕐 *Time:* ${date(meeting.startTime, 'hh:mm a')} - ${date(meeting.endTime, 'hh:mm a')}`,
  );
  if (meeting.type === 'OFFLINE' && meeting.location && !ended) {
    lines.push(`📍 *Location:* ${meeting.location}`);
  }
  if (meeting.type === 'ONLINE') {
    lines.push('💻 *Platform:* Google Meet');
  }
  if (!ended && meeting.meetLink) {
    lines.push(`🔗 *Join Link:* ${meeting.meetLink}`);
  }
  if (ended && meeting.attendees?.length) {
    lines.push('', '👥 *Attendees:*');
    meeting.attendees
      .filter(item => item.attended === 'Yes')
      .forEach(item => lines.push(`🙋‍♂️ ${item.name ?? item.email}`));
  }
  if (meeting.agenda?.length) {
    lines.push('', ended ? '📋 *Agenda & Outcome:*' : '📋 *Agenda:*', '');
    meeting.agenda.forEach((item: AgendaItem, index: number) => {
      lines.push(`🔷 *Agenda:* ${item.agenda}`);
      if (ended && item.outcomes) {
        lines.push(`✅ *Outcome:* ${item.outcomes}`);
      }
      if (index < meeting.agenda!.length - 1) lines.push('');
    });
  }
  if (ended && meeting.outcomes) {
    lines.push('', `📝 *Notes:* ${meeting.outcomes}`);
  }
  return lines.join('\n');
}
