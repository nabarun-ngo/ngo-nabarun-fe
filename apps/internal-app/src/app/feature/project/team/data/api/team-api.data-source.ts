import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import { matchesTeamCriteria, normalizeTeamChip } from '../../config/team.rules';
import type { PagedTeamMembers, TeamMember } from '../../domain';
import type { TeamDataSource, TeamListPageQuery } from '../team-data.source';
import { TeamService } from '../team.service';

@Injectable()
export class TeamApiDataSource implements TeamDataSource {
  constructor(private readonly team: TeamService) {}

  /**
   * The roster endpoint returns the full team without filters or paging,
   * so chips, search and paging are applied here.
   */
  loadListPage(query: TeamListPageQuery): Observable<PagedTeamMembers> {
    const projectId = query.criteria?.projectId;
    if (!projectId) {
      return of({
        content: [],
        totalSize: 0,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      });
    }

    const chip = normalizeTeamChip(query.chipId);
    return this.team.fetchTeam(projectId).pipe(
      map(page => {
        const matches = (page.content ?? []).filter(member =>
          matchesTeamCriteria(member, chip, query.criteria ?? {}, query.searchText));
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

  /** There is no single-member endpoint, so the member is picked from the roster. */
  fetchTeamMemberById(projectId: string, id: string): Observable<TeamMember | undefined> {
    return this.team.fetchTeam(projectId).pipe(
      map(page => (page.content ?? []).find(member => member.id === id)),
      catchError(() => of(undefined)),
    );
  }

  addTeamMember(projectId: string, data: Partial<TeamMember>): Observable<TeamMember> {
    return this.team.addTeamMember(projectId, data);
  }

  updateTeamMember(
    projectId: string,
    id: string,
    patch: Partial<TeamMember>,
  ): Observable<TeamMember> {
    return this.team.updateTeamMember(projectId, id, patch);
  }

  deactivateTeamMember(projectId: string, id: string): Observable<TeamMember> {
    return this.team.deactivateTeamMember(projectId, id);
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return this.team.fetchProjectOptions().pipe(catchError(() => of([])));
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return this.team.fetchUserOptions().pipe(catchError(() => of([])));
  }
}
