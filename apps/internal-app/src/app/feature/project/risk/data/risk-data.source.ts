import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { PagedRisks, ProjectRisk, RiskFilterCriteria } from '../domain';

export interface RiskListPageQuery {
  chipId?: string;
  criteria?: RiskFilterCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
}

export interface RiskDataSource {
  /** Returns an empty page until a project is in scope. */
  loadListPage(query: RiskListPageQuery): Observable<PagedRisks>;
  fetchRiskById(projectId: string, id: string): Observable<ProjectRisk | undefined>;
  createRisk(projectId: string, data: Partial<ProjectRisk>): Observable<ProjectRisk>;
  updateRisk(
    projectId: string,
    id: string,
    patch: Partial<ProjectRisk>,
  ): Observable<ProjectRisk>;
  resolveRisk(projectId: string, id: string): Observable<ProjectRisk>;
  fetchProjectOptions(): Observable<FieldOption[]>;
  fetchUserOptions(): Observable<FieldOption[]>;
}

export const RiskDataSource = new InjectionToken<RiskDataSource>('RiskDataSource');
