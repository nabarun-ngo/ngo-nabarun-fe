import { Pipe, PipeTransform } from '@angular/core';
import { WorkDetail } from 'src/app/core/api/models';

@Pipe({
  name: 'taskSearch'
})
export class TaskSearchPipe implements PipeTransform {

  transform(tasks: WorkDetail[] | undefined, searchValue:string): WorkDetail[] {
    if(!tasks){
      return [];
    }
    if(!searchValue){
      return tasks;
    }
    //console.log(searchValue)
    searchValue=searchValue.toLowerCase();
    return tasks.filter((task:WorkDetail)=>

      (task.id != null && task.id.toLowerCase().includes(searchValue))
      ||
      (task.workflowId != null && task.workflowId.toLowerCase().includes(searchValue))
      ||
      (task.workType != null && task.workType.toLowerCase().includes(searchValue))
    );
  }

}
