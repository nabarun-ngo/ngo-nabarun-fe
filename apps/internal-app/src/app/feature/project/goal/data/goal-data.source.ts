import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { Goal, GoalFilterCriteria, PagedGoals } from '../domain';

export interface GoalListPageQuery {
  chipId?: string;
  criteria?: GoalFilterCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
}

export interface GoalDataSource {
  /** Returns an empty page until a project is in scope: goals live under one project. */
  loadListPage(query: GoalListPageQuery): Observable<PagedGoals>;
  fetchGoalById(projectId: string, id: string): Observable<Goal | undefined>;
  createGoal(projectId: string, data: Partial<Goal>): Observable<Goal>;
  updateGoal(projectId: string, id: string, patch: Partial<Goal>): Observable<Goal>;
  recordProgress(projectId: string, id: string, currentValue: number): Observable<Goal>;
  fetchProjectOptions(): Observable<FieldOption[]>;
}

export const GoalDataSource = new InjectionToken<GoalDataSource>('GoalDataSource');
