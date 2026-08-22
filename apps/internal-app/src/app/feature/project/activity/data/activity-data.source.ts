import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { ProjectRefDataDto } from 'src/app/core/api/api-client/models';
import type {
  Activity,
  ActivityFilterCriteria,
  ActivityScale,
  ActivityStatus,
  ActivityType,
  PagedActivities,
} from '../domain';

/** Server-side filters accepted by `GET /projects/activities`. */
export interface ActivityListFilter {
  projectId?: string;
  status?: ActivityStatus;
  scale?: ActivityScale;
  type?: ActivityType;
  assignedTo?: string;
  organizerId?: string;
  parentActivityId?: string;
}

export interface ActivityListPageQuery {
  chipId?: string;
  criteria?: ActivityFilterCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
}

export interface ActivityDataSource {
  loadListPage(query: ActivityListPageQuery): Observable<PagedActivities>;
  /**
   * There is no single-activity endpoint, so deep links resolve an activity out of the
   * list — scoped to `projectId` when the route carries one.
   */
  fetchActivityById(activityId: string, projectId?: string): Observable<Activity | undefined>;
  createActivity(projectId: string, data: Partial<Activity>): Observable<Activity>;
  updateActivity(
    projectId: string,
    activityId: string,
    patch: Partial<Activity>,
  ): Observable<Activity>;
  linkExpense(projectId: string, activityId: string, expenseId: string): Observable<void>;
  fetchProjectOptions(): Observable<FieldOption[]>;
  fetchUserOptions(): Observable<FieldOption[]>;
  fetchExpenseOptions(): Observable<FieldOption[]>;
  fetchRefData(): Observable<ProjectRefDataDto | undefined>;
}

export const ActivityDataSource = new InjectionToken<ActivityDataSource>('ActivityDataSource');
