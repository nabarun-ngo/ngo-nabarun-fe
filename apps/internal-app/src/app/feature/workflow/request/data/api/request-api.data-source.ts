import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of, switchMap } from 'rxjs';
import { ApiConfiguration } from 'src/app/core/api/api-client/api-configuration';
import {
  CustomFormsSubmissionsService,
  UsersService,
} from 'src/app/core/api/api-client/services';
import { mapPagedUserDtoToPagedUser } from 'src/app/feature/member/data/member-data.mapper';
import { chipToListScope, normalizeRequestChip } from '../../config/request.rules';
import type { WorkflowRequest, WorkflowRequestSubmittedField } from '../../domain';
import {
  mapRequestDto,
  mapRequestRefData,
  mapStartFormDto,
  mapSubmittedFieldDtos,
  type WorkflowRequestDto,
  type WorkflowRequestTypeDto,
  type WorkflowStartFormDto,
} from '../request-data.mapper';
import { mapRequestPageResponse } from '../request-response.mapper';
import type {
  RequestDataSource,
  RequestDecisionInput,
  RequestListQuery,
  StartRequestInput,
} from '../request-data.source';

interface SuccessResponse<T> {
  responsePayload?: T;
}

/**
 * Calls Simple Request API (`/api/requests`). Prefer regenerating OpenAPI client
 * once swagger includes requests; this HttpClient path keeps FE unblocked until then.
 */
@Injectable()
export class RequestApiDataSource implements RequestDataSource {
  private readonly baseUrl: string;

  constructor(
    private readonly http: HttpClient,
    private readonly config: ApiConfiguration,
    private readonly usersApi: UsersService,
    private readonly submissionsApi: CustomFormsSubmissionsService,
  ) {
    this.baseUrl = `${this.config.rootUrl}/api/requests`;
  }

  loadRequestPage(query: RequestListQuery) {
    const chip = normalizeRequestChip(query.chipId);
    const scope = chipToListScope(chip);
    const status = query.criteria?.status?.join(',');
    const type = query.criteria?.definitionId?.join(',');
    const id = query.criteria?.requestId?.trim();

    let params = new HttpParams()
      .set('scope', scope)
      .set('pageIndex', String(query.pageIndex))
      .set('pageSize', String(query.pageSize));
    if (status) params = params.set('status', status);
    if (type) params = params.set('type', type);
    if (id) params = params.set('id', id);

    return this.http
      .get<SuccessResponse<{
        content?: WorkflowRequestDto[];
        totalSize?: number;
        pageIndex?: number;
        pageSize?: number;
      }>>(this.baseUrl, { params })
      .pipe(
        map(response => mapRequestPageResponse(response.responsePayload ?? {}, query)),
      );
  }

  fetchRequestById(id: string): Observable<WorkflowRequest | undefined> {
    return this.http
      .get<SuccessResponse<WorkflowRequestDto>>(`${this.baseUrl}/${encodeURIComponent(id)}`)
      .pipe(
        map(response => {
          const payload = response.responsePayload;
          return payload ? mapRequestDto(payload) : undefined;
        }),
        switchMap(request => {
          if (!request) return of(undefined);
          return this.fetchSubmittedFields(request).pipe(
            map(submittedFields => ({ ...request, submittedFields })),
          );
        }),
      );
  }

  /**
   * Request answers live in custom forms, keyed by the form plus the request as
   * the owning entity. A missing or unreadable submission must not hide the request.
   */
  private fetchSubmittedFields(
    request: WorkflowRequest,
  ): Observable<WorkflowRequestSubmittedField[]> {
    const formId = request.formSubmissionId?.trim();
    if (!formId) return of([]);
    return this.submissionsApi
      .formSubmissionControllerGetSubmission({
        formId,
        entityType: 'workflow',
        entityId: request.id,
      })
      .pipe(
        map(response => mapSubmittedFieldDtos(response.responsePayload ?? [])),
        catchError(() => of([] as WorkflowRequestSubmittedField[])),
      );
  }

  fetchRequestTimeline(id: string) {
    return this.fetchRequestById(id).pipe(
      map(request => request?.timeline ?? []),
    );
  }

  fetchRequestRefData() {
    return this.http
      .get<SuccessResponse<WorkflowRequestTypeDto[]>>(`${this.baseUrl}/types`)
      .pipe(
        map(response => mapRequestRefData(response.responsePayload ?? [])),
      );
  }

  fetchActiveMembers() {
    return this.usersApi.userControllerListUsers({ status: 'ACTIVE' }).pipe(
      map(response => mapPagedUserDtoToPagedUser(response.responsePayload as any)),
      map(page => (page.content ?? []).map(user => ({
        id: user.id,
        fullName: user.fullName ?? user.id,
        email: user.email ?? '',
      }))),
    );
  }

  fetchStartForm(definitionId: string) {
    return this.http
      .get<SuccessResponse<WorkflowStartFormDto>>(
        `${this.baseUrl}/types/${encodeURIComponent(definitionId)}/start-form`,
      )
      .pipe(
        map(response => mapStartFormDto(
          response.responsePayload ?? { type: definitionId, fields: [] },
        )),
      );
  }

  startRequest(input: StartRequestInput): Observable<WorkflowRequest> {
    return this.http
      .post<SuccessResponse<WorkflowRequestDto>>(this.baseUrl, {
        type: input.type,
        formValues: input.formValues ?? {},
        initiatedForId: input.initiatedForId,
      })
      .pipe(
        map(response => mapRequestDto(response.responsePayload as WorkflowRequestDto)),
      );
  }

  startWorkRequest(id: string): Observable<WorkflowRequest> {
    return this.http
      .post<SuccessResponse<WorkflowRequestDto>>(
        `${this.baseUrl}/${encodeURIComponent(id)}/start`,
        {},
      )
      .pipe(
        map(response => mapRequestDto(response.responsePayload as WorkflowRequestDto)),
      );
  }

  assignRequest(id: string, assigneeId: string): Observable<WorkflowRequest> {
    return this.http
      .post<SuccessResponse<WorkflowRequestDto>>(
        `${this.baseUrl}/${encodeURIComponent(id)}/assign`,
        { assigneeId },
      )
      .pipe(
        map(response => mapRequestDto(response.responsePayload as WorkflowRequestDto)),
      );
  }

  closeRequest(id: string, input?: RequestDecisionInput): Observable<WorkflowRequest> {
    return this.postDecision(id, 'close', input);
  }

  approveRequest(id: string, input?: RequestDecisionInput): Observable<WorkflowRequest> {
    return this.postDecision(id, 'approve', input);
  }

  rejectRequest(id: string, input?: RequestDecisionInput): Observable<WorkflowRequest> {
    return this.postDecision(id, 'reject', input);
  }

  withdrawRequest(id: string, input?: RequestDecisionInput): Observable<WorkflowRequest> {
    return this.postDecision(id, 'withdraw', input);
  }

  private postDecision(
    id: string,
    action: 'close' | 'approve' | 'reject' | 'withdraw',
    input?: RequestDecisionInput,
  ): Observable<WorkflowRequest> {
    return this.http
      .post<SuccessResponse<WorkflowRequestDto>>(
        `${this.baseUrl}/${encodeURIComponent(id)}/${action}`,
        { note: input?.note },
      )
      .pipe(
        map(response => mapRequestDto(response.responsePayload as WorkflowRequestDto)),
      );
  }
}
