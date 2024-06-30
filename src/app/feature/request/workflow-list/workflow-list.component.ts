import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Paginator } from 'src/app/core/component/paginator';
import { WorkField, WorkListDefaultValue, workListTab } from '../request.const';
import { AccordionCell, AccordionList, AccordionRow } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { PaginateWorkDetail } from 'src/app/core/api/models';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from '../request.service';
import { PageEvent } from '@angular/material/paginator';
import { FormGroup } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { date } from 'src/app/core/service/utilities.service';
import { DetailedView, DetailedViewField } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { ModalService } from 'src/app/core/service/modal.service';

@Component({
  selector: 'app-workflow-list',
  templateUrl: './workflow-list.component.html',
  styleUrls: ['./workflow-list.component.scss']
})
export class WorkflowListComponent extends Paginator implements OnInit {


  protected tabIndex!: number;
  protected tabMapping: workListTab[] = ['pending_worklist', 'completed_worklist'];
  protected accordionList!: AccordionList;
  protected workItemList!: PaginateWorkDetail;
  protected workItemForm: FormGroup = new FormGroup({});
  @ViewChild("remarksModal") remarksModal!: TemplateRef<any>;

  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private requestService: RequestService,
    private modalService:ModalService
  ) {
    super();
    super.init(WorkListDefaultValue.pageNumber, WorkListDefaultValue.pageSize, WorkListDefaultValue.pageSizeOptions)
  }

  ngOnInit(): void {
    this.sharedDataService.setPageName(WorkListDefaultValue.pageTitle);

    let tab = this.route.snapshot.data["tab"] ? this.route.snapshot.data["tab"] as workListTab : WorkListDefaultValue.tabName;
    this.tabMapping.forEach((value: workListTab, key: number) => {
      if (tab == value) {
        this.tabIndex = key;
      }
    })

    if (this.route.snapshot.data['ref_data']) {
      let refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('REQUEST', refData);
    }

    if (this.route.snapshot.data['data']) {
      this.workItemList = this.route.snapshot.data['data'] as PaginateWorkDetail;
      this.itemLengthSubs.next(this.workItemList?.totalSize!);
      console.log(this.workItemList)
      this.showWorkList(false);
    }
  }



  protected tabChanged(index: number) {
    this.tabIndex = index;
    this.pageNumber = WorkListDefaultValue.pageNumber;
    this.pageSize = WorkListDefaultValue.pageSize;
    this.fetchDetails();

  }
  private fetchDetails() {
    if (this.tabMapping[this.tabIndex] == 'pending_worklist') {
      this.requestService.findMyWorkList(false).subscribe(s => {
        this.workItemList = s!;
        this.itemLengthSubs.next(this.workItemList?.totalSize!);
        this.showWorkList(false);
      })
    } else if (this.tabMapping[this.tabIndex] == 'completed_worklist') {
      this.requestService.findMyWorkList(true).subscribe(s => {
        this.workItemList = s!;
        this.itemLengthSubs.next(this.workItemList?.totalSize!);
        this.showWorkList(true);
      })
    }
  }

  private showWorkList(completed: boolean) {
    let headers = [
      {
        value: WorkField.workId,
        rounded: true
      },
      {
        value: WorkField.workType,
        rounded: true
      },
      {
        value: WorkField.requestId,
        rounded: true
      },
      {
        value: completed ? WorkField.completedOn : WorkField.pendingSince,
        rounded: true
      }
    ]
    let content = this.workItemList.content?.map(m => {
      let cells = [
        {
          type: 'text',
          value: new String(m.id).substring(m.id?.length! - 5),
          bgColor: 'bg-purple-200'
        },
        {
          type: 'text',
          value: m.workType
        },
        {
          type: 'text',
          value: m.workflowId
        },
        {
          type: 'text',
          value: date(completed ? m.decisionDate : m.createdOn)
        }
      ] as AccordionCell[];

      return {
        columns: cells,
        detailed: [
          {
            section_name: 'Work Details',
            section_type: 'key_value',
            section_html_id:'work_detail',
            section_form: this.workItemForm,
            content: [
              {
                field_name: 'Work Id',
                field_value: m.id
              },
              {
                field_name: 'Work Type',
                field_value: m.workType
              },
              {
                field_name: 'Work Description',
                field_value: m.description,
              },
              {
                field_name: 'Creation Date',
                field_value: date(m.createdOn)
              },
              {
                field_name: 'Decision',
                field_value: m.decision,
                hide_field: !completed
              },
              {
                field_name: 'Decision Owner',
                field_value: m.decisionOwner?.fullName,
                hide_field: !completed
              },
              {
                field_name: 'Decision Date',
                field_value: date(m.decisionDate),
                hide_field: !completed
              },
              {
                field_name: 'Remarks',
                field_html_id:'remarks',
                field_value: m.remarks,
                hide_field: !completed,
                editable:true,
                form_input:{
                  tagName:'textarea',
                  inputType:'',
                  placeholder:'Ex. Remarks',
                  }
              },

            ]
          }
        ],
        buttons: completed ? [] : [
          {
            button_id: 'APPROVE',
            button_name: 'Approve'
          },
          {
            button_id: 'DECLINE',
            button_name: 'Decline'
          }
        ]
      } as AccordionRow;
    })
    this.accordionList = {
      headers: headers,
      contents: content!,
    }



  }
  override handlePageEvent($event: PageEvent): void {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.fetchDetails();
  }

  onClick($event: { buttonId: string; rowIndex: number; }) {
    let item = this.workItemList.content![$event.rowIndex];
    let index=this.accordionList.contents[$event.rowIndex].detailed.findIndex(f=>f.section_html_id == 'work_detail');
    // this.accordionList.contents[$event.rowIndex].detailed.filter(f=>f.section_html_id=='work_detail').map(m=>{
    //   m.show_form=true;
    //   m.content?.filter(f=>f.field_html_id == 'remarks').map(m=>{
    //     m.hide_field=false;
    //     return m;
    //   })
    //   return m;
    // })

    this.requestService.updateDecision(item.id!, $event.buttonId == 'APPROVE'?1:0 , "ok").subscribe(data => {
      console.log(data)
    })

  }

  accordionOpened($event: { rowIndex: number; }) {
    let item = this.workItemList.content![$event.rowIndex];
    this.requestService.getRequestDetail(item.workflowId!).subscribe(request=>{
      let index = this.accordionList.contents[$event.rowIndex].detailed.findIndex(f => f.section_html_id == 'request_detail');
      let request_detail={
        section_name: 'Request Details',
        section_type: 'key_value',
        section_html_id: 'request_detail',
        section_form: new FormGroup({}),
        content: [
          {
            field_name: 'Request Id',
            field_value: request?.id,
          },
          {
            field_name: 'Request Type',
            field_value: request?.type,
          },
          {
            field_name: 'Request Status',
            field_value: request?.status,
          },
          {
            field_name: 'Requester Name',
            field_value: request?.requester?.fullName,
          }
        ]
      } as DetailedView;
      if (index == -1) {
        this.accordionList.contents[$event.rowIndex].detailed.push(request_detail);
      }else{
        this.accordionList.contents[$event.rowIndex].detailed[index]=request_detail;
      }
      let indexAddDet = this.accordionList.contents[$event.rowIndex].detailed.findIndex(f => f.section_html_id == 'request_add_detail');
      let additional_content=request?.additionalFields?.map(m=>{
        return {
          field_name: m.name,
          field_value: m.value,
        } as DetailedViewField;
      })
      
      let request_add_detail={
        section_name: 'Request Additional Details',
        section_type: 'key_value',
        section_html_id: 'request_add_detail',
        section_form: new FormGroup({}),
        content: additional_content
      } as DetailedView;

      if (indexAddDet == -1) {
        this.accordionList.contents[$event.rowIndex].detailed.push(request_add_detail);
      }else{
        this.accordionList.contents[$event.rowIndex].detailed[indexAddDet]=request_add_detail;
      }
    })
  
    // 
  }
}
