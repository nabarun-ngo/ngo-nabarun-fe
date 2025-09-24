import { Component, ElementRef, AfterViewInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { scrollToFirstInvalidControl } from 'src/app/core/service/form.service';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { KeyValue, PaginateWorkDetail, WorkDetail } from 'src/app/core/api/models';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { date } from 'src/app/core/service/utilities.service';
import { Accordion } from 'src/app/shared/utils/accordion';
import { RequestConstant, TaskDefaultValue, TaskField } from '../../request.const';
import { RequestService } from '../../request.service';
import { getDocumentDetailSection, getRequestAdditionalDetailSection, getRequestDetailSection, getWorkDetailSection } from '../../request.field';
import { TabComponentInterface, SearchEvent } from 'src/app/shared/interfaces/tab-component.interface';

@Component({
  selector: 'app-completed-tasks-tab',
  templateUrl: './completed-tasks-tab.component.html',
  styleUrls: ['./completed-tasks-tab.component.scss']
})
export class CompletedTasksTabComponent extends Accordion<WorkDetail> implements AfterViewInit, TabComponentInterface<PaginateWorkDetail> {

  @Input() initialData?: PaginateWorkDetail;
  protected workItemList!: PaginateWorkDetail;
  refData!: { [key: string]: KeyValue[]; };

  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private taskService: RequestService,
    private el: ElementRef,
  ) {
    super();
    super.init(TaskDefaultValue.pageNumber, TaskDefaultValue.pageSize, TaskDefaultValue.pageSizeOptions);
    
    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
      this.setRefData(this.refData);
    }
  }

  override ngOnInit(): void {
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

  ngAfterViewInit(): void {
    // Use initial data if provided (from resolver), but don't auto-load otherwise
    if (this.initialData) {
      this.workItemList = this.initialData;
      this.setContent(this.initialData.content!, this.initialData.totalSize);
    }
    // Note: Don't auto-load data here - wait for parent to trigger loading
  }

  /**
   * Trigger data loading - called by parent component when tab is activated
   */
  triggerDataLoad(): void {
    if (!this.initialData && !this.workItemList) {
      this.loadData();
    }
  }

  loadData(): void {
    this.fetchDetails();
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
    return []; // No action buttons for completed tasks
  }

  protected override onClick($event: { buttonId: string; rowIndex: number; }) {
    // No actions available for completed tasks
  }

  protected override onAccordionOpen(event: { rowIndex: number; }): void {
    let item = this.workItemList.content![event.rowIndex];
    this.taskService.getRequestDetail(item.workflowId!).subscribe(request => {
      /**
       * Inserting request request details at top
       */
      this.addSectionInAccordion(getRequestDetailSection(request!), event.rowIndex)
      this.addSectionInAccordion(getRequestAdditionalDetailSection(request!), event.rowIndex)
      this.taskService.getDocuments(item.workflowId!).subscribe(data => {
        this.addSectionInAccordion(getDocumentDetailSection(data!), event.rowIndex)
      })
    }) 
  }

  override handlePageEvent($event: PageEvent): void {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.fetchDetails();
  }

  fetchDetails(filter?: {
    requestId?: string,
    workId?: string,
    fromDate?: string,
    toDate?: string,
  }) {
    this.getAccordionList().searchValue = '';
    this.taskService.findMyWorkList({
      isCompleted: true,
      requestId: filter?.requestId,
      workId: filter?.workId,
      fromDate: filter?.fromDate,
      toDate: filter?.toDate,
    }, this.pageNumber, this.pageSize).subscribe(s => {
      this.workItemList = s!;
      this.setContent(this.workItemList.content!, this.workItemList?.totalSize!);
    })
  }

  onFormCancel($event: { rowIndex: number }) {
    // Handle form cancel event - no forms in completed tasks
  }

  onFormSubmit($event: { buttonId: string; rowIndex: number; }) {
    // Handle form submit event - no forms in completed tasks
  }

  onRowClick($event: { buttonId: string; rowIndex: number; }) {
    // Handle row click event - no actions in completed tasks
  }

  onSearch(event: SearchEvent): void {
    if (event.advancedSearch && !event.reset) {
      console.log('Completed Tasks - Advanced Search:', event.value);
      this.fetchDetails({
        requestId: event.value.requestId,
        workId: event.value.workId,
        fromDate: event.value.fromDate,
        toDate: event.value.toDate
      });
    } else if (event.advancedSearch && event.reset) {
      console.log('Completed Tasks - Reset Search');
      this.fetchDetails();
    } else {
      // Handle normal search
      this.getAccordionList().searchValue = event.value as string;
    }
  }
}
