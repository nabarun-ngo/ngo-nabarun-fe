import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import type { AdminCronJob } from '../domain';

export interface CronJobDataSource {
  list(): Observable<AdminCronJob[]>;
  create(input: {
    name: string;
    handler: string;
    description: string;
    expression: string;
    enabled?: boolean;
    inputData?: Record<string, unknown>;
  }): Observable<AdminCronJob>;
  update(name: string, input: {
    handler?: string;
    description?: string;
    expression?: string;
    enabled?: boolean;
    inputData?: Record<string, unknown>;
  }): Observable<AdminCronJob>;
  remove(name: string): Observable<void>;
  runNow(name: string): Observable<string | undefined>;
}

export const CronJobDataSource = new InjectionToken<CronJobDataSource>('CronJobDataSource');
