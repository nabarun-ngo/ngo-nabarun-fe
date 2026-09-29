import { Injectable } from '@angular/core';
import { delay, map, Observable, of, throwError } from 'rxjs';
import type { WorkflowRequest } from 'src/app/feature/workflow/request/domain';
import { chipToListScope, normalizeRequestChip } from 'src/app/feature/workflow/request/config/request.rules';
import {
  mapRequestDto,
  mapStartFormDto,
  mapSubmittedFieldDtos,
} from 'src/app/feature/workflow/request/data/request-data.mapper';
import { mapRequestPageResponse } from 'src/app/feature/workflow/request/data/request-response.mapper';
import type {
  RequestDataSource,
  RequestDecisionInput,
  RequestListQuery,
  StartRequestInput,
} from 'src/app/feature/workflow/request/data/request-data.source';
import {
  createDemoRequestDto,
  findDemoRequestDtoById,
  getDemoRequestEventDtos,
  getDemoRequestMembers,
  getDemoRequestPageDto,
  getDemoRequestRefData,
  getDemoStartFormDto,
  getDemoSubmittedFieldDtos,
  mutateDemoRequest,
  withdrawDemoRequestDto,
} from './request-demo.fixtures';

@Injectable()
export class RequestDemoDataSource implements RequestDataSource {
  loadRequestPage(query: RequestListQuery) {
    const chip = normalizeRequestChip(query.chipId);
    const scope = chipToListScope(chip);
    const responsePayload = getDemoRequestPageDto(
      scope,
      query.criteria ?? {},
      query.pageIndex,
      query.pageSize,
      query.currentUserId ?? 'u-demo',
    );
    return of({ responsePayload }).pipe(
      delay(200),
      map(response => mapRequestPageResponse(response.responsePayload, query)),
    );
  }

  fetchRequestById(id: string): Observable<WorkflowRequest | undefined> {
    return of({ responsePayload: findDemoRequestDtoById(id) }).pipe(
      delay(120),
      map(response => {
        if (!response.responsePayload) return undefined;
        return {
          ...mapRequestDto(response.responsePayload),
          submittedFields: mapSubmittedFieldDtos(getDemoSubmittedFieldDtos(id)),
        };
      }),
    );
  }

  fetchRequestTimeline(id: string) {
    return of({ responsePayload: getDemoRequestEventDtos(id) }).pipe(
      delay(80),
      map(response => mapRequestDto({
        id,
        type: '',
        name: '',
        status: 'YetToStart',
        events: response.responsePayload,
      }).timeline ?? []),
    );
  }

  fetchRequestRefData() {
    return of(getDemoRequestRefData()).pipe(delay(50));
  }

  fetchActiveMembers() {
    return of(getDemoRequestMembers()).pipe(delay(80));
  }

  fetchStartForm(definitionId: string) {
    return of({ responsePayload: getDemoStartFormDto(definitionId) }).pipe(
      delay(60),
      map(response => mapStartFormDto(response.responsePayload)),
    );
  }

  startRequest(input: StartRequestInput): Observable<WorkflowRequest> {
    return of({ responsePayload: createDemoRequestDto(input) }).pipe(
      delay(200),
      map(response => mapRequestDto(response.responsePayload)),
    );
  }

  startWorkRequest(id: string): Observable<WorkflowRequest> {
    const updated = mutateDemoRequest(id, {
      status: 'InProgress',
      claimedById: 'u-demo',
      claimedBy: { id: 'u-demo', firstName: 'Demo', lastName: 'User' },
      assigneeId: 'u-demo',
      assignee: { id: 'u-demo', firstName: 'Demo', lastName: 'User' },
      claimedAt: new Date().toISOString(),
    }, 'Started');
    return updated
      ? of(mapRequestDto(updated)).pipe(delay(150))
      : throwError(() => new Error('Request not found'));
  }

  assignRequest(id: string, assigneeId: string): Observable<WorkflowRequest> {
    const member = getDemoRequestMembers().find(item => item.id === assigneeId);
    const [firstName, ...rest] = (member?.fullName ?? assigneeId).split(' ');
    const person = {
      id: assigneeId,
      firstName,
      lastName: rest.join(' ') || null,
    };
    const current = findDemoRequestDtoById(id);
    if (!current) {
      return throwError(() => new Error('Request not found'));
    }

    if (current.status === 'PendingForApproval') {
      const updated = mutateDemoRequest(id, {
        assigneeId,
        assignee: person,
        assignedToMeAtApproval: assigneeId === 'u-demo',
      }, 'Assigned');
      return updated
        ? of(mapRequestDto(updated)).pipe(delay(150))
        : throwError(() => new Error('Request not found'));
    }

    if (current.status === 'YetToStart') {
      const updated = mutateDemoRequest(id, {
        assigneeId,
        assignee: person,
      }, 'Assigned');
      return updated
        ? of(mapRequestDto(updated)).pipe(delay(150))
        : throwError(() => new Error('Request not found'));
    }

    if (current.status === 'InProgress') {
      const updated = mutateDemoRequest(id, {
        assigneeId,
        assignee: person,
        claimedById: assigneeId,
        claimedBy: person,
        claimedAt: new Date().toISOString(),
      }, 'Assigned');
      return updated
        ? of(mapRequestDto(updated)).pipe(delay(150))
        : throwError(() => new Error('Request not found'));
    }

    return throwError(() => new Error('Invalid state for assign'));
  }

  closeRequest(id: string, input?: RequestDecisionInput): Observable<WorkflowRequest> {
    const updated = mutateDemoRequest(id, {
      status: 'Closed',
      decisionNote: input?.note,
      completedAt: new Date().toISOString(),
    }, 'Closed');
    return updated
      ? of(mapRequestDto(updated)).pipe(delay(150))
      : throwError(() => new Error('Request not found'));
  }

  approveRequest(id: string, input?: RequestDecisionInput): Observable<WorkflowRequest> {
    const updated = mutateDemoRequest(id, {
      status: 'YetToStart',
      decisionNote: input?.note,
      assigneeId: null,
      assignee: null,
      claimedById: null,
      claimedBy: null,
      claimedAt: null,
      assignedToMeAtApproval: false,
    }, 'Approved');
    return updated
      ? of(mapRequestDto(updated)).pipe(delay(150))
      : throwError(() => new Error('Request not found'));
  }

  rejectRequest(id: string, input?: RequestDecisionInput): Observable<WorkflowRequest> {
    const updated = mutateDemoRequest(id, {
      status: 'Rejected',
      decisionNote: input?.note,
      completedAt: new Date().toISOString(),
    }, 'Rejected');
    return updated
      ? of(mapRequestDto(updated)).pipe(delay(150))
      : throwError(() => new Error('Request not found'));
  }

  withdrawRequest(id: string, input?: RequestDecisionInput): Observable<WorkflowRequest> {
    const updated = withdrawDemoRequestDto(id, input?.note);
    return updated
      ? of(mapRequestDto(updated)).pipe(delay(180))
      : throwError(() => new Error('Request not found or not withdrawable'));
  }
}
