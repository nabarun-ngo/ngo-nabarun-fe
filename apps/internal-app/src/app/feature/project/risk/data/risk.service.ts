import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  ProjectRiskService as ProjectRiskApiService,
  ProjectService as ProjectApiService,
  UsersService,
} from 'src/app/core/api/api-client/services';
import { mapPagedUserDtoToPagedUser } from 'src/app/feature/member/data/member-data.mapper';
import type { PagedRisks, ProjectRisk } from '../domain';
import { mapRiskDto, mapRiskList, mapToCreateRisk, mapToUpdateRisk } from './risk-data.mapper';

/** Thin transport wrapper over the project-scoped risk endpoints. */
@Injectable({ providedIn: 'root' })
export class RiskService {
  constructor(
    private readonly riskApi: ProjectRiskApiService,
    private readonly projectApi: ProjectApiService,
    private readonly usersApi: UsersService,
  ) {}

  fetchRisks(projectId: string): Observable<PagedRisks> {
    return this.riskApi.projectRiskControllerList({ projectId }).pipe(
      map(response => mapRiskList(response.responsePayload!)),
    );
  }

  createRisk(projectId: string, data: Partial<ProjectRisk>): Observable<ProjectRisk> {
    return this.riskApi.projectRiskControllerCreate({
      projectId,
      body: mapToCreateRisk(data),
    }).pipe(
      map(response => mapRiskDto(response.responsePayload!)),
    );
  }

  updateRisk(
    projectId: string,
    id: string,
    patch: Partial<ProjectRisk>,
  ): Observable<ProjectRisk> {
    return this.riskApi.projectRiskControllerUpdate({
      projectId,
      id,
      body: mapToUpdateRisk(patch),
    }).pipe(
      map(response => mapRiskDto(response.responsePayload!)),
    );
  }

  /** `PATCH .../risks/{id}/resolve` — closes the risk; takes no input. */
  resolveRisk(projectId: string, id: string): Observable<ProjectRisk> {
    return this.riskApi.projectRiskControllerResolve({ projectId, id }).pipe(
      map(response => mapRiskDto(response.responsePayload!)),
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
