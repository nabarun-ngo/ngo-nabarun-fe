import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { ProjectRefDataDto } from 'src/app/core/api/api-client/models';
import {
  buildActivityApiFilter,
  matchesActivitySearch,
  normalizeActivityChip,
} from '../../config/activity.rules';
import type { Activity, PagedActivities } from '../../domain';
import type { ActivityDataSource, ActivityListPageQuery } from '../activity-data.source';
import { ActivityService } from '../activity.service';

/** Widest page the search and lookup fallbacks request before filtering locally. */
const LOOKUP_PAGE_SIZE = 100;

@Injectable()
export class ActivityApiDataSource implements ActivityDataSource {
  constructor(private readonly activities: ActivityService) {}

  loadListPage(query: ActivityListPageQuery): Observable<PagedActivities> {
    const filter = buildActivityApiFilter(
      normalizeActivityChip(query.chipId),
      query.criteria,
    );
    const search = query.searchText?.trim();

    if (!search) {
      return this.activities.fetchActivities(query.pageIndex, query.pageSize, filter);
    }

    // `GET /projects/activities` has no text query, so search pulls the widest
    // supported page and narrows on name and location locally.
    return this.activities.fetchActivities(0, LOOKUP_PAGE_SIZE, filter).pipe(
      map(page => {
        const matches = (page.content ?? [])
          .filter(activity => matchesActivitySearch(activity, search));
        const start = query.pageIndex * query.pageSize;
        return {
          content: matches.slice(start, start + query.pageSize),
          totalSize: matches.length,
          pageIndex: query.pageIndex,
          pageSize: query.pageSize,
        };
      }),
    );
  }

  fetchActivityById(activityId: string, projectId?: string): Observable<Activity | undefined> {
    return this.activities.fetchActivities(0, LOOKUP_PAGE_SIZE, { projectId }).pipe(
      map(page => (page.content ?? []).find(activity => activity.id === activityId)),
      catchError(() => of(undefined)),
    );
  }

  createActivity(projectId: string, data: Partial<Activity>): Observable<Activity> {
    return this.activities.createActivity(projectId, data);
  }

  updateActivity(
    projectId: string,
    activityId: string,
    patch: Partial<Activity>,
  ): Observable<Activity> {
    return this.activities.updateActivity(projectId, activityId, patch);
  }

  linkExpense(projectId: string, activityId: string, expenseId: string): Observable<void> {
    return this.activities.linkExpense(projectId, activityId, expenseId);
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return this.activities.fetchProjectOptions().pipe(catchError(() => of([])));
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return this.activities.fetchUserOptions().pipe(catchError(() => of([])));
  }

  fetchExpenseOptions(): Observable<FieldOption[]> {
    return this.activities.fetchExpenseOptions().pipe(catchError(() => of([])));
  }

  fetchRefData(): Observable<ProjectRefDataDto | undefined> {
    return this.activities.fetchRefData();
  }
}
