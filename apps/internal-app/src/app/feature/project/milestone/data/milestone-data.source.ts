import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { Milestone, MilestoneFilterCriteria, PagedMilestones } from '../domain';

export interface MilestoneListPageQuery {
  chipId?: string;
  criteria?: MilestoneFilterCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
}

export interface MilestoneDataSource {
  /** Returns an empty page until a project is in scope. */
  loadListPage(query: MilestoneListPageQuery): Observable<PagedMilestones>;
  fetchMilestoneById(projectId: string, id: string): Observable<Milestone | undefined>;
  createMilestone(projectId: string, data: Partial<Milestone>): Observable<Milestone>;
  updateMilestone(
    projectId: string,
    id: string,
    patch: Partial<Milestone>,
  ): Observable<Milestone>;
  completeMilestone(projectId: string, id: string): Observable<Milestone>;
  fetchProjectOptions(): Observable<FieldOption[]>;
}

export const MilestoneDataSource = new InjectionToken<MilestoneDataSource>('MilestoneDataSource');
