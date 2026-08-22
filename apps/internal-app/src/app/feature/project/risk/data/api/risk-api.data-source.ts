import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  matchesRiskCriteria,
  normalizeRiskChip,
  sortRisksBySeverity,
} from '../../config/risk.rules';
import type { PagedRisks, ProjectRisk, RiskFilterCriteria } from '../../domain';
import type { RiskDataSource, RiskListPageQuery } from '../risk-data.source';
import { RiskService } from '../risk.service';

@Injectable()
export class RiskApiDataSource implements RiskDataSource {
  constructor(private readonly risks: RiskService) {}

  loadListPage(query: RiskListPageQuery): Observable<PagedRisks> {
    const projectId = query.criteria?.projectId;
    if (!projectId) {
      return of({
        content: [],
        totalSize: 0,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      });
    }

    // The endpoint returns the whole register, so chip, filter, search and paging
    // are applied here.
    return this.risks.fetchRisks(projectId).pipe(
      map(page => {
        const matches = sortRisksBySeverity(
          (page.content ?? []).filter(risk => matchesRiskCriteria(
            risk,
            normalizeRiskChip(query.chipId),
            (query.criteria ?? {}) as RiskFilterCriteria,
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

  fetchRiskById(projectId: string, id: string): Observable<ProjectRisk | undefined> {
    return this.risks.fetchRisks(projectId).pipe(
      map(page => (page.content ?? []).find(risk => risk.id === id)),
      catchError(() => of(undefined)),
    );
  }

  createRisk(projectId: string, data: Partial<ProjectRisk>): Observable<ProjectRisk> {
    return this.risks.createRisk(projectId, data);
  }

  updateRisk(
    projectId: string,
    id: string,
    patch: Partial<ProjectRisk>,
  ): Observable<ProjectRisk> {
    return this.risks.updateRisk(projectId, id, patch);
  }

  resolveRisk(projectId: string, id: string): Observable<ProjectRisk> {
    return this.risks.resolveRisk(projectId, id);
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return this.risks.fetchProjectOptions().pipe(catchError(() => of([])));
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return this.risks.fetchUserOptions().pipe(catchError(() => of([])));
  }
}
