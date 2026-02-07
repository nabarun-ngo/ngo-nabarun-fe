import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { scrollToFirstInvalidControl } from 'src/app/core/service/form.service';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { date, removeNullFields } from 'src/app/core/service/utilities.service';
import { Accordion } from 'src/app/shared/utils/accordion';
import { TaskDefaultValue, WorkflowConstant } from '../../workflow.const';
import { getRequestAdditionalDetailSection, getRequestDetailSection } from '../../fields/request.field';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { Task } from '../../model/task.model';
import { TaskService } from '../../service/task.service';
import { RequestService } from '../../service/request.service';
import { getTaskAdditionalDataSection, getTaskCheckListSection, getTaskDetailSection } from '../../fields/tasks.field';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'app-pending-tasks-tab',
  templateUrl: './pending-tasks-tab.component.html',
  styleUrls: ['./pending-tasks-tab.component.scss']
})
export class PendingTasksTabComponent extends Accordion<Task> implements TabComponentInterface<{ content: Task[], totalSize: number }> {

  protected completed: boolean = false;
  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: TaskDefaultValue.pageNumber,
      pageSize: TaskDefaultValue.pageSize,
      pageSizeOptions: TaskDefaultValue.pageSizeOptions,
    };
  }

  protected actionName!: string;

  constructor(

    protected taskService: TaskService,
    protected requestService: RequestService,
  ) {
    super();
  }

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
        value: 'Request Id',
        rounded: true
      },
      {
        value: 'Pending Since',
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
        value: item?.workflowId!, // Workflow ID not directly available in Task DTO yet
      },
      {
        type: 'text',
        value: date(item.createdAt)
      }
    ];
  }


  protected override prepareDetailedView(m: Task, options?: { [key: string]: any }): DetailedView[] {
    return [
      getTaskDetailSection(m, 'pending_worklist', this.getRefData()!),
      getTaskCheckListSection(m, 'pending_worklist')
    ];
  }

  protected override prepareDefaultButtons(data: Task, options?: { [key: string]: any }): AccordionButton[] {
    if (data.type == 'AUTOMATIC') {
      return [];
    }
    if (data.status == 'PENDING') {
      return [
        {
          button_id: 'VIEW_REQUEST',
          button_name: 'View Request'
        },
        {
          button_id: 'ACCEPT',
          button_name: 'Accept'
        }
      ];
    }
    return [
      {
        button_id: 'UPDATE',
        button_name: 'Update'
      }
    ];
  }


  protected override onClick($event: { buttonId: string; rowIndex: number; }) {
    let task = this.itemList![$event.rowIndex];
    switch ($event.buttonId) {
      case 'ACCEPT':
        this.taskService.updateTask(task.workflowId!, task.id!,
          'IN_PROGRESS', 'Accepted Task').subscribe(data => {
            this.hideForm($event.rowIndex)
            this.updateContentRow(data, $event.rowIndex);
          })
        this.actionName = $event.buttonId;
        break;
      case 'UPDATE':
        this.showEditForm($event.rowIndex, ['work_detail', 'additional_data']);
        this.actionName = $event.buttonId;
        break;
      case 'CONFIRM':
        let form_work_detail = this.getSectionForm('work_detail', $event.rowIndex);
        let form_additional_data = this.getSectionForm('additional_data', $event.rowIndex);

        if (form_work_detail?.valid && form_additional_data?.valid) {
          const remarks = form_work_detail.value['remarks'];
          const status = form_work_detail.value['status'];
          const additionalData = form_additional_data.value;
          this.taskService.updateTask(task.workflowId!, task.id!,
            status, remarks, additionalData).subscribe(data => {
              this.hideForm($event.rowIndex)
              if (data.completedAt) {
                this.removeContentRow($event.rowIndex)
              } else {
                this.updateContentRow(data, $event.rowIndex);
              }
            })
        } else {
          form_work_detail?.markAllAsTouched();
          form_additional_data?.markAllAsTouched();
          this.scrollToError(false, $event.rowIndex)
        }
        break;
      case 'CANCEL':
        this.hideForm($event.rowIndex)
        break;

    }
  }

  protected override async onAccordionOpen(event: { rowIndex: number; }): Promise<void> {
    const task = this.itemList![event.rowIndex];
    const workflowId = task.workflowId!;
    const request = await firstValueFrom(this.requestService.getRequestDetail(workflowId));
    const taskAddnlDetail = await firstValueFrom(this.requestService.getAdditionalFields(request.type!, task.stepId, task.taskId));
    const requestAddnlDetail = await firstValueFrom(this.requestService.getAdditionalFields(request.type!));
    this.addSectionInAccordion(getTaskAdditionalDataSection(task!, taskAddnlDetail), event.rowIndex)
    this.addSectionInAccordion(getRequestAdditionalDetailSection(request!, requestAddnlDetail), event.rowIndex, false, true)
    this.addSectionInAccordion(getRequestDetailSection(request!, this.getRefData()!), event.rowIndex, false, true)
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.taskService.findMyTasks(this.completed, $event.pageIndex, $event.pageSize)
      .subscribe(s => {
        this.setContent(s?.content!, s?.totalSize!);
      })
  }


  onSearch(event: SearchEvent): void {
    if (event.advancedSearch && !event.reset) {
      this.taskService.findMyTasks(this.completed,
        undefined,
        undefined,
        { ...removeNullFields(event.value) }
      )
        .subscribe(s => {
          this.setContent(s?.content!, s?.totalSize!);
        })
    } else if (event.advancedSearch && event.reset) {
      this.loadData();
    } else {
      this.getAccordionList().searchValue = event.value as string;
    }
  }

  loadData(): void {
    this.taskService.findMyTasks(this.completed)
      .subscribe(s => {
        this.setContent(s?.content!, s?.totalSize!);
      })
  }

}
