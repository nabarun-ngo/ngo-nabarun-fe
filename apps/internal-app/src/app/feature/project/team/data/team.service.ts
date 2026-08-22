import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  ProjectService as ProjectApiService,
  ProjectTeamService as ProjectTeamApiService,
  UsersService,
} from 'src/app/core/api/api-client/services';
import { mapPagedUserDtoToPagedUser } from 'src/app/feature/member/data/member-data.mapper';
import type { PagedTeamMembers, TeamMember } from '../domain';
import {
  mapTeamMemberDto,
  mapTeamMemberList,
  mapToAddTeamMember,
  mapToUpdateTeamMember,
} from './team-data.mapper';

/** Thin transport wrapper over the project-scoped team endpoints. */
@Injectable({ providedIn: 'root' })
export class TeamService {
  constructor(
    private readonly teamApi: ProjectTeamApiService,
    private readonly projectApi: ProjectApiService,
    private readonly usersApi: UsersService,
  ) {}

  fetchTeam(projectId: string): Observable<PagedTeamMembers> {
    return this.teamApi.projectTeamControllerList({ projectId }).pipe(
      map(response => mapTeamMemberList(response.responsePayload!)),
    );
  }

  addTeamMember(projectId: string, data: Partial<TeamMember>): Observable<TeamMember> {
    return this.teamApi.projectTeamControllerAdd({
      projectId,
      body: mapToAddTeamMember(data),
    }).pipe(
      map(response => mapTeamMemberDto(response.responsePayload!)),
    );
  }

  updateTeamMember(
    projectId: string,
    id: string,
    patch: Partial<TeamMember>,
  ): Observable<TeamMember> {
    return this.teamApi.projectTeamControllerUpdate({
      projectId,
      id,
      body: mapToUpdateTeamMember(patch),
    }).pipe(
      map(response => mapTeamMemberDto(response.responsePayload!)),
    );
  }

  /** `PATCH .../team/{id}/deactivate` — ends the membership; takes no input. */
  deactivateTeamMember(projectId: string, id: string): Observable<TeamMember> {
    return this.teamApi.projectTeamControllerDeactivate({ projectId, id }).pipe(
      map(response => mapTeamMemberDto(response.responsePayload!)),
    );
  }

  fetchProjectOptions(): Observable<FieldOption[]> {
    return this.projectApi.projectControllerListProjects({
      pageIndex: 0,
      pageSize: 100,
    }).pipe(
      map(response => (response.responsePayload?.items ?? []).map(project => ({
        key: project.id,
        label: `${project.code} · ${project.name}`,
      }))),
    );
  }

  fetchUserOptions(): Observable<FieldOption[]> {
    return this.usersApi.userControllerListUsers({ status: 'ACTIVE' }).pipe(
      map(response => mapPagedUserDtoToPagedUser(response.responsePayload!)),
      map(page => (page.content ?? [])
        .filter(user => !!user.id)
        .map(user => ({
          key: user.id!,
          label: user.fullName?.trim() || user.email?.trim() || user.id!,
        }))
        .sort((a, b) => a.label.localeCompare(b.label))),
    );
  }
}
