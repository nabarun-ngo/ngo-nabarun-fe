import { Injectable } from '@angular/core';
import { Observable, map, of, shareReplay, tap } from 'rxjs';
import { WorkflowControllerService, UserControllerService, DmsControllerService } from 'src/app/core/api-client/services';
import { mapPagedWorkflowInstanceDtoToPagedRequest, mapToWorkflowInstanceDtoToWorkflowRequest } from '../model/workflow.mapper';
import { PagedRequest, WorkflowRequest } from '../model/request.model';
import { mapPagedUserDtoToPagedUser } from '../../member/models/member.mapper';

@Injectable({
  providedIn: 'root'
})
export class RequestService {


  private additionalFieldsCache = new Map<string, Observable<any>>();
  private requestDetailCache = new Map<string, Observable<WorkflowRequest>>();

  constructor(
    private workflowController: WorkflowControllerService,
    private userController: UserControllerService,
    private dmsController: DmsControllerService,
  ) { }

  getUsers() {
    return this.userController.listUsers({
      status: 'ACTIVE'
    }).pipe(
      map(d => d.responsePayload),
      map(mapPagedUserDtoToPagedUser));
  }

  findRequests(
    requestFor: 'me' | 'others',
    page?: number,
    size?: number,
    filter?: {
      workflowId?: string;
      status?: string[];
      type?: string[];
    }
  ): Observable<PagedRequest> {
    if (requestFor === 'me') {
      return this.workflowController.listInstancesForMe({
        pageIndex: page,
        pageSize: size,
        workflowId: filter?.workflowId,
        status: filter?.status as any,
        type: filter?.type as any
      }).pipe(
        map(d => d.responsePayload),
        map(mapPagedWorkflowInstanceDtoToPagedRequest)
      );
    }
    return this.workflowController.listInstancesByMe({
      pageIndex: page,
      pageSize: size,
      delegated: 'Y', // interested to get request by me for others 
      workflowId: filter?.workflowId,
      status: filter?.status as any,
      type: filter?.type as any
    }).pipe(
      map(d => d.responsePayload),
      map(mapPagedWorkflowInstanceDtoToPagedRequest)
    );
  }



  createRequest(type: string, data: Record<string, string>, requestedFor?: string, isExtUser?: boolean, extUserEmail?: string) {
    return this.workflowController.startWorkflow({
      body: {
        type: type as any,
        data: data,
        requestedFor: requestedFor,
        forExternalUser: isExtUser,
        externalUserEmail: extUserEmail
      }
    }).pipe(
      map(d => d.responsePayload as any),
      map(mapToWorkflowInstanceDtoToWorkflowRequest),
      tap(request => this.requestDetailCache.set(request.id, of(request).pipe(shareReplay(1))))
    );
  }

  withdrawRequest(id: string, reason: string): Observable<WorkflowRequest> {
    return this.workflowController.cancelWorkflow({
      id,
      reason
    }).pipe(
      map(d => d.responsePayload as any),
      map(mapToWorkflowInstanceDtoToWorkflowRequest),
      tap(request => this.requestDetailCache.set(request.id, of(request).pipe(shareReplay(1))))
    )
  }

  getRefData() {
    return this.workflowController.workflowReferenceData().pipe(
      map(d => d.responsePayload),
    );
  }

  getAdditionalFields(requestType: string, stepId?: string, taskId?: string) {
    const cacheKey = `${requestType}-${stepId || ''}-${taskId || ''}`;
    if (!this.additionalFieldsCache.has(cacheKey)) {
      const obs = this.workflowController.additionalFields({
        workflowType: requestType,
        stepId: stepId,
        taskId: taskId
      }).pipe(
        map(d => d.responsePayload),
        shareReplay(1)
      );
      this.additionalFieldsCache.set(cacheKey, obs);
    }
    return this.additionalFieldsCache.get(cacheKey)!;
  }

  getRequestDetail(id: string, force?: boolean): Observable<WorkflowRequest> {
    if (force || !this.requestDetailCache.has(id)) {
      const obs: Observable<WorkflowRequest> = this.workflowController.getInstance({ id }).pipe(
        map(d => d.responsePayload as any),
        map(mapToWorkflowInstanceDtoToWorkflowRequest),
        shareReplay(1)
      );
      this.requestDetailCache.set(id, obs);
    }
    return this.requestDetailCache.get(id)!;
  }

  clearCache() {
    this.additionalFieldsCache.clear();
    this.requestDetailCache.clear();
  }
}

