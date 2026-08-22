import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  matchesRiskCriteria,
  normalizeRiskChip,
  sortRisksBySeverity,
} from 'src/app/feature/project/risk/config/risk.rules';
import type { PagedRisks, ProjectRisk, RiskFilterCriteria } from 'src/app/feature/project/risk/domain';
import type { RiskDataSource, RiskListPageQuery } from 'src/app/feature/project/risk/data/risk-data.source';

const DEMO_RISKS: ProjectRisk[] = [
  {
    id: 'rsk-001',
    projectId: 'prj-001',
    title: 'Monsoon disrupts school attendance',
    description: 'Heavy rain in July and August keeps children away from school.',
    category: 'EXTERNAL',
    severity: 'HIGH',
    probability: 'HIGH',
    status: 'MONITORING',
    identifiedDate: '2026-03-02',
    impact: 'Attendance target may slip by two months.',
    mitigationPlan: 'Plan catch-up sessions in September.',
    ownerId: 'usr-001',
    createdAt: '2026-03-02T06:00:00.000Z',
    updatedAt: '2026-07-10T06:00:00.000Z',
  },
  {
    id: 'rsk-002',
    projectId: 'prj-001',
    title: 'Learning kit vendor delay',
    category: 'TIMELINE',
    severity: 'MEDIUM',
    probability: 'MEDIUM',
    status: 'MITIGATED',
    identifiedDate: '2026-05-18',
    mitigationPlan: 'Second vendor onboarded as backup.',
    resolvedDate: '2026-07-01',
    ownerId: 'usr-003',
    createdAt: '2026-05-18T06:00:00.000Z',
    updatedAt: '2026-07-01T06:00:00.000Z',
  },
  {
    id: 'rsk-003',
    projectId: 'prj-002',
    title: 'Budget overrun on camp logistics',
    category: 'BUDGET',
    severity: 'CRITICAL',
    probability: 'HIGH',
    status: 'IDENTIFIED',
    identifiedDate: '2026-08-01',
    impact: 'Spend is at 92% of the approved budget.',
    ownerId: 'usr-002',
    createdAt: '2026-08-01T06:00:00.000Z',
    updatedAt: '2026-08-01T06:00:00.000Z',
  },
];

const store = DEMO_RISKS.map(risk => ({ ...risk }));

const DEMO_PROJECT_OPTIONS: FieldOption[] = [
  { key: 'prj-001', label: 'EDU · Village School Support' },
  { key: 'prj-002', label: 'HLT · Mobile Health Camps' },
];

const DEMO_USER_OPTIONS: FieldOption[] = [
  { key: 'usr-001', label: 'Anita Roy' },
  { key: 'usr-002', label: 'Debashis Ghosh' },
  { key: 'usr-003', label: 'Farhana Khatun' },
];

@Injectable()
export class RiskDemoDataSource implements RiskDataSource {
  loadListPage(query: RiskListPageQuery): Observable<PagedRisks> {
    const projectId = query.criteria?.projectId;
    const matches = sortRisksBySeverity(store.filter(risk =>
      (!projectId || risk.projectId === projectId)
      && matchesRiskCriteria(
        risk,
        normalizeRiskChip(query.chipId),
        (query.criteria ?? {}) as RiskFilterCriteria,
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

  fetchRiskById(_projectId: string, id: string): Observable<ProjectRisk | undefined> {
    return of(store.find(risk => risk.id === id)).pipe(delay(120));
  }

  createRisk(projectId: string, data: Partial<ProjectRisk>): Observable<ProjectRisk> {
    const created: ProjectRisk = {
      id: `rsk-${String(store.length + 1).padStart(3, '0')}`,
      projectId,
      title: data.title ?? 'New risk',
      description: data.description,
      category: data.category ?? 'OTHER',
      severity: data.severity ?? 'MEDIUM',
      probability: data.probability ?? 'MEDIUM',
      status: 'IDENTIFIED',
      identifiedDate: data.identifiedDate ?? new Date().toISOString().slice(0, 10),
      impact: data.impact,
      mitigationPlan: data.mitigationPlan,
      ownerId: data.ownerId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.unshift(created);
    return of(created).pipe(delay(200));
  }

  updateRisk(
    _projectId: string,
    id: string,
    patch: Partial<ProjectRisk>,
  ): Observable<ProjectRisk> {
    const index = store.findIndex(risk => risk.id === id);
    const updated: ProjectRisk = {
      ...(index >= 0 ? store[index] : store[0]),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      store[index] = updated;
    }
    return of(updated).pipe(delay(200));
  }

  resolveRisk(_projectId: string, id: string): Observable<ProjectRisk> {
    const index = store.findIndex(risk => risk.id === id);
    const updated: ProjectRisk = {
      ...(index >= 0 ? store[index] : store[0]),
      status: 'CLOSED',
      resolvedDate: new Date().toISOString().slice(0, 10),
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

  fetchUserOptions(): Observable<FieldOption[]> {
    return of(DEMO_USER_OPTIONS).pipe(delay(120));
  }
}
