import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { RefDataType, WorkDetail, WorkDetailFilter } from 'src/app/core/api/models';
import { CommonControllerService, RequestControllerService } from 'src/app/core/api/services';
import { TaskDefaultValue } from './task.const';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(
    private requestController: RequestControllerService,
    private commonController: CommonControllerService,
  ) { }

  findTaskRefData(workflowType?: string) {
    return this.commonController.getReferenceData({ names: [RefDataType.Workflow], workflowType: workflowType as any }).pipe(map(d => d.responsePayload));
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
      filter_.fromDate=filter?.fromDate;
    }
    if(filter?.toDate){
      filter_.toDate=filter?.toDate;
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



}
