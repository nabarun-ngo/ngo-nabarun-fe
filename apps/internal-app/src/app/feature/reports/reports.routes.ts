import type { Route } from '@angular/router';
import { permissionGuard } from '@nabarun-ngo/auth-angular';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { provideReportInfrastructure } from './data/report.providers';
import { reportTypesResolver } from './data/report.resolver';
import { ReportDashboardComponent } from './page/report-dashboard.component';

export interface ReportsRouteOptions {
  path: string;
  /** Where the page returns to when opened from this URL. */
  backTo: string;
  backLabel: string;
}

/**
 * Reports is one page reachable from several places, so each host feature mounts
 * it on its own URL and says where "back" goes.
 */
export function reportsRoute(options: ReportsRouteOptions): Route {
  return {
    path: options.path,
    component: ReportDashboardComponent,
    canActivate: [permissionGuard(SCOPE.read.reports)],
    providers: [...provideReportInfrastructure()],
    data: {
      backTo: options.backTo,
      backLabel: options.backLabel,
    },
    resolve: {
      reportTypes: reportTypesResolver,
    },
  };
}
