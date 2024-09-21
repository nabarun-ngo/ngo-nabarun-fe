import { Injectable } from '@angular/core';
import { CommonControllerService, RequestControllerService, UserControllerService } from 'src/app/core/api/services';
import { RequestDefaultValue } from './request.const';
import { Observable, map } from 'rxjs';
import { RefDataType, WorkDetail } from 'src/app/core/api/models';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
 
 

  constructor(
    private requestController: RequestControllerService,
    private commonController: CommonControllerService,
    private userController:UserControllerService,
  ) { }

  findRequestRefData(workflowType?: string) {
    return this.commonController.getReferenceData({ names: [RefDataType.Workflow], workflowType: workflowType as any }).pipe(map(d => d.responsePayload));
  }

  getUsers() {
    return this.userController.getUsers({filter:{}}).pipe(map(d => d.responsePayload));
  }


  findRequests(delegated: boolean = false,
    pageNumber:number=RequestDefaultValue.pageNumber,
    pageSize:number= RequestDefaultValue.pageSize) {
    return this.requestController.getMyRequests({ filter:{isDelegated: delegated}, pageIndex: pageNumber, pageSize: pageSize }).pipe(map(d => d.responsePayload));
  }

  findRefField(type: string) {
    return this.commonController.getReferenceField({source:'REQUEST-'+type}).pipe(map(d => d.responsePayload));
  }


}
