import { Component, ElementRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { scrollToFirstInvalidControl } from 'src/app/core/service/form.service';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { date } from 'src/app/core/service/utilities.service';
import { Accordion } from 'src/app/shared/utils/accordion';
import { TaskDefaultValue, TaskField, WorkflowConstant } from '../../workflow.const';
import { getRequestAdditionalDetailSection, getRequestDetailSection, getWorkActionDetailSection, getWorkDetailSection } from '../../fields/request.field';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { Task } from '../../model/task.model';
import { TaskService } from '../../service/task.service';
import { RequestService } from '../../service/request.service';


@Component({
  selector: 'app-pending-tasks-tab',
  templateUrl: './pending-tasks-tab.component.html',
  styleUrls: ['./pending-tasks-tab.component.scss']
})
export class PendingTasksTabComponent extends Accordion<Task> implements TabComponentInterface<{ content: Task[], totalSize: number }> {

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
    protected el: ElementRef,
  ) {
    super();
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
        value: TaskField.pendingSince,
        rounded: true
      }
    ]);
  }

  onSearch(event: SearchEvent): void {
    if (event.advancedSearch && !event.reset) {
      this.taskService.findMyTasks()
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
    this.taskService.findMyTasks()
      .subscribe(s => {
        this.setContent(s?.content!, s?.totalSize!);
      })
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
        value: 'N/A', // Workflow ID not directly available in Task DTO yet
      },
      {
        type: 'text',
        value: date(item.createdAt)
      }
    ];
  }


  protected override prepareDetailedView(m: Task, options?: { [key: string]: any }): DetailedView[] {
    return [
      getWorkDetailSection(m, 'pending_worklist')
    ];
  }

  protected override prepareDefaultButtons(data: Task, options?: { [key: string]: any }): AccordionButton[] {
    return data.type == 'AUTOMATIC' ? [] : [
      {
        button_id: 'UPDATE',
        button_name: 'Update'
      }
    ];
  }


  protected override onClick($event: { buttonId: string; rowIndex: number; }) {
    switch ($event.buttonId) {
      case 'UPDATE':
        let work = this.itemList![$event.rowIndex];
        this.addSectionInAccordion(getWorkActionDetailSection(work!), $event.rowIndex)
        this.showEditForm($event.rowIndex, ['action_details']);
        this.actionName = $event.buttonId;
        break;
      case 'CONFIRM':
        let item = this.itemList![$event.rowIndex];
        let form_action_detail = this.getSectionForm('action_details', $event.rowIndex);
        if (form_action_detail?.valid) {
          const remarks = form_action_detail.value['remarks'];
          // this.taskService.updateTask(item.id!, 'COMPLETED', remarks).subscribe(data => {
          //   this.hideForm($event.rowIndex)
          //   this.loadData();
          // })
        } else {
          form_action_detail?.markAllAsTouched();
          scrollToFirstInvalidControl(this.el.nativeElement);
        }
        break;
      case 'CANCEL':
        this.removeSectionInAccordion('action_details', $event.rowIndex)
        this.hideForm($event.rowIndex)
        break;

    }
  }

  protected override onAccordionOpen(event: { rowIndex: number; }): void {
    let item = this.itemList![event.rowIndex];
    // We need workflowId to fetch details. If not in Task, this will fail.
    const workflowId = item.id!;
    this.requestService.getRequestDetail(workflowId).subscribe(request => {
      this.addSectionInAccordion(getRequestDetailSection(request!, this.getRefData()!), event.rowIndex)
      this.requestService.getAdditionalFields(request.type!).subscribe(s => {
        this.addSectionInAccordion(getRequestAdditionalDetailSection(request!, s), event.rowIndex)
      })
    })
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.taskService.findMyTasks($event.pageIndex, $event.pageSize)
      .subscribe(s => {
        this.setContent(s?.content!, s?.totalSize!);
      })
  }

}
