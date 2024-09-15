import { Component, ElementRef, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { Paginator } from 'src/app/core/component/paginator';
import { scrollToFirstInvalidControl } from 'src/app/core/service/form.service';
import { DetailedView, DetailedViewField } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { TaskDefaultValue, TaskField, workListTab } from '../task.const';
import { AccordionButton, AccordionCell, AccordionList, AccordionRow } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { PaginateWorkDetail, WorkDetail } from 'src/app/core/api/models';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { TaskService } from '../task.service';
import { date } from 'src/app/core/service/utilities.service';
import { PageEvent } from '@angular/material/paginator';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { inputType, UniversalInputModel } from 'src/app/shared/components/generic/universal-input/universal-input.model';
import { TaskSearchPipe } from '../task.pipe';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss']
})
export class TaskListComponent extends Accordion<WorkDetail> implements OnInit {

  protected tabIndex!: number;
  protected tabMapping: workListTab[] = ['pending_worklist', 'completed_worklist'];
  protected workItemList!: PaginateWorkDetail;
 
  protected navigations: { displayName: string; routerLink: string; }[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  protected actionName!: string;
  protected searchInput={
    normalSearchPlaceHolder:'Search by Task Id, Request Id, Task Type',
  }


  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private taskService: TaskService,
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
      let refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('TASK', refData);
      this.setRefData(refData);
    }

    this.setHeaderRow([
      {
        value: TaskField.workId,
        rounded: true
      },
      {
        value: TaskField.workType,
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


    if (this.route.snapshot.data['data']) {
      this.workItemList = this.route.snapshot.data['data'] as PaginateWorkDetail;
      this.setContent(this.workItemList.content!, this.workItemList.totalSize)

    }
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
        value: item?.workType!,
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
    let task_action_content = m?.additionalFields?.map(m1 => {
      return {
        field_name: m1.name!,
        field_html_id: m1.id!,
        field_value: m1.value!,
        hide_field: false,
        form_control_name: m1.key,
        editable: true,
        form_input: {
          tagName: m1.type as any,
          inputType: m1.valueType as any,
          placeholder: '',
          selectList: m1.options?.map(o => {
            return { key: o, displayValue: o };
          })
        },
        form_input_validation: m1.mandatory ? [Validators.required] : []
      } as DetailedViewField;
    })
         
    return [
      {
        section_name: 'Work Details',
        section_type: 'key_value',
        section_html_id: 'work_detail',
        section_form: new FormGroup({}),
        content: [
          {
            field_name: 'Work Id',
            field_html_id: 'work_id',
            field_value: m.id!
          },
          {
            field_name: 'Work Type',
            field_html_id: 'work_type',
            field_value: m.workType!
          },
          {
            field_name: 'Work Description',
            field_html_id: 'work_description',
            field_value: m.description!,
          },
          {
            field_name: 'Creation Date',
            field_html_id: 'creation_date',
            field_value: date(m.createdOn)
          },
          {
            field_name: 'Decision Owner',
            field_html_id: 'decision_owner',
            field_value: m.decisionOwner?.fullName!,
            hide_field: this.tabMapping[this.tabIndex] == 'pending_worklist'
          },
          {
            field_name: 'Decision Date',
            field_html_id: 'decision_date',
            field_value: date(m.decisionDate),
            hide_field: this.tabMapping[this.tabIndex] == 'pending_worklist',
          },
        ]
      },
      {
        section_name: 'Work Action Detail',
        section_type: 'key_value',
        section_html_id: 'action_details',
        section_form: new FormGroup({}),
        content: task_action_content
      }
    ]
  }

  protected override prepareDefaultButtons(data: WorkDetail, options?: { [key: string]: any }): AccordionButton[] {
    // if (options && options['create']) {
    //   return [
    //     {
    //       button_id: 'CANCEL',
    //       button_name: 'Cancel'
    //     },
    //     {
    //       button_id: 'CONFIRM',
    //       button_name: 'Confirm'
    //     }
    //   ];
    // }
    if (this.tabMapping[this.tabIndex] == 'pending_worklist') {
      return [
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

  }

  private fetchDetails() {
    if (this.tabMapping[this.tabIndex] == 'pending_worklist') {
      this.taskService.findMyWorkList(false,this.pageNumber,this.pageSize).subscribe(s => {
        this.workItemList = s!;
        this.setContent(this.workItemList.content!, this.workItemList?.totalSize!);

      })
    } else if (this.tabMapping[this.tabIndex] == 'completed_worklist') {
      this.taskService.findMyWorkList(true,this.pageNumber,this.pageSize).subscribe(s => {
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
        this.showForm($event.rowIndex, ['action_details']);
        this.actionName = $event.buttonId;
        break;
      case 'CONFIRM':
        let item = this.workItemList.content![$event.rowIndex];
        let form_action_detail=this.getSectionForm('action_details',$event.rowIndex);
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
            this.fetchDetails();
          })
        } else {
          form_action_detail?.markAllAsTouched();
          scrollToFirstInvalidControl(this.el.nativeElement);
        }
        break;
      case 'CANCEL':
        this.hideForm($event.rowIndex)
        break;
    }

  }
 

  accordionOpened($event: { rowIndex: number; }) {
    let item = this.workItemList.content![$event.rowIndex];
    this.taskService.getRequestDetail(item.workflowId!).subscribe(request => {
      /**
       * Inserting request request details at top
       */
      this.addSectionInRow( $event.rowIndex,{
        section_name: 'Request Details',
        section_type: 'key_value',
        section_html_id: 'request_detail',
        section_form: new FormGroup({}),//Here you have to pass form group
        content: [
          {
            field_name: 'Request Id',
            field_value: request?.id!,
          },
          {
            field_name: 'Request Type',
            field_value: request?.type!,
          },
          {
            field_name: 'Request Status',
            field_value: request?.status!,
          },
          {
            field_name: 'Requester Name',
            field_value: request?.requester?.fullName!,
          }
        ]
      })

      let additional_content = request?.additionalFields?.map(m => {
        return {
          field_name: m.name,
          field_value: m.value,
        } as DetailedViewField;
      })

      this.addSectionInRow( $event.rowIndex,{
        section_name: 'Request Additional Details',
        section_type: 'key_value',
        section_html_id: 'request_add_detail',
        section_form: new FormGroup({}),
        content: additional_content
      })
    })
  }

  

  onSearch($event: { advancedSearch: boolean; reset: boolean; value: any; }) {
    this.accordionList.searchValue = $event.value;
  }
}
