import { Injectable } from '@angular/core';
import { CommonControllerService, RequestControllerService, UserControllerService } from 'src/app/core/api/services';
import { RequestDefaultValue, TaskDefaultValue } from './request.const';
import { Observable, map } from 'rxjs';
import { RefDataType, RequestDetail, WorkDetail, WorkDetailFilter } from 'src/app/core/api/models';
import { date } from 'src/app/core/service/utilities.service';

@Injectable({
  providedIn: 'root'
})
export class RequestService {
 
 

  constructor(
    private requestController: RequestControllerService,
    private commonController: CommonControllerService,
    private userController:UserControllerService,
  ) { }

  // findRequestRefData(workflowType?: string) {
  //   return this.commonController.getReferenceData({ names: [RefDataType.Workflow], workflowType: workflowType as any }).pipe(map(d => d.responsePayload));
  // }

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

  createRequest(detail:RequestDetail){
    return this.requestController.createRequest({body:detail}).pipe(map(d => d.responsePayload));
  }

  
  findMyWorkList(filter: {
    isCompleted: boolean
    requestId?: string,
    workId?: string,
    fromDate?: string,
    toDate?: string,
  }, pageIndex = TaskDefaultValue.pageNumber, pageSize = TaskDefaultValue.pageSize) {
    let filter_:WorkDetailFilter ={};
    filter_.completed=filter.isCompleted;

    if(filter?.requestId){
      filter_.requestId=filter?.requestId;
    }
    if(filter?.workId){
      filter_.workId=filter?.workId;
    }
    if(filter?.fromDate){
      filter_.fromDate=date(filter?.fromDate,'yyyy-MM-dd');
    }
    if(filter?.toDate){
      filter_.toDate=date(filter?.toDate,'yyyy-MM-dd');
    }
    console.log(filter_)
    return this.requestController.getMyWorkItems({
      filter: filter_,
      pageIndex: pageIndex, pageSize: pageSize
    }).pipe(map(d => d.responsePayload));
  }

  updateWorkItem(id: string, detail: WorkDetail) {
    return this.requestController.updateWorkItem({ id: id, body: detail }).pipe(map(d => d.responsePayload));
  }


  getRequestDetail(id: string) {
    return this.requestController.getRequestDetail({ id: id }).pipe(map(d => d.responsePayload));
  }

  getDocuments(refId: string) {
    return this.commonController.getDocuments({ docIndexId:refId, docIndexType:'REQUEST' }).pipe(map(d => d.responsePayload));
  }

  getWorkDetails(id: string) {
    return this.requestController.getWorkItems({ id: id }).pipe(map(d => d.responsePayload));
  }

  withdrawRequest(id: string) {
    return this.requestController.updateRequest({ id:id , body:{status:'CANCELLED'} }).pipe(map(d => d.responsePayload));
  }
 

}
