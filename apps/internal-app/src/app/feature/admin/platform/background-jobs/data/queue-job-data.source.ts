import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type {
  QueueCleanResult,
  QueueJob,
  QueueJobStatus,
  QueueOperation,
  QueueOverview,
} from '../domain';

export interface QueueJobSearchQuery {
  pageIndex: number;
  pageSize: number;
  status?: QueueJobStatus;
  jobName?: string;
  queueName?: string;
}

export interface QueueJobDataSource {
  search(query: QueueJobSearchQuery): Observable<{ items: QueueJob[]; totalSize: number }>;
  getById(jobId: string): Observable<QueueJob | undefined>;
  getOverview(): Observable<QueueOverview>;
  retry(jobId: string): Observable<void>;
  remove(jobId: string): Observable<void>;
  cleanOldJobs(): Observable<QueueCleanResult>;
  setQueueState(operation: QueueOperation): Observable<void>;
}

export const QueueJobDataSource = new InjectionToken<QueueJobDataSource>('QueueJobDataSource');
