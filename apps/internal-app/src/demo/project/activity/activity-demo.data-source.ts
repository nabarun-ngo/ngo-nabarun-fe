import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { ProjectRefDataDto } from 'src/app/core/api/api-client/models';
import { normalizeActivityChip } from 'src/app/feature/project/activity/config/activity.rules';
import type { Activity, ActivityFilterCriteria, PagedActivities } from 'src/app/feature/project/activity/domain';
import type { ActivityDataSource, ActivityListPageQuery } from 'src/app/feature/project/activity/data/activity-data.source';
import {
  buildDemoCreatedActivity,
  DEMO_ACTIVITY_EXPENSE_OPTIONS,
  DEMO_ACTIVITY_PROJECT_OPTIONS,
  DEMO_ACTIVITY_REF_DATA,
  DEMO_ACTIVITY_USER_OPTIONS,
  findDemoActivity,
  getDemoActivityPage,
  updateDemoActivity,
} from './activity-demo.fixtures';

@Injectable()
export class ActivityDemoDataSource implements ActivityDataSource {
  loadListPage(query: ActivityListPageQuery): Observable<PagedActivities> {
    const { items, totalSize } = getDemoActivityPage(
      normalizeActivityChip(query.chipId),
      (query.criteria ?? {}) as ActivityFilterCriteria,
      query.searchText,
      query.pageIndex,
      query.pageSize,
    );
    return of({
      content: items,
      totalSize,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }).pipe(delay(250));
  }

  fetchActivityById(activityId: string): Observable<Activity | undefined> {
    return of(findDemoActivity(activityId)).pipe(delay(150));
  }

  createActivity(projectId: string, data: Partial<Activity>): Observable<Activity> {
    return of(buildDemoCreatedActivity(projectId, data)).pipe(delay(200));
  }

  updateActivity(
    _projectId: string,
    activityId: string,
    patch: Partial<Activity>,
  ): Observable<Activity> {
    return of(updateDemoActivity(activityId, patch)).pipe(delay(200));
  }

  linkExpense(_projectId: string, _activityId: string, _expenseId: string): Observable<void> {
    return of(undefined).pipe(delay(200));
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return of(DEMO_ACTIVITY_PROJECT_OPTIONS).pipe(delay(120));
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return of(DEMO_ACTIVITY_USER_OPTIONS).pipe(delay(120));
  }

  fetchExpenseOptions(): Observable<FieldOption[]> {
    return of(DEMO_ACTIVITY_EXPENSE_OPTIONS).pipe(delay(120));
  }

  fetchRefData(): Observable<ProjectRefDataDto | undefined> {
    return of(DEMO_ACTIVITY_REF_DATA).pipe(delay(100));
  }
}
