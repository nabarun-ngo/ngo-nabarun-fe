import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  matchesMilestoneCriteria,
  normalizeMilestoneChip,
  sortMilestonesByTargetDate,
} from '../../config/milestone.rules';
import type { Milestone, MilestoneFilterCriteria, PagedMilestones } from '../../domain';
import type { MilestoneDataSource, MilestoneListPageQuery } from '../milestone-data.source';
import { MilestoneService } from '../milestone.service';

@Injectable()
export class MilestoneApiDataSource implements MilestoneDataSource {
  constructor(private readonly milestones: MilestoneService) {}

  loadListPage(query: MilestoneListPageQuery): Observable<PagedMilestones> {
    const projectId = query.criteria?.projectId;
    if (!projectId) {
      return of({
        content: [],
        totalSize: 0,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      });
    }

    // The endpoint returns the whole collection, so chip, filter, search and paging
    // are applied here.
    return this.milestones.fetchMilestones(projectId).pipe(
      map(page => {
        const matches = sortMilestonesByTargetDate(
          (page.content ?? []).filter(milestone => matchesMilestoneCriteria(
            milestone,
            normalizeMilestoneChip(query.chipId),
            (query.criteria ?? {}) as MilestoneFilterCriteria,
            query.searchText,
          )),
        );
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

  fetchMilestoneById(projectId: string, id: string): Observable<Milestone | undefined> {
    return this.milestones.fetchMilestones(projectId).pipe(
      map(page => (page.content ?? []).find(milestone => milestone.id === id)),
      catchError(() => of(undefined)),
    );
  }

  createMilestone(projectId: string, data: Partial<Milestone>): Observable<Milestone> {
    return this.milestones.createMilestone(projectId, data);
  }

  updateMilestone(
    projectId: string,
    id: string,
    patch: Partial<Milestone>,
  ): Observable<Milestone> {
    return this.milestones.updateMilestone(projectId, id, patch);
  }

  completeMilestone(projectId: string, id: string): Observable<Milestone> {
    return this.milestones.completeMilestone(projectId, id);
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return this.milestones.fetchProjectOptions().pipe(catchError(() => of([])));
  }
}
