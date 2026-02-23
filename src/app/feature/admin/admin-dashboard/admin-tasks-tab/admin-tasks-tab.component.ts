import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { getTaskDetailSection } from 'src/app/feature/workflow/fields/tasks.field';
import { Task } from 'src/app/feature/workflow/model/task.model';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { AdminService } from '../../admin.service';
import { AdminDefaultValue } from '../../admin.const';
import { getRequestAdditionalDetailSection, getRequestDetailSection } from 'src/app/feature/workflow/fields/request.field';
import { firstValueFrom } from 'rxjs';
import { RequestService } from 'src/app/feature/workflow/service/request.service';
import { SearchSelectModalConfig } from 'src/app/shared/components/search-select-modal/search-select-modal.component';
import { Validators } from '@angular/forms';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { SearchSelectModalService } from 'src/app/shared/components/search-select-modal/search-select-modal.service';

@Component({
  selector: 'app-admin-tasks-tab',
  templateUrl: './admin-tasks-tab.component.html',
  styleUrls: ['./admin-tasks-tab.component.scss']
})
export class AdminTasksTabComponent extends Accordion<Task> implements TabComponentInterface<string> {

  constructor(private readonly adminService: AdminService, private readonly requestService: RequestService,
    private readonly dialogService: SearchSelectModalService) {
    super();
  }

  override onInitHook(): void {
    this.setHeaderRow([{ value: 'Task ID' }, { value: 'Name' }, { value: 'Status' }])
  }
  protected override prepareHighLevelView(data: Task, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data?.id
      },
      {
        type: 'text',
        value: data?.name
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
  protected override async onAccordionOpen(event: { rowIndex: number; }): Promise<void> {
    const task = this.itemList![event.rowIndex];

    const workflowId = task.workflowId!;
    const request = await firstValueFrom(this.requestService.getRequestDetail(workflowId));
    const requestAddnlDetail = await firstValueFrom(this.requestService.getAdditionalFields(request.type!));
    this.addSectionInAccordion(getRequestAdditionalDetailSection(request!, requestAddnlDetail, false, true), event.rowIndex, false, true)
    this.addSectionInAccordion(getRequestDetailSection(request!, this.getRefData()!, false, false, true), event.rowIndex, false, true)


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
    this.adminService.getTasks(this.statusFilter, $event.pageIndex, $event.pageSize).subscribe(s => {
      this.setContent(s.content!, s.totalSize)
    })
  }
  onSearch($event: SearchEvent): void {

  }
  loadData(): void {
    this.adminService.getTasks(this.statusFilter).subscribe(s => {
      this.setContent(s.content!, s.totalSize)
    })
  }

  protected statusFilter: string = 'FAILED';
  protected statusMap: Record<string, string> = {
    'PENDING': 'Pending',
    'IN_PROGRESS': 'In Progress',
    'COMPLETED': 'Completed',
    'FAILED': 'Failed',
    'SKIPPED': 'Skipped'
  }
  protected statusFilterConfig: SearchSelectModalConfig = {
    searchFormFields: [
      {
        formControlName: 'status',
        validations: [Validators.required],
        inputModel: {
          html_id: 'status_F',
          inputType: '',
          tagName: 'select',
          placeholder: 'Select Task Status',
          selectList: Object.keys(this.statusMap).map(key => {
            return {
              key: key,
              displayValue: this.statusMap[key]
            } as KeyValue
          })
        }
      }
    ],
    title: 'Filter Task Status',
  }

  changeStatus() {
    this.dialogService.open(this.statusFilterConfig, { width: 700 }).subscribe((response) => {
      this.statusFilter = response.value.status;
      this.loadData();
    });
  }

}
