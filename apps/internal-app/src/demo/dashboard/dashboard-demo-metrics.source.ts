import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardMetricsSource, UserMetricsDto } from 'src/app/feature/dashboard/data/dashboard-metrics.source';
import { DEMO_DASHBOARD_METRICS } from './dashboard-metrics.demo-data';

@Injectable()
export class DashboardDemoMetricsSource implements DashboardMetricsSource {
  getUserMetrics(): Observable<UserMetricsDto> {
    return of(DEMO_DASHBOARD_METRICS);
  }
}
