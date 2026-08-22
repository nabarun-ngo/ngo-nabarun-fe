import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { CronJobDto } from 'src/app/core/api/api-client/models';
import { CronControllerService } from 'src/app/core/api/api-client/services';
import type { AdminCronJob } from '../../domain';
import type { CronJobDataSource } from '../cron-job-data.source';

function mapCronJob(dto: CronJobDto): AdminCronJob {
  return {
    name: dto.name,
    handler: dto.handler,
    description: dto.description,
    expression: dto.expression,
    readableExpression: dto.readableExpression,
    enabled: dto.enabled,
    nextRun: dto.nextRun,
    inputData: (dto.inputData ?? {}) as Record<string, unknown>,
  };
}

@Injectable()
export class CronJobApiDataSource implements CronJobDataSource {
  constructor(private readonly api: CronControllerService) {}

  list(): Observable<AdminCronJob[]> {
    return this.api.cronControllerGetJobs().pipe(
      map(r => (r.responsePayload ?? []).map(mapCronJob)),
    );
  }

  create(input: {
    name: string; handler: string; description: string; expression: string;
    enabled?: boolean; inputData?: Record<string, unknown>;
  }): Observable<AdminCronJob> {
    return this.api.cronControllerCreateJob({
      body: {
        name: input.name,
        handler: input.handler,
        description: input.description,
        expression: input.expression,
        enabled: input.enabled,
        inputData: input.inputData,
      },
    }).pipe(map(r => mapCronJob(r.responsePayload)));
  }

  update(name: string, input: {
    handler?: string; description?: string; expression?: string;
    enabled?: boolean; inputData?: Record<string, unknown>;
  }): Observable<AdminCronJob> {
    return this.api.cronControllerUpdateJob({
      name,
      body: input,
    }).pipe(map(r => mapCronJob(r.responsePayload)));
  }

  remove(name: string): Observable<void> {
    return this.api.cronControllerDeleteJob({ name }).pipe(map(() => undefined));
  }

  runNow(name: string): Observable<string | undefined> {
    return this.api.cronControllerRunJob({ name }).pipe(map(r => r.responsePayload));
  }
}
