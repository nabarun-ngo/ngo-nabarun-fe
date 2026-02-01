import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { WorkflowTaskDto } from 'src/app/core/api-client/models';
import { getTaskDetailSection } from 'src/app/feature/workflow/fields/tasks.field';
import { Task } from 'src/app/feature/workflow/model/task.model';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { AdminService } from '../../admin.service';
import { AdminDefaultValue } from '../../admin.const';

@Component({
  selector: 'app-admin-tasks-tab',
  templateUrl: './admin-tasks-tab.component.html',
  styleUrls: ['./admin-tasks-tab.component.scss']
})
export class AdminTasksTabComponent extends Accordion<Task> implements TabComponentInterface<string> {

  constructor(private readonly adminService: AdminService) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow([{ value: 'Name' }, { value: 'Description' }, { value: 'Status' }])
  }
  protected override prepareHighLevelView(data: Task, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.name
      },
      {
        type: 'text',
        value: data?.description!
      },
      {
        type: 'text',
        value: data?.status!
      }
    ]
  }
  protected override prepareDetailedView(data: Task, options?: { [key: string]: any; }): DetailedView[] {
    return [
      getTaskDetailSection(data, 'pending_worklist', this.getRefData()!)
    ]
  }
  protected override prepareDefaultButtons(data: Task, options?: { [key: string]: any; }): AccordionButton[] {
    if (data.status === 'FAILED') {
      return [{
        button_id: 'RETRY',
        button_name: 'Retry'
      }]
    }
    return []
  }
  protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
    if (event.buttonId === 'RETRY') {
      const task = this.itemList[event.rowIndex];
      this.adminService.retryTask(task.id, task.workflowId).subscribe(s => {
        this.loadData();
      })
    }
  }
  protected override onAccordionOpen(event: { rowIndex: number; }): void {

  }
  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: AdminDefaultValue.pageNumber,
      pageSize: AdminDefaultValue.pageSize,
      pageSizeOptions: AdminDefaultValue.pageSizeOptions
    }
  }
  override handlePageEvent($event: PageEvent): void {
    this.pageEvent = $event;
    this.adminService.getFailedTasks($event.pageIndex, $event.pageSize).subscribe(s => {
      this.setContent(s.content!, s.totalSize)
    })
  }
  onSearch($event: SearchEvent): void {

  }
  loadData(): void {
    this.adminService.getFailedTasks().subscribe(s => {
      this.setContent(s.content!, s.totalSize)
    })
  }

}
