import { Component, ElementRef } from '@angular/core';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { Task } from '../../model/task.model';

import { date } from 'src/app/core/service/utilities.service';
import { WorkflowConstant } from '../../workflow.const';
import { RequestService } from '../../service/request.service';
import { PendingTasksTabComponent } from '../pending-tasks-tab/pending-tasks-tab.component';
import { TaskService } from '../../service/task.service';
import { getTaskDetailSection } from '../../fields/tasks.field';

@Component({
  selector: 'app-completed-tasks-tab',
  templateUrl: './completed-tasks-tab.component.html',
  styleUrls: ['./completed-tasks-tab.component.scss']
})
export class CompletedTasksTabComponent extends PendingTasksTabComponent {

  protected override completed: boolean = true;


  override onInitHook(): void {
    this.setHeaderRow([
      {
        value: 'Task Id',
        rounded: true
      },
      {
        value: 'Task Status',
        rounded: true
      },
      {
        value: 'Workflow Id',
        rounded: true
      },
      {
        value: 'Completed On',
        rounded: true
      }
    ]);
  }

  protected override prepareHighLevelView(item: Task, options?: { [key: string]: any }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: item?.id!,
        bgColor: 'bg-purple-200'
      },
      {
        type: 'text',
        value: item?.status!,
        showDisplayValue: true,
        refDataSection: WorkflowConstant.refDataKey.workflowTaskStatuses
      },
      {
        type: 'text',
        value: item?.workflowId!,
      },
      {
        type: 'text',
        value: date(item.completedAt)
      }
    ];
  }

  protected override prepareDetailedView(m: Task, options?: { [key: string]: any }): DetailedView[] {
    return [
      getTaskDetailSection(m, 'completed_worklist', this.getRefData()!)
    ];
  }

  protected override prepareDefaultButtons(data: Task, options?: { [key: string]: any }): AccordionButton[] {
    return [
    ];
  }




}
