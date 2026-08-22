import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { matchesGoalCriteria, normalizeGoalChip } from '../../config/goal.rules';
import type { Goal, GoalFilterCriteria, PagedGoals } from '../../domain';
import type { GoalDataSource, GoalListPageQuery } from '../goal-data.source';
import { GoalService } from '../goal.service';

/** Goals per project are a small set; one fetch backs chip, filter and search narrowing. */
const PROJECT_GOALS_PAGE_SIZE = 200;

@Injectable()
export class GoalApiDataSource implements GoalDataSource {
  constructor(private readonly goals: GoalService) {}

  loadListPage(query: GoalListPageQuery): Observable<PagedGoals> {
    const projectId = query.criteria?.projectId;
    if (!projectId) {
      return of({
        content: [],
        totalSize: 0,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      });
    }

    return this.goals.fetchGoals(projectId, 0, PROJECT_GOALS_PAGE_SIZE).pipe(
      map(page => {
        const matches = (page.content ?? []).filter(goal => matchesGoalCriteria(
          goal,
          normalizeGoalChip(query.chipId),
          (query.criteria ?? {}) as GoalFilterCriteria,
          query.searchText,
        ));
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

  fetchGoalById(projectId: string, id: string): Observable<Goal | undefined> {
    return this.goals.fetchGoals(projectId, 0, PROJECT_GOALS_PAGE_SIZE).pipe(
      map(page => (page.content ?? []).find(goal => goal.id === id)),
      catchError(() => of(undefined)),
    );
  }

  createGoal(projectId: string, data: Partial<Goal>): Observable<Goal> {
    return this.goals.createGoal(projectId, data);
  }

  updateGoal(projectId: string, id: string, patch: Partial<Goal>): Observable<Goal> {
    return this.goals.updateGoal(projectId, id, patch);
  }

  recordProgress(projectId: string, id: string, currentValue: number): Observable<Goal> {
    return this.goals.recordProgress(projectId, id, currentValue);
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return this.goals.fetchProjectOptions().pipe(catchError(() => of([])));
  }
}
