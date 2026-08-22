import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  ProjectService as ProjectApiService,
  UsersService,
} from 'src/app/core/api/api-client/services';
import type { ProjectRefDataDto } from 'src/app/core/api/api-client/models';
import { mapPagedUserDtoToPagedUser } from 'src/app/feature/member/data/member-data.mapper';
import type {
  PagedProjects,
  Project,
  ProjectDashboardSnapshot,
  ProjectProgress,
} from '../domain';
import {
  mapPagedProjects,
  mapProjectDashboard,
  mapProjectDto,
  mapToCreateProject,
  mapToUpdateProject,
} from './project-data.mapper';
import type { ProjectListFilter } from './project-data.source';

/** Thin transport wrapper over the generated project endpoints. */
@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(
    private readonly projectApi: ProjectApiService,
    private readonly usersApi: UsersService,
  ) {}

  fetchProjects(
    pageIndex = 0,
    pageSize = 12,
    filter: ProjectListFilter = {},
  ): Observable<PagedProjects> {
    return this.projectApi.projectControllerListProjects({
      pageIndex,
      pageSize,
      status: filter.status,
      category: filter.category,
      phase: filter.phase,
      managerId: filter.managerId,
      sponsorId: filter.sponsorId,
      location: filter.location,
      tags: filter.tags,
      isPublic: filter.isPublic,
    }).pipe(
      map(response => mapPagedProjects(response.responsePayload!)),
    );
  }

  fetchProjectById(id: string): Observable<Project> {
    return this.projectApi.projectControllerGetProjectById({ id }).pipe(
      map(response => mapProjectDto(response.responsePayload!)),
    );
  }

  fetchDashboard(id: string): Observable<ProjectDashboardSnapshot> {
    return this.projectApi.projectControllerGetDashboard({ id }).pipe(
      map(response => mapProjectDashboard(response.responsePayload!)),
    );
  }

  fetchProgress(id: string): Observable<ProjectProgress> {
    return this.projectApi.projectControllerGetProgress({ id }).pipe(
      map(response => response.responsePayload!),
    );
  }

  createProject(data: Partial<Project>): Observable<Project> {
    return this.projectApi.projectControllerCreateProject({
      body: mapToCreateProject(data),
    }).pipe(
      map(response => mapProjectDto(response.responsePayload!)),
    );
  }

  updateProject(id: string, patch: Partial<Project>): Observable<Project> {
    return this.projectApi.projectControllerUpdateProject({
      id,
      body: mapToUpdateProject(patch),
    }).pipe(
      map(response => mapProjectDto(response.responsePayload!)),
    );
  }

  fetchRefData(): Observable<ProjectRefDataDto | undefined> {
    return this.projectApi.projectControllerGetReferenceData().pipe(
      map(response => response.responsePayload ?? undefined),
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
