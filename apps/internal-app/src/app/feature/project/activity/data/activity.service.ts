import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import {
  ExpenseService as ExpenseApiService,
  ProjectService as ProjectApiService,
  UsersService,
} from 'src/app/core/api/api-client/services';
import type { ProjectRefDataDto } from 'src/app/core/api/api-client/models';
import { mapPagedUserDtoToPagedUser } from 'src/app/feature/member/data/member-data.mapper';
import type { Activity, PagedActivities } from '../domain';
import {
  mapActivityDto,
  mapPagedActivities,
  mapToCreateActivity,
  mapToUpdateActivity,
} from './activity-data.mapper';
import { ActivityListFilter } from './activity-data.source';

/** Thin transport wrapper over the activity endpoints of the project controller. */
@Injectable({ providedIn: 'root' })
export class ActivityService {
  constructor(
    private readonly projectApi: ProjectApiService,
    private readonly expenseApi: ExpenseApiService,
    private readonly usersApi: UsersService,
  ) {}

  /** `GET /projects/activities` — every activity, optionally narrowed to one project. */
  fetchActivities(
    pageIndex = 0,
    pageSize = 12,
    filter: ActivityListFilter = {},
  ): Observable<PagedActivities> {
    return this.projectApi.projectControllerListAllActivities({
      pageIndex,
      pageSize,
      projectId: filter.projectId,
      status: filter.status,
      scale: filter.scale,
      type: filter.type,
      assignedTo: filter.assignedTo,
      organizerId: filter.organizerId,
      parentActivityId: filter.parentActivityId,
    }).pipe(
      map(response => mapPagedActivities(response.responsePayload!)),
    );
  }

  /** `GET /projects/{id}/activities` — kept for callers that already hold a project id. */
  fetchProjectActivities(
    projectId: string,
    pageIndex = 0,
    pageSize = 12,
  ): Observable<PagedActivities> {
    return this.projectApi.projectControllerListActivities({
      id: projectId,
      pageIndex,
      pageSize,
    }).pipe(
      map(response => mapPagedActivities(response.responsePayload!)),
    );
  }

  createActivity(projectId: string, data: Partial<Activity>): Observable<Activity> {
    return this.projectApi.projectControllerCreateActivity({
      id: projectId,
      body: mapToCreateActivity(data),
    }).pipe(
      map(response => mapActivityDto(response.responsePayload!)),
    );
  }

  updateActivity(
    projectId: string,
    activityId: string,
    patch: Partial<Activity>,
  ): Observable<Activity> {
    return this.projectApi.projectControllerUpdateActivity({
      id: projectId,
      activityId,
      body: mapToUpdateActivity(patch),
    }).pipe(
      map(response => mapActivityDto(response.responsePayload!)),
    );
  }

  linkExpense(
    projectId: string,
    activityId: string,
    expenseId: string,
  ): Observable<void> {
    return this.projectApi.projectControllerLinkExpense({
      id: projectId,
      activityId,
      body: { expenseId },
    }).pipe(
      map(() => undefined),
    );
  }

  /** Project picker options: activities always belong to exactly one project. */
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

  /** Finalized and settled expenses are the ones worth attaching to an activity. */
  fetchExpenseOptions(): Observable<FieldOption[]> {
    return this.expenseApi.expenseControllerListExpenses({
      pageIndex: 0,
      pageSize: 100,
      expenseStatus: ['FINALIZED', 'SETTLED'],
    }).pipe(
      map(response => (response.responsePayload?.items ?? []).map(expense => ({
        key: expense.id,
        label: [expense.expenseRefId, expense.name].filter(Boolean).join(' · '),
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

  fetchRefData(): Observable<ProjectRefDataDto | undefined> {
    return this.projectApi.projectControllerGetReferenceData().pipe(
      map(response => response.responsePayload ?? undefined),
    );
  }
}
