import { Injectable } from '@angular/core';
import { RequestControllerService } from 'src/app/core/api/services';
import { RequestDefaultValue, WorkListDefaultValue } from './request.const';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
 

  constructor(private requestController: RequestControllerService) { }

  findRequestRefData() {

  }
  

  findRequests(delegated: boolean = false) {
    return this.requestController.getMyRequests({ delegated: delegated, pageIndex: RequestDefaultValue.pageNumber, pageSize: RequestDefaultValue.pageSize }).pipe(map(d => d.responsePayload));
  }

  findMyWorkList(isCompleted: boolean) {
    return this.requestController.getMyWorkItems({ completed: isCompleted, pageIndex: WorkListDefaultValue.pageNumber, pageSize: WorkListDefaultValue.pageSize }).pipe(map(d => d.responsePayload));
  }

  updateDecision(id:string,decision:number,remarks:string){
    let decisionStep:'APPROVE'|'DECLINE' = decision==1 ? 'APPROVE' :'DECLINE';
    return this.requestController.updateWorkItem({id:id,body:{decision:decisionStep,remarks:remarks}}).pipe(map(d => d.responsePayload));
  }

  getRequestDetail(id:string){
    return this.requestController.getRequestDetail({id:id}).pipe(map(d => d.responsePayload));
  }

}
