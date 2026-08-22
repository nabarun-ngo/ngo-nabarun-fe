import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import { catchError, map, of, throwError } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { claimHttpError } from 'src/app/shared/utils/http-error.util';
import type { QueueJobDataSource } from '../data/queue-job-data.source';
import type { QueueJob, QueueJobListCriteria, QueueOperation } from '../domain';
import {
  buildQueueJobFilterForm,
  queueJobCriteriaToValues,
  queueJobValuesToCriteria,
} from './queue-job.forms';
import {
  buildQueueJobAppliedFilters,
  cloneQueueJobCriteria,
  countActiveQueueJobSheetFilters,
  emptyQueueJobCriteria,
  isValidQueueJobChip,
  normalizeQueueJobChip,
  QUEUE_JOB_ALL_CHIP,
  QUEUE_JOB_CHIPS,
  QUEUE_JOB_FILTER_BINDINGS,
  removeQueueJobFilterById,
  resolveQueueJobPermissions,
  statusForChip,
} from './queue-job.rules';
import { buildQueueJobDetailSections, mapQueueJobListRow } from './queue-job.view';

export type QueueJobOperations = {
  retryJob(job: QueueJob): void;
  removeJob(job: QueueJob): void;
  pauseQueue(): void;
  resumeQueue(): void;
  cleanOldJobs(): void;
};

export type QueueJobListConfig = ListDashboardConfig<
  QueueJob,
  QueueJobListCriteria,
  unknown,
  QueueJobOperations
>;

const PAGE_SIZE = 20;

export function createQueueJobListConfig(deps: {
  data: QueueJobDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  /** Reloads the list and the queue statistics after a job or queue change. */
  onMutation: () => void;
}): QueueJobListConfig {
  const permissions = () => resolveQueueJobPermissions(deps.authorization);

  const notify = (title: string, description: string, type: 'success' | 'error', error?: unknown) => {
    if (type === 'error') {
      claimHttpError(error);
    }
    deps.modal.openNotificationModal({ title, description }, 'notification', type);
  };

  const runQueueOperation = (operation: QueueOperation, successTitle: string) => {
    deps.data.setQueueState(operation).subscribe({
      next: () => {
        notify(successTitle, `The queue was ${operation}d.`, 'success');
        deps.onMutation();
      },
      error: err => notify(
        `Unable to ${operation} the queue`,
        err?.message ?? 'Try again later.',
        'error',
        err,
      ),
    });
  };

  return {
    meta: {
      id: 'admin-background-jobs',
      title: 'Background jobs',
      pageName: 'Background Jobs',
      searchPlaceholder: 'Search by handler name',
      filterSheetTitle: 'Filter jobs',
      emptyMessage: 'No jobs matched this filter.',
      detailRouteSync: { idParam: 'jobId' },
    },
    list: {
      pageSize: PAGE_SIZE,
      chips: QUEUE_JOB_CHIPS,
      defaultChip: QUEUE_JOB_ALL_CHIP,
      isValidChip: isValidQueueJobChip,
      route: {
        chipConfig: {
          defaultChip: QUEUE_JOB_ALL_CHIP,
          normalize: normalizeQueueJobChip,
        },
        filterBindings: QUEUE_JOB_FILTER_BINDINGS,
      },
      cloneCriteria: cloneQueueJobCriteria,
      getDefaultCriteriaForChip: () => emptyQueueJobCriteria(),
      buildFilterFormDefinition: () => buildQueueJobFilterForm(),
      criteriaToFilterFormValues: (_chip, criteria) => queueJobCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values) => queueJobValuesToCriteria(values),
      buildAppliedFilters: criteria => buildQueueJobAppliedFilters(criteria),
      countActiveSheetFilters: criteria => countActiveQueueJobSheetFilters(criteria),
      removeFilterById: removeQueueJobFilterById,
      loadPage: query => {
        const criteria = query.criteria as QueueJobListCriteria;
        // Deep links and the filter sheet set criteria.jobName; the search box
        // can refine further. Prefer an explicit typed search when present.
        const jobName = query.searchText?.trim() || criteria.jobName;
        return deps.data.search({
          pageIndex: query.pageIndex,
          pageSize: PAGE_SIZE,
          status: statusForChip(query.chipId),
          jobName,
          queueName: criteria.queueName,
        }).pipe(
          map(page => ({
            items: page.items.map(mapQueueJobListRow),
            totalSize: page.totalSize,
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
      mapToListRow: entity => mapQueueJobListRow(entity),
    },
    detail: {
      getTitle: job => job.name || job.id,
      getEntityId: job => job.id,
      buildViewSections: job => buildQueueJobDetailSections(job),
      fetchById: id => deps.data.getById(id).pipe(catchError(() => of(undefined))),
      findInList: (items, id) => items
        .map(item => item.payload as QueueJob | undefined)
        .find(job => job?.id === id),
      // The search results carry no logs, options or stack trace, so the sheet
      // loads the full job and keeps the queue name only the search knows.
      refreshOnOpen: job => deps.data.getById(job.id).pipe(
        map(loaded => loaded ? { ...job, ...loaded } : job),
        catchError(() => of(job)),
      ),
      edit: {
        buildEditSummary: () => [],
        buildEditForm: () => ({
          id: 'queue-job-readonly',
          key: 'queue-job-readonly',
          label: 'Background job',
          description: null,
          fields: [],
        }),
        entityToEditValues: () => ({}),
        save: () => throwError(() => new Error('Background jobs cannot be edited.')),
      },
    },
    permissions: { resolve: permissions },
    behavior: { canUpdateEntity: () => false },
    operations: {
      retryJob(job: QueueJob) {
        deps.data.retry(job.id).subscribe({
          next: () => {
            notify('Retry queued', job.name || job.id, 'success');
            deps.onMutation();
          },
          error: err => notify('Retry failed', err?.message ?? 'Unable to retry this job.', 'error', err),
        });
      },
      removeJob(job: QueueJob) {
        deps.modal.openNotificationModal({
          title: 'Remove job?',
          description: `Remove "${job.name || job.id}" from the queue? This cannot be undone.`,
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.remove(job.id).subscribe({
            next: () => {
              notify('Job removed', job.name || job.id, 'success');
              deps.onMutation();
            },
            error: err => notify('Remove failed', err?.message ?? 'Unable to remove this job.', 'error', err),
          });
        });
      },
      pauseQueue() {
        runQueueOperation('pause', 'Queue paused');
      },
      resumeQueue() {
        runQueueOperation('resume', 'Queue resumed');
      },
      cleanOldJobs() {
        deps.modal.openNotificationModal({
          title: 'Clear old jobs?',
          description: 'Completed and failed jobs older than the retention window will be deleted.',
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.cleanOldJobs().subscribe({
            next: result => {
              notify(
                'Queue cleaned',
                `Removed ${result.completed} completed and ${result.failed} failed jobs.`,
                'success',
              );
              deps.onMutation();
            },
            error: err => notify('Clean failed', err?.message ?? 'Unable to clean the queue.', 'error', err),
          });
        });
      },
    },
    actions: {
      detailFooter: [
        {
          id: 'retry',
          label: 'Retry',
          appearance: 'primary',
          when: ctx => !!permissions().canRetry && (ctx.entity as QueueJob)?.status === 'failed',
          run: 'retryJob',
        },
        {
          id: 'remove',
          label: 'Remove',
          appearance: 'secondary',
          when: () => !!permissions().canRemove,
          run: 'removeJob',
        },
      ],
    },
  };
}
