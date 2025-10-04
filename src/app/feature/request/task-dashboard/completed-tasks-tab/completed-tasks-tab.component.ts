import { Component, ElementRef } from '@angular/core';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { WorkDetail } from 'src/app/core/api/models';
import { date } from 'src/app/core/service/utilities.service';
import { RequestConstant, TaskField } from '../../request.const';
import { RequestService } from '../../request.service';
import { getWorkDetailSection } from '../../request.field';
import { PendingTasksTabComponent } from '../pending-tasks-tab/pending-tasks-tab.component';

@Component({
  selector: 'app-completed-tasks-tab',
  templateUrl: './completed-tasks-tab.component.html',
  styleUrls: ['./completed-tasks-tab.component.scss']
})
export class CompletedTasksTabComponent extends PendingTasksTabComponent {

  protected override isCompleted: boolean = true;

  constructor(
    protected override taskService: RequestService,
    protected override el: ElementRef,
  ) {
    super(taskService, el);  
  }

  override ngOnInit(): void {
    super.ngOnInit();
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

  protected override prepareHighLevelView(item: WorkDetail, options?: { [key: string]: any }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: item?.id!,
        bgColor: 'bg-purple-200'
      },
      {
        type: 'text',
        value: item?.workflowStatus!,
        showDisplayValue: true,
        refDataSection: RequestConstant.refDataKey.workflowSteps
      },
      {
        type: 'text',
        value: item?.workflowId!,
      },
      {
        type: 'text',
        value: date(item.decisionDate)
      }
    ];
  }

  protected override prepareDetailedView(m: WorkDetail, options?: { [key: string]: any }): DetailedView[] {
    return [
      getWorkDetailSection(m, 'completed_worklist')
    ];
  }

  protected override prepareDefaultButtons(data: WorkDetail, options?: { [key: string]: any }): AccordionButton[] {
    return [];
  }

  protected override onClick($event: { buttonId: string; rowIndex: number; }) {
  }
  
}
