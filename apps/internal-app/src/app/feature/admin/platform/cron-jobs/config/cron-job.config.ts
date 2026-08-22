import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import type { Router } from '@angular/router';
import { catchError, map, of, throwError } from 'rxjs';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { notifyFeatureError } from 'src/app/shared/utils/http-error.util';
import {
  ADMIN_ALL_CHIP,
  ADMIN_LIST_CHIPS,
  adminCriteriaToValues,
  adminListRouteBindings,
  adminValuesToCriteria,
  buildEmptyAdminFilterForm,
  buildEmptyAppliedFilters,
  cloneAdminCriteria,
  countEmptySheetFilters,
  emptyAdminCriteria,
  filterBySearchText,
  isAdminAllChip,
  paginateClientSide,
  parsePayloadJson,
  removeAdminFilterById,
  type AdminEmptyCriteria,
} from '../../../shared/admin-list.helpers';
import type { CronJobDataSource } from '../data/cron-job-data.source';
import type { AdminCronJob } from '../domain';
import {
  buildCronJobCreateForm,
  buildCronJobEditForm,
  cronJobToEditValues,
  defaultCronJobCreateValues,
} from './cron-job.forms';
import { resolveCronJobPermissions } from './cron-job.rules';
import { buildCronJobDetailSections, mapCronJobListRow } from './cron-job.view';

export type CronJobListConfig = ListDashboardConfig<
  AdminCronJob,
  AdminEmptyCriteria,
  unknown,
  CronJobOperations
>;

export type CronJobOperations = {
  deleteJob(job: AdminCronJob): void;
  runJobNow(job: AdminCronJob): void;
  viewBackgroundJobs(job: AdminCronJob): void;
};

const PAGE_SIZE = 20;

export function createCronJobListConfig(deps: {
  data: CronJobDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  router: Router;
}): CronJobListConfig {
  const permissions = () => resolveCronJobPermissions(deps.authorization);
  const canReadJobs = () => deps.authorization.effectivePermissions().includes(SCOPE.read.jobs);

  return {
    meta: {
      id: 'admin-cron-jobs',
      title: 'Cron jobs',
      pageName: 'Cron jobs',
      searchPlaceholder: 'Search by name',
      emptyMessage: 'No cron job definitions yet.',
      detailRouteSync: { idParam: 'jobName' },
    },
    list: {
      pageSize: PAGE_SIZE,
      chips: [...ADMIN_LIST_CHIPS],
      defaultChip: ADMIN_ALL_CHIP,
      isValidChip: isAdminAllChip,
      route: {
        chipConfig: { defaultChip: ADMIN_ALL_CHIP, normalize: () => ADMIN_ALL_CHIP },
        filterBindings: adminListRouteBindings(),
      },
      cloneCriteria: cloneAdminCriteria,
      getDefaultCriteriaForChip: () => emptyAdminCriteria(),
      buildFilterFormDefinition: () => buildEmptyAdminFilterForm(),
      criteriaToFilterFormValues: () => adminCriteriaToValues(),
      filterFormValuesToCriteria: (_c, values, criteria) => adminValuesToCriteria(values, criteria),
      buildAppliedFilters: () => buildEmptyAppliedFilters(),
      countActiveSheetFilters: () => countEmptySheetFilters(),
      removeFilterById: removeAdminFilterById,
      loadPage: (query) => deps.data.list().pipe(
        map(jobs => {
          const filtered = filterBySearchText(jobs, query.searchText, j => j.name);
          const { page, totalSize } = paginateClientSide(filtered, query.pageIndex, PAGE_SIZE);
          return {
            items: page.map(mapCronJobListRow),
            totalSize,
            pageIndex: query.pageIndex,
            pageSize: PAGE_SIZE,
          };
        }),
        catchError(() => of({
          items: [],
          totalSize: 0,
          pageIndex: query.pageIndex,
          pageSize: PAGE_SIZE,
        })),
      ),
      mapToListRow: entity => mapCronJobListRow(entity),
    },
    detail: {
      getTitle: job => job.name,
      buildViewSections: job => buildCronJobDetailSections(job),
      fetchById: id => deps.data.list().pipe(
        map(jobs => jobs.find(j => j.name === id)),
        catchError(() => of(undefined)),
      ),
      findInList: (items, id) => items
        .map(i => i.payload as AdminCronJob | undefined)
        .find(i => i?.name === id),
      edit: {
        buildEditSummary: ctx => [
          { label: 'Name', value: ctx.entity.name },
        ],
        buildEditForm: () => buildCronJobEditForm(),
        entityToEditValues: cronJobToEditValues,
        save: ctx => {
          try {
            const inputData = parsePayloadJson(ctx.values);
            return deps.data.update(ctx.entity.name, {
              handler: String(ctx.values['handler'] ?? ctx.entity.handler),
              description: String(ctx.values['description'] ?? ctx.entity.description),
              expression: String(ctx.values['expression'] ?? ctx.entity.expression),
              enabled: !!ctx.values['enabled'],
              inputData,
            });
          } catch (e) {
            return throwError(() => e);
          }
        },
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'create' },
      canOpen: () => !!permissions().showCreateFab,
      buildCreateForm: () => buildCronJobCreateForm(),
      defaultCreateValues: () => defaultCronJobCreateValues(),
      createSave: values => {
        try {
          const name = String(values['name'] ?? '').trim();
          if (!name) return throwError(() => new Error('Job name is required.'));
          const inputData = parsePayloadJson(values);
          return deps.data.create({
            name,
            handler: String(values['handler'] ?? '').trim(),
            description: String(values['description'] ?? '').trim(),
            expression: String(values['expression'] ?? '').trim(),
            enabled: !!values['enabled'],
            inputData,
          });
        } catch (e) {
          return throwError(() => e);
        }
      },
    },
    permissions: { resolve: permissions },
    operations: {
      deleteJob(job: AdminCronJob) {
        deps.modal.openNotificationModal({
          title: 'Delete cron job?',
          description: `Delete "${job.name}"? Scheduled runs will stop immediately.`,
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.remove(job.name).subscribe({
            next: () => deps.modal.openNotificationModal({
              title: 'Deleted',
              description: job.name,
            }, 'notification', 'success'),
            error: err => notifyFeatureError(deps.modal, err, {
              title: 'Delete failed',
              description: err?.message ?? 'Unable to delete job.',
            }),
          });
        });
      },
      runJobNow(job: AdminCronJob) {
        deps.data.runNow(job.name).subscribe({
          next: () => deps.modal.openNotificationModal({
            title: 'Job queued',
            description: `"${job.name}" was enqueued to run now.`,
          }, 'notification', 'success'),
          error: err => notifyFeatureError(deps.modal, err, {
            title: 'Run failed',
            description: err?.message ?? 'Unable to run job.',
          }),
        });
      },
      // Queue search indexes the BullMQ handler name, not the cron definition name.
      viewBackgroundJobs(job: AdminCronJob) {
        const handler = job.handler?.trim();
        if (!handler) return;
        void deps.router.navigate([AppRoute.secured_admin_jobs_page.url], {
          queryParams: {
            jobName: handler,
            backTo: `${AppRoute.secured_admin_cron_jobs_page.url}?jobName=${encodeURIComponent(job.name)}`,
            backLabel: job.name,
          },
        });
      },
    },
    actions: {
      detailFooter: [
        {
          id: 'run-now',
          label: 'Run now',
          appearance: 'primary',
          when: () => !!permissions().canRunNow,
          run: 'runJobNow',
        },
        {
          id: 'view-runs',
          label: 'View runs',
          appearance: 'secondary',
          when: ctx => canReadJobs() && !!(ctx.entity as AdminCronJob | undefined)?.handler,
          run: 'viewBackgroundJobs',
        },
      ],
      detailMenu: [
        {
          id: 'delete',
          label: 'Delete',
          icon: 'delete',
          when: () => !!permissions().canDelete,
          run: 'deleteJob',
        },
      ],
      floating: [
        {
          id: 'create',
          label: 'Create',
          appearance: 'fab',
          icon: 'add',
          when: () => !!permissions().showCreateFab,
          run: 'openCreate',
        },
      ],
    },
  };
}
