import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { WorkDetail } from 'src/app/core/api/models';
import { RequestControllerService } from 'src/app/core/api/services';
import { TaskDefaultValue } from './task.const';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  constructor(private requestController: RequestControllerService) { }

  findTaskRefData(): any {
  }

  findMyWorkList(isCompleted: boolean) {
    return this.requestController.getMyWorkItems({ completed: isCompleted, pageIndex: TaskDefaultValue.pageNumber, pageSize: TaskDefaultValue.pageSize }).pipe(map(d => d.responsePayload));
  }

  updateWorkItem(id:string,detail:WorkDetail){
    return this.requestController.updateWorkItem({id:id,body:detail}).pipe(map(d => d.responsePayload));
  }

  
  getRequestDetail(id:string){
    return this.requestController.getRequestDetail({id:id}).pipe(map(d => d.responsePayload));
  }
}
