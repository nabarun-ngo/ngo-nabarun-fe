import { Injectable } from '@angular/core';
import { Observable, filter, map } from 'rxjs';
import { WorkflowControllerService, UserControllerService, DmsControllerService } from 'src/app/core/api-client/services';
import { mapPagedWorkflowInstanceDtoToPagedRequest, mapToWorkflowInstanceDtoToWorkflowRequest } from '../model/workflow.mapper';
import { PagedRequest, WorkflowRequest } from '../model/request.model';
import { mapPagedUserDtoToPagedUser } from '../../member/models/member.mapper';
import { KeyValue } from 'src/app/shared/model/key-value.model';

@Injectable({
  providedIn: 'root'
})
export class RequestService {


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
    console.log(filter);
    if (requestFor === 'me') {
      return this.workflowController.listInstancesForMe({
        page: page,
        size: size,
        workflowId: filter?.workflowId,
        status: filter?.status as any,
        type: filter?.type as any
      }).pipe(
        map(d => d.responsePayload),
        map(mapPagedWorkflowInstanceDtoToPagedRequest)
      );
    }
    return this.workflowController.listInstancesByMe({
      page: page,
      size: size,
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
      map(d => d.responsePayload),
      map(mapToWorkflowInstanceDtoToWorkflowRequest)
    );
  }

  withdrawRequest(id: string): Observable<any> {
    // Currently no direct "cancel" in WorkflowControllerService, 
    // but might be implemented as a task update or a different endpoint
    // Returning an error observable for now
    return new Observable(observer => {
      observer.error('Withdrawal not implemented in new workflow API yet');
    });
  }

  getRefData() {
    return this.workflowController.workflowReferenceData().pipe(
      map(d => d.responsePayload),
    );
  }

  getAdditionalFields(requestType: string, stepId?: string, taskId?: string) {
    return this.workflowController.additionalFields({
      workflowType: requestType,
      stepId: stepId,
      taskId: taskId
    }).pipe(
      map(d => d.responsePayload),
    );
  }

  getRequestDetail(id: string): Observable<WorkflowRequest> {
    return this.workflowController.getInstance({ id }).pipe(
      map(d => d.responsePayload),
      map(mapToWorkflowInstanceDtoToWorkflowRequest)
    );
  }
}

