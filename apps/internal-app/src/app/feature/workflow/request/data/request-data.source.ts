import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type {
  PagedWorkflowRequest,
  RequestFilterCriteria,
  RequestMemberOption,
  RequestRefData,
  RequestStartForm,
  WorkflowRequest,
  WorkflowTimelineEntry,
} from '../domain';

export interface RequestListQuery {
  chipId?: string;
  criteria?: RequestFilterCriteria;
  refData?: RequestRefData;
  searchText?: string;
  pageIndex: number;
  pageSize: number;
  currentUserId?: string;
  append?: boolean;
}

export interface StartRequestInput {
  type: string;
  formValues: Record<string, unknown>;
  initiatedForId?: string;
}

export interface RequestDecisionInput {
  note?: string;
}

export interface RequestDataSource {
  loadRequestPage(query: RequestListQuery): Observable<PagedWorkflowRequest>;
  fetchRequestById(id: string): Observable<WorkflowRequest | undefined>;
  fetchRequestTimeline(id: string): Observable<WorkflowTimelineEntry[]>;
  fetchRequestRefData(): Observable<RequestRefData>;
  fetchActiveMembers(): Observable<RequestMemberOption[]>;
  fetchStartForm(definitionId: string): Observable<RequestStartForm>;
  startRequest(input: StartRequestInput): Observable<WorkflowRequest>;
  startWorkRequest(id: string): Observable<WorkflowRequest>;
  assignRequest(id: string, assigneeId: string): Observable<WorkflowRequest>;
  closeRequest(id: string, input?: RequestDecisionInput): Observable<WorkflowRequest>;
  approveRequest(id: string, input?: RequestDecisionInput): Observable<WorkflowRequest>;
  rejectRequest(id: string, input?: RequestDecisionInput): Observable<WorkflowRequest>;
  withdrawRequest(id: string, input?: RequestDecisionInput): Observable<WorkflowRequest>;
}

export const RequestDataSource =
  new InjectionToken<RequestDataSource>('RequestDataSource');
