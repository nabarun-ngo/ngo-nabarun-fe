import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface UserMetricsDto {
  pendingDonations?: number;
  walletBalance?: number;
  unsettledExpense?: number;
  pendingTask?: number;
}

export interface DashboardMetricsSource {
  getUserMetrics(): Observable<UserMetricsDto>;
}

export const DashboardMetricsSource = new InjectionToken<DashboardMetricsSource>('DashboardMetricsSource');
