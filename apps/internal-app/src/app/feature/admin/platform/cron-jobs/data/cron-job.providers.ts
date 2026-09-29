import { Provider } from '@angular/core';
import { CronJobApiDataSource } from './api/cron-job-api.data-source';
import { CronJobDataSource } from './cron-job-data.source';

export function provideCronJobDataSource(): Provider[] {
  return [
    CronJobApiDataSource,
    { provide: CronJobDataSource, useExisting: CronJobApiDataSource },
  ];
}
