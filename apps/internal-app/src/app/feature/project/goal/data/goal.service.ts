import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  GoalService as GoalApiService,
  ProjectService as ProjectApiService,
} from 'src/app/core/api/api-client/services';
import type { Goal, PagedGoals } from '../domain';
import { mapGoalDto, mapPagedGoals, mapToCreateGoal, mapToUpdateGoal } from './goal-data.mapper';

/** Thin transport wrapper over the project-scoped goal endpoints. */
@Injectable({ providedIn: 'root' })
export class GoalService {
  constructor(
    private readonly goalApi: GoalApiService,
    private readonly projectApi: ProjectApiService,
  ) {}

  fetchGoals(projectId: string, pageIndex = 0, pageSize = 100): Observable<PagedGoals> {
    return this.goalApi.goalControllerList({ projectId, pageIndex, pageSize }).pipe(
      map(response => mapPagedGoals(response.responsePayload!)),
    );
  }

  createGoal(projectId: string, data: Partial<Goal>): Observable<Goal> {
    return this.goalApi.goalControllerCreate({
      projectId,
      body: mapToCreateGoal(data),
    }).pipe(
      map(response => mapGoalDto(response.responsePayload!)),
    );
  }

  updateGoal(projectId: string, id: string, patch: Partial<Goal>): Observable<Goal> {
    return this.goalApi.goalControllerUpdate({
      projectId,
      id,
      body: mapToUpdateGoal(patch),
    }).pipe(
      map(response => mapGoalDto(response.responsePayload!)),
    );
  }

  /** `PATCH .../goals/{id}/progress` — records measured progress against the target. */
  recordProgress(projectId: string, id: string, currentValue: number): Observable<Goal> {
    return this.goalApi.goalControllerProgress({
      projectId,
      id,
      body: { currentValue },
    }).pipe(
      map(response => mapGoalDto(response.responsePayload!)),
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
