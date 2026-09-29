import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { DashboardMetricsSource, UserMetricsDto } from './dashboard-metrics.source';

@Injectable()
export class DashboardApiMetricsSource implements DashboardMetricsSource {
  constructor(private dashboardService: DashboardService) {}

  getUserMetrics(): Observable<UserMetricsDto> {
    return this.dashboardService.getUserMetrics() as Observable<UserMetricsDto>;
  }
}
