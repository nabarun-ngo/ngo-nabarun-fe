import { Injectable } from '@angular/core';
import { CommonControllerService, RequestControllerService, UserControllerService } from 'src/app/core/api/services';
import { RequestDefaultValue, TaskDefaultValue } from './request.const';
import { Observable, map } from 'rxjs';
import { RefDataType, RequestDetail, RequestDetailFilter, WorkDetail, WorkDetailFilter } from 'src/app/core/api/models';
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

  getUsers() {
    return this.userController.getUsers({filter:{}}).pipe(map(d => d.responsePayload));
  }


  findRequests(
    delegated: boolean,
    pageNumber?: number,
    pageSize?: number,
    additionalFilter?: RequestDetailFilter
  ) {
    let filter = { isDelegated: delegated, ...additionalFilter };
    return this.requestController.getMyRequests({ 
      filter: filter, 
      pageIndex: pageNumber, 
      pageSize: pageSize 
    }).pipe(map(d => d.responsePayload));
  }

  findRefField(type: string) {
    return this.commonController.getReferenceField({source:'REQUEST-'+type}).pipe(map(d => d.responsePayload));
  }

  createRequest(detail:RequestDetail){
    return this.requestController.createRequest({body:detail}).pipe(map(d => d.responsePayload));
  }

  
  findMyWorkList( 
    isCompleted: boolean,
    pageNumber?: number,
    pageSize?: number,
    filter?: WorkDetailFilter) {
    let filter_:WorkDetailFilter ={};
    filter_.completed=isCompleted;

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
      pageIndex: pageNumber, pageSize: pageSize
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

  /**
   * Advanced search for requests - placeholder implementation
   * In a real scenario, this would call a backend API with advanced search capabilities
   */
  advancedSearchRequests(
    delegated: boolean = false, 
    searchParams: any,
    pageNumber: number = RequestDefaultValue.pageNumber,
    pageSize: number = RequestDefaultValue.pageSize
  ) {
    // For now, delegate to regular findRequests with additional filter
    // This would be replaced with a proper advanced search API call
    return this.findRequests(delegated, pageNumber, pageSize, searchParams);
  }

}
