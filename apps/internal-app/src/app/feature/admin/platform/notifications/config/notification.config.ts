import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import { catchError, map, of, throwError } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { notifyFeatureError } from 'src/app/shared/utils/http-error.util';
import {
  adminCriteriaToValues, adminListRouteBindings, adminValuesToCriteria,
  buildEmptyAdminFilterForm, buildEmptyAppliedFilters, cloneAdminCriteria,
  countEmptySheetFilters, emptyAdminCriteria, removeAdminFilterById,
  type AdminEmptyCriteria,
} from '../../../shared/admin-list.helpers';
import type { NotificationDataSource } from '../data/notification-data.source';
import type { AdminNotification, NotificationListContext } from '../domain';
import {
  isValidNotificationChip,
  NOTIFICATION_CHIPS,
  NOTIFICATION_DEFAULT_CHIP,
  normalizeNotificationChip,
  statusForChip,
} from './notification.rules';
import { buildNotificationDetailSections, mapNotificationListRow } from './notification.view';

export type NotificationListConfig = ListDashboardConfig<
  AdminNotification,
  AdminEmptyCriteria,
  NotificationListContext,
  { resend(n: AdminNotification): void }
>;

const PAGE = 12;

export function createNotificationContext(): NotificationListContext {
  return { refData: {} };
}

export function createNotificationListConfig(deps: {
  data: NotificationDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  context: NotificationListContext;
}): NotificationListConfig {
  const permissions = () => {
    const p = deps.authorization.effectivePermissions();
    return {
      canUpdateEntity: false,
      showCreateFab: false,
      canResend: p.includes(SCOPE.read.notifications),
    };
  };

  return {
    meta: {
      id: 'admin-notifications',
      title: 'Notifications',
      pageName: 'Notification Audit',
      searchPlaceholder: 'Search',
      emptyMessage: 'No notifications.',
      detailRouteSync: { idParam: 'notificationId' },
    },
    list: {
      pageSize: PAGE,
      chips: NOTIFICATION_CHIPS,
      defaultChip: NOTIFICATION_DEFAULT_CHIP,
      isValidChip: isValidNotificationChip,
      route: {
        chipConfig: { defaultChip: NOTIFICATION_DEFAULT_CHIP, normalize: normalizeNotificationChip },
        filterBindings: adminListRouteBindings(),
      },
      cloneCriteria: cloneAdminCriteria,
      getDefaultCriteriaForChip: () => emptyAdminCriteria(),
      buildFilterFormDefinition: () => buildEmptyAdminFilterForm(),
      criteriaToFilterFormValues: () => adminCriteriaToValues(),
      filterFormValuesToCriteria: (_chip, values, criteria) => adminValuesToCriteria(values, criteria),
      buildAppliedFilters: () => buildEmptyAppliedFilters(),
      countActiveSheetFilters: () => countEmptySheetFilters(),
      removeFilterById: removeAdminFilterById,
      loadPage: q => deps.data.list({
        pageIndex: q.pageIndex,
        pageSize: PAGE,
        status: statusForChip(q.chipId),
      }).pipe(
        map(p => ({
          items: p.items.map(mapNotificationListRow),
          totalSize: p.totalSize,
          pageIndex: q.pageIndex,
          pageSize: PAGE,
        })),
        catchError(() => of({
          items: [],
          totalSize: 0,
          pageIndex: q.pageIndex,
          pageSize: PAGE,
        })),
      ),
      mapToListRow: e => mapNotificationListRow(e),
    },
    detail: {
      getTitle: n => n.title || 'Notification',
      buildViewSections: n => buildNotificationDetailSections(n),
      fetchById: id => deps.data.list({ pageIndex: 0, pageSize: 200 }).pipe(
        map(p => p.items.find(n => n.id === id)),
        catchError(() => of(undefined)),
      ),
      findInList: (items, id) => items.map(i => i.payload as AdminNotification).find(i => i?.id === id),
      edit: {
        buildEditSummary: ctx => [{ label: 'Title', value: ctx.entity.title ?? '—' }],
        buildEditForm: () => ({
          id: 'notification-readonly',
          key: 'notification-readonly',
          label: 'Notification',
          description: null,
          fields: [],
        }),
        entityToEditValues: () => ({}),
        save: () => throwError(() => new Error('Notifications are read-only.')),
      },
    },
    permissions: { resolve: permissions },
    operations: {
      resend(n) {
        deps.modal.openNotificationModal({
          title: 'Resend notification?',
          description: 'Resend this push notification?',
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.resendPush(n.id).subscribe({
            next: () => deps.modal.openNotificationModal({
              title: 'Resent',
              description: n.title || n.id,
            }, 'notification', 'success'),
            error: (err: { message?: string }) => notifyFeatureError(deps.modal, err, {
              title: 'Resend failed',
              description: err?.message ?? 'Error',
            }),
          });
        });
      },
    },
    actions: {
      detailFooter: [{
        id: 'resend',
        label: 'Resend',
        appearance: 'primary',
        when: () => !!permissions().canResend,
        run: 'resend',
      }],
    },
  };
}
