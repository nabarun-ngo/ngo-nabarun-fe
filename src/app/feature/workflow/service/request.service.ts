import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
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
    return this.userController.listUsers({}).pipe(
      map(d => d.responsePayload),
      map(mapPagedUserDtoToPagedUser));
  }

  findRequests(
    requestFor: 'me' | 'others',
    page?: number,
    size?: number,
  ): Observable<PagedRequest> {
    if (requestFor === 'me') {
      return this.workflowController.listInstancesForMe({
        page: page,
        size: size
      }).pipe(
        map(d => d.responsePayload),
        map(mapPagedWorkflowInstanceDtoToPagedRequest)
      );
    }
    return this.workflowController.listInstancesByMe({
      page: page,
      size: size,
      delegated: true // interested to get request by me for others 
    }).pipe(
      map(d => d.responsePayload),
      map(mapPagedWorkflowInstanceDtoToPagedRequest)
    );
  }



  createRequest(type: string, data: Record<string, string>, requestedFor?: string) {
    return this.workflowController.startWorkflow({
      body: {
        type: type as any,
        data: data,
        requestedFor: requestedFor
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

}

