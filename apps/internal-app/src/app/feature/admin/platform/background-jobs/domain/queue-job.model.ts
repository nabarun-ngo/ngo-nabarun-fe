export type QueueJobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';

/** Execution data returned only by the job details endpoint. */
export interface QueueJobExecution {
  delay?: number;
  progress?: unknown;
  returnValue?: unknown;
  options: Record<string, unknown>;
  logs: string[];
  stacktrace: string[];
}

export interface QueueJob {
  id: string;
  name: string;
  status: QueueJobStatus;
  attemptsMade: number;
  queueName?: string;
  enqueuedAt?: string;
  startedAt?: string;
  finishedAt?: string;
  failedReason?: string;
  payload: Record<string, unknown>;
  /** Present once the job has been loaded from the details endpoint. */
  execution?: QueueJobExecution;
}

/** Queue-wide counters and health used by the statistics card. */
export interface QueueOverview {
  status: string;
  paused: boolean;
  issues: string[];
  waiting: number;
  active: number;
  delayed: number;
  completed: number;
  failed: number;
  total: number;
  successRate: number;
  failureRate: number;
  averageProcessingTime: number;
  fastestJob: number;
  slowestJob: number;
  updatedAt: string;
}

export interface QueueCleanResult {
  completed: number;
  failed: number;
}

export type QueueOperation = 'pause' | 'resume';

/** Sheet/search criteria for the background jobs list. */
export interface QueueJobListCriteria {
  /**
   * BullMQ job / handler name passed to the job search `jobName` query param.
   * Cron schedules filter here by their handler, not by the cron definition name.
   */
  jobName?: string;
  /** Queue name passed to the job search `queueName` query param. */
  queueName?: string;
  [key: string]: unknown;
}
