import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  matchesMilestoneCriteria,
  normalizeMilestoneChip,
  sortMilestonesByTargetDate,
} from 'src/app/feature/project/milestone/config/milestone.rules';
import type { Milestone, MilestoneFilterCriteria, PagedMilestones } from 'src/app/feature/project/milestone/domain';
import type { MilestoneDataSource, MilestoneListPageQuery } from 'src/app/feature/project/milestone/data/milestone-data.source';

const DEMO_MILESTONES: Milestone[] = [
  {
    id: 'mil-001',
    projectId: 'prj-001',
    name: 'Mid-term review',
    description: 'Review attendance and learning data with the school committee.',
    importance: 'HIGH',
    status: 'PENDING',
    targetDate: '2026-09-30',
    dependencies: [],
    createdAt: '2026-01-20T06:00:00.000Z',
    updatedAt: '2026-01-20T06:00:00.000Z',
  },
  {
    id: 'mil-002',
    projectId: 'prj-001',
    name: 'Teacher training completed',
    importance: 'CRITICAL',
    status: 'ACHIEVED',
    targetDate: '2026-02-15',
    actualDate: '2026-02-11',
    dependencies: [],
    createdAt: '2026-01-20T06:00:00.000Z',
    updatedAt: '2026-02-11T06:00:00.000Z',
  },
  {
    id: 'mil-003',
    projectId: 'prj-002',
    name: 'First 500 screenings',
    importance: 'MEDIUM',
    status: 'IN_PROGRESS',
    targetDate: '2026-08-31',
    dependencies: [],
    createdAt: '2025-11-05T06:00:00.000Z',
    updatedAt: '2026-08-01T06:00:00.000Z',
  },
];

const store = DEMO_MILESTONES.map(milestone => ({ ...milestone }));

const DEMO_PROJECT_OPTIONS: FieldOption[] = [
  { key: 'prj-001', label: 'EDU · Village School Support' },
  { key: 'prj-002', label: 'HLT · Mobile Health Camps' },
];

@Injectable()
export class MilestoneDemoDataSource implements MilestoneDataSource {
  loadListPage(query: MilestoneListPageQuery): Observable<PagedMilestones> {
    const projectId = query.criteria?.projectId;
    const matches = sortMilestonesByTargetDate(store.filter(milestone =>
      (!projectId || milestone.projectId === projectId)
      && matchesMilestoneCriteria(
        milestone,
        normalizeMilestoneChip(query.chipId),
        (query.criteria ?? {}) as MilestoneFilterCriteria,
        query.searchText,
      )));
    const start = query.pageIndex * query.pageSize;
    return of({
      content: matches.slice(start, start + query.pageSize),
      totalSize: matches.length,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }).pipe(delay(200));
  }

  fetchMilestoneById(_projectId: string, id: string): Observable<Milestone | undefined> {
    return of(store.find(milestone => milestone.id === id)).pipe(delay(120));
  }

  createMilestone(projectId: string, data: Partial<Milestone>): Observable<Milestone> {
    const created: Milestone = {
      id: `mil-${String(store.length + 1).padStart(3, '0')}`,
      projectId,
      name: data.name ?? 'New milestone',
      description: data.description,
      importance: data.importance ?? 'MEDIUM',
      status: 'PENDING',
      targetDate: data.targetDate ?? new Date().toISOString().slice(0, 10),
      dependencies: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.unshift(created);
    return of(created).pipe(delay(200));
  }

  updateMilestone(
    _projectId: string,
    id: string,
    patch: Partial<Milestone>,
  ): Observable<Milestone> {
    const index = store.findIndex(milestone => milestone.id === id);
    const updated: Milestone = {
      ...(index >= 0 ? store[index] : store[0]),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      store[index] = updated;
    }
    return of(updated).pipe(delay(200));
  }

  completeMilestone(_projectId: string, id: string): Observable<Milestone> {
    const index = store.findIndex(milestone => milestone.id === id);
    const updated: Milestone = {
      ...(index >= 0 ? store[index] : store[0]),
      status: 'ACHIEVED',
      actualDate: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString(),
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
