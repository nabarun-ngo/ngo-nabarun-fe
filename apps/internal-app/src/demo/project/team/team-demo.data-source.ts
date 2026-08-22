import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { matchesTeamCriteria, normalizeTeamChip } from 'src/app/feature/project/team/config/team.rules';
import type { PagedTeamMembers, TeamMember } from 'src/app/feature/project/team/domain';
import type { TeamDataSource, TeamListPageQuery } from 'src/app/feature/project/team/data/team-data.source';

const DEMO_TEAM: TeamMember[] = [
  {
    id: 'tm-001',
    projectId: 'prj-001',
    userId: 'usr-001',
    role: 'PROJECT_MANAGER',
    isActive: true,
    startDate: '2026-01-05',
    hoursAllocated: 120,
    responsibilities: 'Overall delivery and sponsor reporting',
    createdAt: '2026-01-05T06:00:00.000Z',
    updatedAt: '2026-01-05T06:00:00.000Z',
  },
  {
    id: 'tm-002',
    projectId: 'prj-001',
    userId: 'usr-002',
    role: 'VOLUNTEER',
    isActive: true,
    startDate: '2026-02-14',
    hoursAllocated: 40,
    responsibilities: 'Weekend classes',
    createdAt: '2026-02-14T06:00:00.000Z',
    updatedAt: '2026-02-14T06:00:00.000Z',
  },
  {
    id: 'tm-003',
    projectId: 'prj-001',
    userId: 'usr-003',
    role: 'COORDINATOR',
    isActive: false,
    startDate: '2025-12-01',
    endDate: '2026-05-31',
    responsibilities: 'Logistics coordination',
    createdAt: '2025-12-01T06:00:00.000Z',
    updatedAt: '2026-05-31T06:00:00.000Z',
  },
];

const store = DEMO_TEAM.map(member => ({ ...member }));

const DEMO_PROJECT_OPTIONS: FieldOption[] = [
  { key: 'prj-001', label: 'EDU · Village School Support' },
  { key: 'prj-002', label: 'HLT · Mobile Health Camps' },
];

const DEMO_USER_OPTIONS: FieldOption[] = [
  { key: 'usr-001', label: 'Anita Roy' },
  { key: 'usr-002', label: 'Debjit Sen' },
  { key: 'usr-003', label: 'Farhan Ali' },
  { key: 'usr-004', label: 'Meera Nair' },
];

function labelFor(member: TeamMember): string {
  return DEMO_USER_OPTIONS.find(option => option.key === member.userId)?.label ?? member.userId;
}

@Injectable()
export class TeamDemoDataSource implements TeamDataSource {
  loadListPage(query: TeamListPageQuery): Observable<PagedTeamMembers> {
    const projectId = query.criteria?.projectId;
    const chip = normalizeTeamChip(query.chipId);
    const matches = store.filter(member =>
      (!projectId || member.projectId === projectId)
      && matchesTeamCriteria(member, chip, query.criteria ?? {}, query.searchText, labelFor(member)));
    const start = query.pageIndex * query.pageSize;
    return of({
      content: matches.slice(start, start + query.pageSize),
      totalSize: matches.length,
      pageIndex: query.pageIndex,
      pageSize: query.pageSize,
    }).pipe(delay(200));
  }

  fetchTeamMemberById(_projectId: string, id: string): Observable<TeamMember | undefined> {
    return of(store.find(member => member.id === id)).pipe(delay(120));
  }

  addTeamMember(projectId: string, data: Partial<TeamMember>): Observable<TeamMember> {
    const created: TeamMember = {
      id: `tm-${String(store.length + 1).padStart(3, '0')}`,
      projectId,
      userId: data.userId ?? 'usr-004',
      role: data.role ?? 'VOLUNTEER',
      isActive: true,
      startDate: data.startDate ?? new Date().toISOString().slice(0, 10),
      hoursAllocated: data.hoursAllocated,
      responsibilities: data.responsibilities,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    store.unshift(created);
    return of(created).pipe(delay(200));
  }

  updateTeamMember(
    _projectId: string,
    id: string,
    patch: Partial<TeamMember>,
  ): Observable<TeamMember> {
    const index = store.findIndex(member => member.id === id);
    const updated: TeamMember = {
      ...(index >= 0 ? store[index] : store[0]),
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    if (index >= 0) {
      store[index] = updated;
    }
    return of(updated).pipe(delay(200));
  }

  deactivateTeamMember(_projectId: string, id: string): Observable<TeamMember> {
    const index = store.findIndex(member => member.id === id);
    const updated: TeamMember = {
      ...(index >= 0 ? store[index] : store[0]),
      isActive: false,
      endDate: new Date().toISOString().slice(0, 10),
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
