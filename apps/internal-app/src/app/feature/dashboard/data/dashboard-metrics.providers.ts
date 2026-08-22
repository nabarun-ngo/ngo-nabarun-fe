import { Provider } from '@angular/core';
import { MOCK_DATA } from '../../../../environments/environment';
import { DashboardMetricsSource } from './dashboard-metrics.source';
import { DashboardApiMetricsSource } from './dashboard-api-metrics.source';
import { DashboardDemoMetricsSource } from 'src/demo/dashboard/dashboard-demo-metrics.source';

export function provideDashboardMetricsSource(): Provider[] {
  if (MOCK_DATA) {
    return [
      DashboardDemoMetricsSource,
      { provide: DashboardMetricsSource, useExisting: DashboardDemoMetricsSource },
    ];
  }
  return [
    DashboardApiMetricsSource,
    { provide: DashboardMetricsSource, useExisting: DashboardApiMetricsSource },
  ];
}
