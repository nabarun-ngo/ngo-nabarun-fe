import { Component, ElementRef } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { scrollToFirstInvalidControl } from 'src/app/core/service/form.service';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { PaginateWorkDetail, WorkDetail } from 'src/app/core/api-client/models';
import { date, removeNullFields } from 'src/app/core/service/utilities.service';
import { Accordion } from 'src/app/shared/utils/accordion';
import { RequestConstant, TaskDefaultValue, TaskField } from '../../request.const';
import { RequestService } from '../../request.service';
import { getDocumentDetailSection, getRequestAdditionalDetailSection, getRequestDetailSection, getWorkActionDetailSection, getWorkDetailSection } from '../../request.field';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';

@Component({
  selector: 'app-pending-tasks-tab',
  templateUrl: './pending-tasks-tab.component.html',
  styleUrls: ['./pending-tasks-tab.component.scss']
})
export class PendingTasksTabComponent extends Accordion<WorkDetail> implements TabComponentInterface<PaginateWorkDetail> {
  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: TaskDefaultValue.pageNumber,
      pageSize: TaskDefaultValue.pageSize,
      pageSizeOptions: TaskDefaultValue.pageSizeOptions,
    };
  }

  protected actionName!: string;
  protected isCompleted: boolean = false;
  constructor(
    protected taskService: RequestService,
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
      this.taskService.findMyWorkList(this.isCompleted, undefined, undefined, removeNullFields(event.value))
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
    this.taskService.findMyWorkList(this.isCompleted, TaskDefaultValue.pageNumber, TaskDefaultValue.pageSize)
      .subscribe(s => {
        this.setContent(s?.content!, s?.totalSize!);
      })
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
        value: date(item.createdOn)
      }
    ];
  }

  protected override prepareDetailedView(m: WorkDetail, options?: { [key: string]: any }): DetailedView[] {
    return [
      getWorkDetailSection(m, 'pending_worklist')
    ];
  }

  protected override prepareDefaultButtons(data: WorkDetail, options?: { [key: string]: any }): AccordionButton[] {
    return data.workType == 'USER_INPUT' ? [] : [
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
          let detail: WorkDetail = {};
          detail.additionalFields = [];
          Object.keys(form_action_detail.value).forEach(key => {
            detail.additionalFields?.push({
              key: key as any,
              value: form_action_detail!.value[key],
              updateField: item.additionalFields?.find(f => f.key === key)?.value != form_action_detail!.value[key]
            })
          })
          this.taskService.updateWorkItem(item.id!, detail).subscribe(data => {
            this.hideForm($event.rowIndex)
            this.loadData();
          })
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
    this.pageEvent = $event;
    this.taskService.findMyWorkList(this.isCompleted, this.pageNumber, this.pageSize)
      .subscribe(s => {
        this.setContent(s?.content!, s?.totalSize!);
      })
  }
}
