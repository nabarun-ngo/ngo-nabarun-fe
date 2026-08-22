import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { PagedTeamMembers, TeamFilterCriteria, TeamMember } from '../domain';

export interface TeamListPageQuery {
  chipId?: string;
  criteria?: TeamFilterCriteria;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
}

export interface TeamDataSource {
  /** Returns an empty page until a project is in scope. */
  loadListPage(query: TeamListPageQuery): Observable<PagedTeamMembers>;
  fetchTeamMemberById(projectId: string, id: string): Observable<TeamMember | undefined>;
  addTeamMember(projectId: string, data: Partial<TeamMember>): Observable<TeamMember>;
  updateTeamMember(
    projectId: string,
    id: string,
    patch: Partial<TeamMember>,
  ): Observable<TeamMember>;
  deactivateTeamMember(projectId: string, id: string): Observable<TeamMember>;
  fetchProjectOptions(): Observable<FieldOption[]>;
  fetchUserOptions(): Observable<FieldOption[]>;
}

export const TeamDataSource = new InjectionToken<TeamDataSource>('TeamDataSource');
