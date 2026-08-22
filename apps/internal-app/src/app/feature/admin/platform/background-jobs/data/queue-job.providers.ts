import type { Provider } from '@angular/core';
import { QueueJobApiDataSource } from './api/queue-job-api.data-source';
import { QueueJobDataSource } from './queue-job-data.source';

export function provideQueueJobDataSource(): Provider[] {
  return [
    QueueJobApiDataSource,
    { provide: QueueJobDataSource, useExisting: QueueJobApiDataSource },
  ];
}
