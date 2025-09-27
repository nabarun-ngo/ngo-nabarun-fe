import { Component, ElementRef, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { scrollToFirstInvalidControl } from 'src/app/core/service/form.service';
import { DetailedView, DetailedViewField } from 'src/app/shared/model/detailed-view.model';
import { AccordionButton, AccordionCell } from 'src/app/shared/model/accordion-list.model';
import { KeyValue, PaginateWorkDetail, WorkDetail } from 'src/app/core/api/models';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { date } from 'src/app/core/service/utilities.service';
import { PageEvent } from '@angular/material/paginator';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { Accordion } from 'src/app/shared/utils/accordion';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { RequestConstant, TaskDefaultValue, TaskField, workListTab } from '../../request.const';
import { RequestService } from '../../request.service';
import { getDocumentDetailSection, getRequestAdditionalDetailSection, getRequestDetailSection, getWorkActionDetailSection, getWorkDetailSection } from '../../request.field';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent extends Accordion<WorkDetail> implements OnInit {

  protected tabIndex!: number;
  protected tabMapping: workListTab[] = ['pending_worklist', 'completed_worklist'];
  protected workItemList!: PaginateWorkDetail;

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  protected actionName!: string;
  protected searchInput!: SearchAndAdvancedSearchModel;
  refData!: { [key: string]: KeyValue[]; };


  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private taskService: RequestService,
    private el: ElementRef,
  ) {
    super();
    super.init(TaskDefaultValue.pageNumber, TaskDefaultValue.pageSize, TaskDefaultValue.pageSizeOptions)
  }

  ngOnInit(): void {
    this.sharedDataService.setPageName(TaskDefaultValue.pageTitle);

    let tab = this.route.snapshot.data["tab"] ? this.route.snapshot.data["tab"] as workListTab : TaskDefaultValue.tabName;
    this.tabMapping.forEach((value: workListTab, key: number) => {
      if (tab == value) {
        this.tabIndex = key;
      }
    })

    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('TASK', this.refData);
      this.setRefData(this.refData);
    }

    this.setAccordionHeader();

    if (this.route.snapshot.data['data']) {
      this.workItemList = this.route.snapshot.data['data'] as PaginateWorkDetail;
      this.setContent(this.workItemList.content!, this.workItemList.totalSize)

    }

    this.searchInput = {
      normalSearchPlaceHolder: 'Search by Work Id, Request Id, Work Type',
      advancedSearch: {
        searchFormFields: [
          {
            formControlName: 'workId',
            inputModel: {
              tagName: 'input',
              inputType: 'text',
              html_id: 'workId',
              labelName: 'Work Id',
              placeholder: 'Enter Work Id',
              cssInputClass: 'bg-white'
            },
          },
          {
            formControlName: 'requestId',
            inputModel: {
              tagName: 'input',
              inputType: 'text',
              html_id: 'requestId',
              labelName: 'Request Id',
              placeholder: 'Enter Request Id',
            },
          },
          {
            formControlName: 'fromDate',
            inputModel: {
              tagName: 'input',
              inputType: 'date',
              html_id: 'startDate',
              labelName: 'From Date',
              placeholder: 'Enter From Date',
            },
          },
          {
            formControlName: 'toDate',
            inputModel: {
              tagName: 'input',
              inputType: 'date',
              html_id: 'endDate',
              labelName: 'To Date',
              placeholder: 'Enter To Date',
            },
          },

        ]
      }
    }
  }
  setAccordionHeader() {
    this.setHeaderRow([
      {
        value: TaskField.workId,
        rounded: true
      },
      {
        value: this.tabMapping[this.tabIndex] == 'completed_worklist' ?TaskField.workType :TaskField.requestStatus,
        rounded: true
      },
      {
        value: TaskField.requestId,
        rounded: true
      },
      {
        value: this.tabMapping[this.tabIndex] == 'completed_worklist' ? TaskField.completedOn : TaskField.pendingSince,
        rounded: true
      }
    ])

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
        value: this.tabMapping[this.tabIndex] == 'completed_worklist' ? item?.workType! :item?.workflowStatus!,
        showDisplayValue:true,
        refDataSection: this.tabMapping[this.tabIndex] == 'completed_worklist' ? RequestConstant.refDataKey.workType  :RequestConstant.refDataKey.workflowSteps
      },
      {
        type: 'text',
        value: item?.workflowId!,
      },
      {
        type: 'text',
        value: date(this.tabMapping[this.tabIndex] == 'completed_worklist' ? item.decisionDate : item.createdOn)
      }
    ]
  }

  protected override prepareDetailedView(m: WorkDetail, options?: { [key: string]: any }): DetailedView[] {
    return this.tabMapping[this.tabIndex] == 'completed_worklist' ? [
      getWorkDetailSection(m, this.tabMapping[this.tabIndex]),
      getWorkActionDetailSection(m)
    ] :
      [
        getWorkDetailSection(m, this.tabMapping[this.tabIndex])
      ]
  }

  protected override prepareDefaultButtons(data: WorkDetail, options?: { [key: string]: any }): AccordionButton[] {
    if (this.tabMapping[this.tabIndex] == 'pending_worklist') {
      return data.workType == 'USER_INPUT' ? [] : [
        {
          button_id: 'UPDATE',
          button_name: 'Update'
        }
      ]
    }
    return [];
  }



  protected tabChanged(index: number) {
    this.tabIndex = index;
    this.pageNumber = TaskDefaultValue.pageNumber;
    this.pageSize = TaskDefaultValue.pageSize;
    this.fetchDetails();
    this.setAccordionHeader();
  }

  private fetchDetails(filter?: {
    requestId?: string,
    workId?: string,
    fromDate?: string,
    toDate?: string,
  }) {
    this.getAccordionList().searchValue = '';
    if (this.tabMapping[this.tabIndex] == 'pending_worklist') {
      this.taskService.findMyWorkList({
        isCompleted: false,
        requestId: filter?.requestId,
        workId: filter?.workId,
        fromDate: filter?.fromDate,
        toDate: filter?.toDate,
      }, this.pageNumber, this.pageSize).subscribe(s => {
        this.workItemList = s!;
        this.setContent(this.workItemList.content!, this.workItemList?.totalSize!);
      })
    } else if (this.tabMapping[this.tabIndex] == 'completed_worklist') {
      this.taskService.findMyWorkList({
        isCompleted: true,
        requestId: filter?.requestId,
        workId: filter?.workId,
        fromDate: filter?.fromDate,
        toDate: filter?.toDate
      }, this.pageNumber, this.pageSize).subscribe(s => {
        this.workItemList = s!;
        this.setContent(this.workItemList.content!, this.workItemList?.totalSize!);
      })
    }
  }


  override handlePageEvent($event: PageEvent): void {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.fetchDetails();
  }

  onClick($event: { buttonId: string; rowIndex: number; }) {
    switch ($event.buttonId) {
      case 'UPDATE':
        let work = this.workItemList.content![$event.rowIndex];
        this.addSectionInAccordion(getWorkActionDetailSection(work!), $event.rowIndex)
        this.showEditForm($event.rowIndex, ['action_details']);
        this.actionName = $event.buttonId;
        break;
      case 'CONFIRM':
        let item = this.workItemList.content![$event.rowIndex];
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
            this.fetchDetails();
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



  onSearch($event: { advancedSearch: boolean; reset: boolean; value: any; }) {
    if ($event.advancedSearch && !$event.reset) {
      console.log($event.value)
      this.fetchDetails({
        fromDate: $event.value.fromDate,
        requestId: $event.value.requestId,
        toDate: $event.value.toDate,
        workId: $event.value.workId
      })
    }
    else if ($event.advancedSearch && $event.reset) {
      this.fetchDetails()
    }
    else {
      this.getAccordionList().searchValue = $event.value as string;
    }
  }
} 
