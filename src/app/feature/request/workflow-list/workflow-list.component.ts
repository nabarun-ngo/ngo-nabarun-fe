import { Component, ElementRef, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Paginator } from 'src/app/core/component/paginator';
import { AccordionCell, AccordionList, AccordionRow } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { PaginateWorkDetail } from 'src/app/core/api/models';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from '../request.service';
import { PageEvent } from '@angular/material/paginator';
import { FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { date } from 'src/app/core/service/utilities.service';
import { DetailedView, DetailedViewField } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { ModalService } from 'src/app/core/service/modal.service';
import { scrollToFirstInvalidControl } from 'src/app/core/service/form.service';
import { workListTab } from '../../task/task.const';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';

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

  private cancel_button = {
    button_id: 'CANCEL',
    button_name: 'Cancel'
  };
  private update_button = {
    button_id: 'UPDATE',
    button_name: 'Update'
  };
  private confirm_button = {
    button_id: 'CONFIRM',
    button_name: 'Confirm'
  };
  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private requestService: RequestService,
    private el: ElementRef,
  ) {
    super();
    //super.init(WorkListDefaultValue.pageNumber, WorkListDefaultValue.pageSize, WorkListDefaultValue.pageSizeOptions)
  }

  ngOnInit(): void {
   // this.sharedDataService.setPageName(WorkListDefaultValue.pageTitle);

    // let tab = this.route.snapshot.data["tab"] ? this.route.snapshot.data["tab"] as workListTab : WorkListDefaultValue.tabName;
    // this.tabMapping.forEach((value: workListTab, key: number) => {
    //   if (tab == value) {
    //     this.tabIndex = key;
    //   }
    // })

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
    //this.pageNumber = WorkListDefaultValue.pageNumber;
   // this.pageSize = WorkListDefaultValue.pageSize;
    this.fetchDetails();

  }
  private fetchDetails() {
    // if (this.tabMapping[this.tabIndex] == 'pending_worklist') {
    //   this.requestService.findMyWorkList(false).subscribe(s => {
    //     this.workItemList = s!;
    //     this.itemLengthSubs.next(this.workItemList?.totalSize!);
    //     this.showWorkList(false);
    //   })
    // } else if (this.tabMapping[this.tabIndex] == 'completed_worklist') {
    //   this.requestService.findMyWorkList(true).subscribe(s => {
    //     this.workItemList = s!;
    //     this.itemLengthSubs.next(this.workItemList?.totalSize!);
    //     this.showWorkList(true);
    //   })
    // }
  }

  private showWorkList(completed: boolean) {
    // let headers = [
    //   {
    //     value: WorkField.workId,
    //     rounded: true
    //   },
    //   {
    //     value: WorkField.workType,
    //     rounded: true
    //   },
    //   {
    //     value: WorkField.requestId,
    //     rounded: true
    //   },
    //   {
    //     value: completed ? WorkField.completedOn : WorkField.pendingSince,
    //     rounded: true
    //   }
    // ]
    let content = this.workItemList.content?.map(m => {
      let column_data = [
        {
          type: 'text',
          value: m.id,
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
        columns: column_data,
        detailed: [
          {
            section_name: 'Work Details',
            section_type: 'key_value',
            section_html_id: 'work_detail',
            section_form:new FormGroup({}),
            content: [
              {
                field_name: 'Work Id',
                field_html_id: 'work_id',
                field_value: m.id
              },
              {
                field_name: 'Work Type',
                field_html_id: 'work_type',
                field_value: m.workType
              },
              {
                field_name: 'Work Description',
                field_html_id: 'work_description',
                field_value: m.description,
              },
              {
                field_name: 'Creation Date',
                field_html_id: 'creation_date',
                field_value: date(m.createdOn)
              },
              // {
              //   field_name: 'Decision',
              //   field_html_id: 'decision',
              //   field_value: m.decision,
              //   hide_field: !completed,
              //   form_control_name: 'decision',
              //   editable: true,
              //   form_input: {
              //     tagName: 'select',
              //     inputType: '',
              //     placeholder: 'Ex. Approve',
              //     selectList: [{ key: 'APPROVE', displayValue: 'Approve' }, { key: 'DECLINE', displayValue: 'Decline' }]
              //   },
              //   form_input_validation:[Validators.required]
              // },
              {
                field_name: 'Decision Owner',
                field_html_id: 'decision_owner',
                field_value: m.decisionOwner?.fullName,
                hide_field: !completed
              },
              {
                field_name: 'Decision Date',
                field_html_id: 'decision_date',
                field_value: date(m.decisionDate),
                hide_field: !completed,
              },
              // {
              //   field_name: 'Remarks',
              //   field_html_id: 'remarks',
              //   field_value: m.remarks,
              //   hide_field: !completed,
              //   form_control_name: 'remarks',
              //   editable: true,
              //   form_input: {
              //     tagName: 'input',
              //     inputType: 'text',
              //     placeholder: 'Ex. Remarks',
              //   },
              //   form_input_validation:[Validators.required]
              // },

            ]
          }
        ],
        buttons: completed ? [] : [
          this.update_button
        ]
      } as AccordionRow;
    })
    // this.accordionList = {
    //   headers: headers,
    //   contents: content!,
    // }



  }
  override handlePageEvent($event: PageEvent): void {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.fetchDetails();
  }

  onClick($event: { buttonId: string; rowIndex: number; }) {
    switch ($event.buttonId) {
      case 'UPDATE':
        this.accordionList.contents[$event.rowIndex].detailed.filter(f => f.section_html_id == 'work_detail').map(m => {
          console.log(m)
          m.show_form = true;
          m.content?.filter(f => ['remarks', 'decision'].includes(f.field_html_id!)).map(m => {
            m.hide_field = false;
            return m;
          })
          return m;
        });
        let index = this.accordionList.contents[$event.rowIndex].buttons?.findIndex(f => f.button_id == this.update_button.button_id);
        this.accordionList.contents[$event.rowIndex].buttons?.splice(index!, 1)
        this.accordionList.contents[$event.rowIndex].buttons?.push(this.cancel_button)
        this.accordionList.contents[$event.rowIndex].buttons?.push(this.confirm_button)
        break;
      case 'CONFIRM':
        let item = this.workItemList.content![$event.rowIndex];
        let content = this.accordionList.contents[$event.rowIndex].detailed.find(f => f.section_html_id == 'work_detail');
        if (content?.section_form?.valid) {
          // this.requestService.updateWorkItem(item.id!, content?.section_form.value).subscribe(data => {
          //   //console.log(data)
          //   this.fetchDetails();
          //   // this.cancelOption($event.rowIndex);
          //   // if(data?.stepCompleted){
          //      //this.workItemList.content?.splice($event.rowIndex,1);
          //     // console.log(this.workItemList.content)
          //   // }else{
          //   //   this.workItemList.content![$event.rowIndex]=data!;
          //   // }
          // })
        } else {
          content?.section_form?.markAllAsTouched();
          scrollToFirstInvalidControl(this.el.nativeElement);
        }
        break;
      case 'CANCEL':
        this.cancelOption($event.rowIndex);
        break;
    }

  }
  cancelOption(rowIndex: number) {
    this.accordionList.contents[rowIndex].detailed.filter(f => f.section_html_id == 'work_detail').map(m => {
      m.show_form = false;
      m.section_form?.reset();
      return m;
    });
    let confirm_btn_index = this.accordionList.contents[rowIndex].buttons?.findIndex(f => f.button_id == this.confirm_button.button_id);
    this.accordionList.contents[rowIndex].buttons?.splice(confirm_btn_index!, 1)
    let cancel_btn_index = this.accordionList.contents[rowIndex].buttons?.findIndex(f => f.button_id == this.cancel_button.button_id);
    this.accordionList.contents[rowIndex].buttons?.splice(cancel_btn_index!, 1)
    this.accordionList.contents[rowIndex].buttons?.push(this.update_button)
  }

  accordionOpened($event: { rowIndex: number; }) {
    let item = this.workItemList.content![$event.rowIndex];
    
    this.addRequestDetails(item.workflowId!,$event.rowIndex);
  
  }
  addRequestDetails(id: string,rowIndex:number) {
    // this.requestService.getRequestDetail(id).subscribe(request => {

    //   /**
    //    * Inserting request additional details at top
    //    */

    //   let additional_content = request?.additionalFields?.map(m => {
    //     return {
    //       field_name: m.name,
    //       field_value: m.value,
    //     } as DetailedViewField;
    //   })

    //   let request_add_detail = {
    //     section_name: 'Request Additional Details',
    //     section_type: 'key_value',
    //     section_html_id: 'request_add_detail',
    //     section_form: new FormGroup({}),
    //     content: additional_content
    //   } as DetailedView;

    //   let indexAddDet = this.accordionList.contents[rowIndex].detailed.findIndex(f => f.section_html_id == 'request_add_detail');
    //   if (indexAddDet == -1) {
    //     this.accordionList.contents[rowIndex].detailed.push(request_add_detail);
    //   } else {
    //     this.accordionList.contents[rowIndex].detailed[indexAddDet] = request_add_detail;
    //   }

    //   /**
    //    * Inserting request details at top
    //    */
    //   let request_detail = {
    //     section_name: 'Request Details',
    //     section_type: 'key_value',
    //     section_html_id: 'request_detail',
    //     section_form: new FormGroup({}),//Here you have to pass form group
    //     content: [
    //       {
    //         field_name: 'Request Id',
    //         field_value: request?.id,
    //       },
    //       {
    //         field_name: 'Request Type',
    //         field_value: request?.type,
    //       },
    //       {
    //         field_name: 'Request Status',
    //         field_value: request?.status,
    //       },
    //       {
    //         field_name: 'Requester Name',
    //         field_value: request?.requester?.fullName,
    //       }
    //     ]
    //   } as DetailedView;
    //   let index = this.accordionList.contents[rowIndex].detailed.findIndex(f => f.section_html_id == 'request_detail');
    //   if (index == -1) {
    //     this.accordionList.contents[rowIndex].detailed.push(request_detail);
    //   } else {
    //     this.accordionList.contents[rowIndex].detailed[index] = request_detail;
    //   }
    // })
  }
}
