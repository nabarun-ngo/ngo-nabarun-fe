import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  MilestoneService as MilestoneApiService,
  ProjectService as ProjectApiService,
} from 'src/app/core/api/api-client/services';
import type { Milestone, PagedMilestones } from '../domain';
import {
  mapMilestoneDto,
  mapMilestoneList,
  mapToCreateMilestone,
  mapToUpdateMilestone,
} from './milestone-data.mapper';

/** Thin transport wrapper over the project-scoped milestone endpoints. */
@Injectable({ providedIn: 'root' })
export class MilestoneService {
  constructor(
    private readonly milestoneApi: MilestoneApiService,
    private readonly projectApi: ProjectApiService,
  ) {}

  fetchMilestones(projectId: string): Observable<PagedMilestones> {
    return this.milestoneApi.milestoneControllerList({ projectId }).pipe(
      map(response => mapMilestoneList(response.responsePayload!)),
    );
  }

  createMilestone(projectId: string, data: Partial<Milestone>): Observable<Milestone> {
    return this.milestoneApi.milestoneControllerCreate({
      projectId,
      body: mapToCreateMilestone(data),
    }).pipe(
      map(response => mapMilestoneDto(response.responsePayload!)),
    );
  }

  updateMilestone(
    projectId: string,
    id: string,
    patch: Partial<Milestone>,
  ): Observable<Milestone> {
    return this.milestoneApi.milestoneControllerUpdate({
      projectId,
      id,
      body: mapToUpdateMilestone(patch),
    }).pipe(
      map(response => mapMilestoneDto(response.responsePayload!)),
    );
  }

  /** `PATCH .../milestones/{id}/complete` — marks the milestone achieved; takes no input. */
  completeMilestone(projectId: string, id: string): Observable<Milestone> {
    return this.milestoneApi.milestoneControllerComplete({ projectId, id }).pipe(
      map(response => mapMilestoneDto(response.responsePayload!)),
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
}
