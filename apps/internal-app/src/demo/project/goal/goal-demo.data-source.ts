import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { matchesGoalCriteria, normalizeGoalChip } from 'src/app/feature/project/goal/config/goal.rules';
import type { Goal, GoalFilterCriteria, PagedGoals } from 'src/app/feature/project/goal/domain';
import type { GoalDataSource, GoalListPageQuery } from 'src/app/feature/project/goal/data/goal-data.source';

const DEMO_GOALS: Goal[] = [
  {
    id: 'gol-001',
    projectId: 'prj-001',
    title: 'Raise attendance to 90%',
    description: 'Average monthly attendance across both schools.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    targetValue: 90,
    currentValue: 78,
  },
  {
    id: 'gol-002',
    projectId: 'prj-001',
    title: 'Distribute 320 learning kits',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    targetValue: 320,
    currentValue: 140,
  },
  {
    id: 'gol-003',
    projectId: 'prj-001',
    title: 'Train all 18 teachers',
    priority: 'CRITICAL',
    status: 'ACHIEVED',
    targetValue: 18,
    currentValue: 18,
  },
  {
    id: 'gol-004',
    projectId: 'prj-002',
    title: 'Screen 1200 residents',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    targetValue: 1200,
    currentValue: 980,
  },
];

const store = DEMO_GOALS.map(goal => ({ ...goal }));

const DEMO_PROJECT_OPTIONS: FieldOption[] = [
  { key: 'prj-001', label: 'EDU · Village School Support' },
  { key: 'prj-002', label: 'HLT · Mobile Health Camps' },
];

@Injectable()
export class GoalDemoDataSource implements GoalDataSource {
  loadListPage(query: GoalListPageQuery): Observable<PagedGoals> {
    const projectId = query.criteria?.projectId;
    const matches = store.filter(goal =>
      (!projectId || goal.projectId === projectId)
      && matchesGoalCriteria(
        goal,
        normalizeGoalChip(query.chipId),
        (query.criteria ?? {}) as GoalFilterCriteria,
        query.searchText,
      ));
    const start = query.pageIndex * query.pageSize;
    return of({
      content: matches.slice(start, start + query.pageSize),
      totalSize: matches.length,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }).pipe(delay(200));
  }

  fetchGoalById(_projectId: string, id: string): Observable<Goal | undefined> {
    return of(store.find(goal => goal.id === id)).pipe(delay(120));
  }

  createGoal(projectId: string, data: Partial<Goal>): Observable<Goal> {
    const created: Goal = {
      id: `gol-${String(store.length + 1).padStart(3, '0')}`,
      projectId,
      title: data.title ?? 'New goal',
      description: data.description,
      priority: data.priority ?? 'MEDIUM',
      status: 'NOT_STARTED',
      targetValue: data.targetValue,
      currentValue: 0,
    };
    store.unshift(created);
    return of(created).pipe(delay(200));
  }

  updateGoal(_projectId: string, id: string, patch: Partial<Goal>): Observable<Goal> {
    const index = store.findIndex(goal => goal.id === id);
    const updated: Goal = { ...(index >= 0 ? store[index] : store[0]), ...patch };
    if (index >= 0) {
      store[index] = updated;
    }
    return of(updated).pipe(delay(200));
  }

  recordProgress(_projectId: string, id: string, currentValue: number): Observable<Goal> {
    const index = store.findIndex(goal => goal.id === id);
    const current = index >= 0 ? store[index] : store[0];
    const updated: Goal = {
      ...current,
      currentValue,
      status: current.targetValue && currentValue >= current.targetValue
        ? 'ACHIEVED'
        : 'IN_PROGRESS',
    };
    if (index >= 0) {
      store[index] = updated;
    }
    return of(updated).pipe(delay(200));
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return of(DEMO_PROJECT_OPTIONS).pipe(delay(120));
  }
}
