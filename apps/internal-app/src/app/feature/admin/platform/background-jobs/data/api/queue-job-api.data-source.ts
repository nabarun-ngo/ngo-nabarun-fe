import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type {
  JobDetail,
  QueueJobSearchResultDto,
  QueueStatistics,
} from 'src/app/core/api/api-client/models';
import { QueueControllerService } from 'src/app/core/api/api-client/services';
import type {
  QueueCleanResult,
  QueueJob,
  QueueJobStatus,
  QueueOperation,
  QueueOverview,
} from '../../domain';
import type { QueueJobDataSource, QueueJobSearchQuery } from '../queue-job-data.source';

const JOB_STATUSES: QueueJobStatus[] = ['waiting', 'active', 'completed', 'failed', 'delayed'];

function mapStatus(state: string | undefined): QueueJobStatus {
  const normalized = (state ?? '').toLowerCase() as QueueJobStatus;
  return JOB_STATUSES.includes(normalized) ? normalized : 'waiting';
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' ? value as Record<string, unknown> : {};
}

function mapSearchResult(dto: QueueJobSearchResultDto): QueueJob {
  return {
    id: dto.id,
    name: dto.jobName,
    queueName: dto.queueName,
    status: mapStatus(dto.status),
    attemptsMade: dto.attemptsMade,
    enqueuedAt: dto.enqueuedAt,
    startedAt: dto.startedAt,
    finishedAt: dto.finishedAt,
    failedReason: dto.failedReason,
    payload: asRecord(dto.payload),
  };
}

function mapJobDetail(dto: JobDetail): QueueJob {
  return {
    id: dto.id ?? '',
    name: dto.name ?? dto.id ?? '',
    status: mapStatus(dto.state),
    attemptsMade: dto.attemptsMade,
    enqueuedAt: dto.timestamp,
    startedAt: dto.processedOn,
    finishedAt: dto.finishedOn,
    failedReason: dto.failedReason,
    payload: asRecord(dto.data),
    execution: {
      delay: dto.delay,
      progress: dto.progress,
      returnValue: dto.returnvalue,
      options: asRecord(dto.opts),
      logs: dto.logs ?? [],
      stacktrace: dto.stacktrace ?? [],
    },
  };
}

function mapOverview(dto: QueueStatistics): QueueOverview {
  return {
    status: dto.health.status,
    paused: dto.health.isPaused,
    issues: dto.health.issues ?? [],
    waiting: dto.metrics.waiting,
    active: dto.metrics.active,
    delayed: dto.metrics.delayed,
    completed: dto.metrics.completed,
    failed: dto.metrics.failed,
    total: dto.metrics.total,
    successRate: dto.metrics.successRate,
    failureRate: dto.metrics.failureRate,
    averageProcessingTime: dto.performance.averageProcessingTime,
    fastestJob: dto.performance.fastestJob,
    slowestJob: dto.performance.slowestJob,
    updatedAt: dto.timestamp,
  };
}

@Injectable()
export class QueueJobApiDataSource implements QueueJobDataSource {
  constructor(private readonly api: QueueControllerService) {}

  search(query: QueueJobSearchQuery): Observable<{ items: QueueJob[]; totalSize: number }> {
    return this.api.queueControllerSearchJobs({
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
      status: query.status,
      jobName: query.jobName?.trim() || undefined,
      queueName: query.queueName?.trim() || undefined,
    }).pipe(
      map(response => ({
        items: (response.responsePayload?.content ?? []).map(mapSearchResult),
        totalSize: response.responsePayload?.totalSize ?? 0,
      })),
    );
  }

  getById(jobId: string): Observable<QueueJob | undefined> {
    return this.api.queueControllerGetJobDetails({ jobId }).pipe(
      map(response => response.responsePayload ? mapJobDetail(response.responsePayload) : undefined),
    );
  }

  getOverview(): Observable<QueueOverview> {
    return this.api.queueControllerGetStatistics().pipe(
      map(response => mapOverview(response.responsePayload)),
    );
  }

  retry(jobId: string): Observable<void> {
    return this.api.queueControllerRetryJob({ jobId }).pipe(map(() => undefined));
  }

  remove(jobId: string): Observable<void> {
    return this.api.queueControllerRemoveJob({ jobId }).pipe(map(() => undefined));
  }

  cleanOldJobs(): Observable<QueueCleanResult> {
    return this.api.queueControllerCleanOldJobs().pipe(
      map(response => ({
        completed: response.responsePayload?.completed?.length ?? 0,
        failed: response.responsePayload?.failed?.length ?? 0,
      })),
    );
  }

  setQueueState(operation: QueueOperation): Observable<void> {
    return this.api.queueControllerQueueOperation({ operation }).pipe(map(() => undefined));
  }
}
