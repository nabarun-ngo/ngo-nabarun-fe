import { Component, ElementRef } from '@angular/core';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { Task } from '../../model/task.model';

import { date } from 'src/app/core/service/utilities.service';
import { TaskField, WorkflowConstant } from '../../workflow.const';
import { RequestService } from '../../service/request.service';
import { getWorkDetailSection } from '../../fields/request.field';
import { PendingTasksTabComponent } from '../pending-tasks-tab/pending-tasks-tab.component';
import { TaskService } from '../../service/task.service';

@Component({
  selector: 'app-completed-tasks-tab',
  templateUrl: './completed-tasks-tab.component.html',
  styleUrls: ['./completed-tasks-tab.component.scss']
})
export class CompletedTasksTabComponent extends PendingTasksTabComponent {



  constructor(
    protected override taskService: TaskService,
    protected override el: ElementRef,
  ) {
    super(taskService, el);
  }

  override onInitHook(): void {
    this.setHeaderRow([
      {
        value: TaskField.workId,
        rounded: true
      },
      {
        value: TaskField.requestStatus,
        rounded: true
      },
      {
        value: TaskField.requestId,
        rounded: true
      },
      {
        value: TaskField.completedOn,
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
        refDataSection: WorkflowConstant.refDataKey.workflowSteps
      },
      {
        type: 'text',
        value: 'N/A',
      },
      {
        type: 'text',
        value: date(item.completedAt)
      }
    ];
  }

  protected override prepareDetailedView(m: Task, options?: { [key: string]: any }): DetailedView[] {
    return [
      getWorkDetailSection(m, 'completed_worklist')
    ];
  }

  protected override prepareDefaultButtons(data: Task, options?: { [key: string]: any }): AccordionButton[] {
    return [];
  }


  protected override onClick($event: { buttonId: string; rowIndex: number; }) {
  }

}
