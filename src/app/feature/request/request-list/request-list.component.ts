import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Paginator } from 'src/app/shared/model/paginator';
import { RequestConstant, RequestDefaultValue, RequestField, requestTab, TaskField } from '../request.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from '../request.service';
import { AdditionalField, KeyValue, PaginateRequestDetail, RequestDetail, RequestType, UserDetail, WorkDetail } from 'src/app/core/api/models';
import { AccordionButton, AccordionCell, AccordionList, AccordionRow } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { FormGroup, Validators } from '@angular/forms';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
import { DetailedView, DetailedViewField } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { filterFormChange, scrollToFirstInvalidControl } from 'src/app/core/service/form.service';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppAlert } from 'src/app/core/constant/app-alert.const';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { getRequestAdditionalDetailSection, getRequestDetailSection, getWorkActionDetailSection, getWorkDetailSection } from '../request.field';
import { date } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.scss']
})
export class RequestListComponent extends Accordion<RequestDetail> implements OnInit {


  protected tabIndex!: number;
  protected tabMapping: requestTab[] = ['self_request', 'delegated_request'];
  protected requestList!: PaginateRequestDetail;

  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  refData: { [name: string]: KeyValue[]; } | undefined;
  actionName!: string;
  userList: UserDetail[] | undefined;

  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private requestService: RequestService,
    private alertService: ModalService

  ) {
    super();
    super.init(RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize, RequestDefaultValue.pageSizeOptions)
  }

  ngOnInit(): void {
    this.sharedDataService.setPageName(RequestDefaultValue.pageTitle);

    let tab = this.route.snapshot.data["tab"] ? this.route.snapshot.data["tab"] as requestTab : RequestDefaultValue.tabName;
    this.tabMapping.forEach((value: requestTab, key: number) => {
      if (tab == value) {
        this.tabIndex = key;
      }
    })

    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('REQUEST', this.refData!);
      this.setRefData(this.refData)
    }
    this.setAccordionHeader();
    if (this.route.snapshot.data['data']) {
      this.requestList = this.route.snapshot.data['data'] as PaginateRequestDetail;
      this.setContent(this.requestList.content!, this.requestList.totalSize)
    }
  }
  setAccordionHeader() {
    this.setHeaderRow([
      {
        value: RequestField.requestId,
        rounded: true
      },
      {
        value: RequestField.requestType,
        rounded: true
      },
      {
        value: this.tabMapping[this.tabIndex] == 'delegated_request' ? RequestField.requesterName : RequestField.requestStatus,
        rounded: true
      },
      {
        value: this.tabMapping[this.tabIndex] == 'delegated_request' ? RequestField.requestStatus : RequestField.requestedOn,
        rounded: true
      }

    ])
  }

  protected override prepareHighLevelView(data: RequestDetail, options?: { [key: string]: any; }): AccordionCell[] {
    return [
      {
        type: 'text',
        value: data.id!,
        bgColor: 'bg-purple-200'
      },
      {
        type: 'text',
        value: data.type!,
        showDisplayValue: true,
        refDataSection: RequestConstant.refDataKey.workflowTypes
      },
      {
        type: 'text',
        value: this.tabMapping[this.tabIndex] == 'delegated_request' ? data.requester?.fullName! : data.status!,
        showDisplayValue: this.tabMapping[this.tabIndex] != 'delegated_request',
        refDataSection: RequestConstant.refDataKey.workflowSteps
      },
      { 
        type: 'text',
        value: this.tabMapping[this.tabIndex] == 'delegated_request' ? data.status! : date(data.createdOn!),
        showDisplayValue: this.tabMapping[this.tabIndex] == 'delegated_request',
        refDataSection: RequestConstant.refDataKey.workflowSteps
      }
    ]
  }
  protected override prepareDetailedView(data: RequestDetail, options?: { [key: string]: any; create: boolean }): DetailedView[] {
    if (options?.create) {
      return [
        {
          section_name: 'Request Detail',
          section_type: 'key_value',
          section_html_id: 'request_detail_create',
          section_form: new FormGroup({}),
          content: [
            {
              field_name: 'Request Type',
              field_value: data.type!,
              editable: true,
              field_html_id: 'request_type',
              form_control_name: 'requestType',
              form_input: {
                html_id: 'requestType',
                tagName: 'select',
                inputType: '',
                placeholder: 'Select Request type',
                selectList: this.refData!['visibleWorkflowTypes']
              },
              form_input_validation: [Validators.required]
            },
            {
              field_name: 'Request Description',
              field_value: data.description!,
              editable: true,
              field_html_id: 'request_desc',
              form_control_name: 'description',
              form_input: {
                html_id: 'description',
                tagName: 'textarea',
                inputType: '',
                placeholder: 'Enter Description',
              },
              form_input_validation: [Validators.required]
            },
          ]
        }
      ]
    }
    return [
      getRequestDetailSection(data!),
      getRequestAdditionalDetailSection(data!)
    ]
  }
  protected override prepareDefaultButtons(data: RequestDetail, options?: { [key: string]: any; create: boolean }): AccordionButton[] {
    if (options && options.create) {
      return [
        {
          button_id: 'CANCEL_CREATE',
          button_name: 'Cancel'
        },
        {
          button_id: 'CREATE',
          button_name: 'Create'
        }
      ];
    }
    return [
      {
        button_id: 'WITHDRAW',
        button_name: 'Withdraw'
      }
    ]

    //return [];
  }

  protected tabChanged(index: number) {
    this.tabIndex = index;
    this.pageNumber = RequestDefaultValue.pageNumber;
    this.pageSize = RequestDefaultValue.pageSize;
    this.fetchDetails();
    this.setAccordionHeader();
    this.hideForm(0, true);
  }

  private fetchDetails() {
    if (this.tabMapping[this.tabIndex] == 'self_request') {
      this.requestService.findRequests(false).subscribe(s => {
        this.requestList = s!;
        this.setContent(this.requestList.content!, this.requestList?.totalSize!);
      })
    } else if (this.tabMapping[this.tabIndex] == 'delegated_request') {
      this.requestService.findRequests(true).subscribe(s => {
        this.requestList = s!;
        this.setContent(this.requestList.content!, this.requestList?.totalSize!);
      })
    }
  }


  override handlePageEvent($event: PageEvent): void {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.fetchDetails();
  }

  createRequest() {
    this.showCreateForm({})
    let request_create_form = this.getSectionForm('request_detail_create', 0, true);
    request_create_form?.valueChanges.pipe(filterFormChange(request_create_form.value))
      .subscribe((val) => {
        console.log(val['requestType'])
        if (val['requestType']) {
          this.removeSectionInAccordion('request_detail_addnl', 0, true);
          this.requestService.findRefField(val['requestType']).subscribe(data => {
            let addnl_fields = data?.map(m1 => {
              return {
                field_name: m1.name!,
                field_html_id: m1.key + '_' + m1.name! + '_' + m1.id!,
                field_value: m1.value!,
                hide_field: false,
                form_control_name: m1.key,
                editable: true,
                form_input: {
                  html_id: m1.key!,
                  tagName: m1.type as any,
                  inputType: m1.valueType as any,
                  placeholder: m1.name!,
                  selectList: m1.options?.map(o => {
                    return { key: o, displayValue: o };
                  })
                },
                form_input_validation: m1.mandatory ? [Validators.required] : []
              } as DetailedViewField;
            })
            this.addSectionInAccordion({
              section_name: 'Additional Request Detail',
              section_type: 'key_value',
              section_html_id: 'request_detail_addnl',
              section_form: new FormGroup({}),
              show_form: true,
              content: addnl_fields
            }, 0, true);
          });
          this.getSectionForm('request_detail_create', 0, true)?.get('isDelegated')?.reset()
          this.removeSectionField('request_detail_create', 'delegation_user', 0, true);
          this.addSectionField('request_detail_create', {
            field_name: 'Are you creating this request for someone else?',
            field_value: '',
            editable: true,
            field_html_id: 'request_delegation',
            form_control_name: 'isDelegated',
            form_input: {
              html_id: 'isDelegated',
              tagName: 'input',
              inputType: 'radio',
              placeholder: '',
              selectList: RequestType.JoinRequestUser == val['requestType'] ?
                [{ key: 'YES', displayValue: 'Yes' }] :
                [{ key: 'YES', displayValue: 'Yes' }, { key: 'NO', displayValue: 'No' }]
            },
            form_input_validation: [Validators.required]
          }, 0, true);
        }

        if (val['isDelegated'] == 'YES') {
          let requestForm = this.getSectionForm('request_detail_create', 0, true);
          //console.log(requestForm?.get('requestType')?.value)
          if (requestForm?.get('requestType')?.value != RequestType.JoinRequestUser) {
            this.requestService.getUsers().subscribe(data => {
              this.userList=data?.content;
              let delegatedRequester: KeyValue[] = []
              data?.content?.forEach(m => {
                delegatedRequester.push({ key: m.id, displayValue: m.fullName })
              })

              this.addSectionField('request_detail_create', {
                field_name: 'Requesting for',
                field_value: '',
                editable: true,
                field_html_id: 'delegation_user',
                form_control_name: 'delegation_user',
                form_input: {
                  html_id: 'del_user',
                  tagName: 'input',
                  inputType: 'text',
                  placeholder: 'Select user',
                  autocomplete:true,
                  selectList: delegatedRequester
                },
                form_input_validation: [Validators.required]
              }, 0, true)
            });
          }

        } else if (val['isDelegated'] == 'NO') {
          this.removeSectionField('request_detail_create', 'delegation_user', 0, true);
        }
      });
  }


  onClick($event: { buttonId: string; rowIndex: number; }) {
    switch ($event.buttonId) {
      case 'CREATE':
        let request_form = this.getSectionForm('request_detail_create', 0, true);
        let request_addnl_form = this.getSectionForm('request_detail_addnl', 0, true);
        if (request_form?.valid && request_addnl_form?.valid) {
          //console.log(request_form.value, request_addnl_form.value)
          let additionalFields: AdditionalField[] = [];
          Object.keys(request_addnl_form.value).forEach(key => {
            additionalFields?.push({
              key: key as any,
              value: request_addnl_form!.value[key]
            })
          })
          let request: RequestDetail = {
            type: request_form?.value.requestType,
            description: request_form?.value.description,
            delegated: request_form?.value.isDelegated === 'YES' ? true : false,
            requester: request_form?.value.isDelegated === 'YES' ? this.userList?.find(f=>f.id == request_form?.value.delegation_user) : undefined,
            additionalFields: additionalFields,
          };
          this.requestService.createRequest(request).subscribe(s => {
            this.hideForm(0, true)
            this.fetchDetails()
          });
        } else {
          request_form?.markAllAsTouched();
          request_addnl_form?.markAllAsTouched();
        }
        break;
      case 'CANCEL_CREATE':
        this.hideForm(0, true);
        break;
      case 'WITHDRAW':
        let decision=this.alertService.openNotificationModal(AppDialog.warn_confirm_withdraw,'confirmation','warning');
        decision.onAccept$.subscribe(d=>{
          this.requestService.withdrawRequest(this.requestList.content![$event.rowIndex].id!).subscribe(d=>{
            this.fetchDetails()
          })
        })
        break;
    }
  }


  protected override onAccordionOpen($event: { rowIndex: number; }) {
    let item = this.requestList.content![$event.rowIndex];
    let accordion = new class extends Accordion<WorkDetail> {
      protected override onClick(event: { buttonId: string; rowIndex: number; }): void {
      }
      protected override onAccordionOpen(event: { rowIndex: number; }): void {
      }
      prepareHighLevelView(item: WorkDetail, options?: { [key: string]: any }): AccordionCell[] {
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
            value: item?.stepCompleted ? 'Completed' : 'Pending',
          }
        ]
      }
      prepareDetailedView(data: WorkDetail, options?: { [key: string]: any }): DetailedView[] {
        return data.stepCompleted  ? [
          getWorkDetailSection(data, 'completed_worklist'),
          getWorkActionDetailSection(data)
        ]:
        [          
          getWorkDetailSection(data, 'pending_worklist'),
        ]
      }
      prepareDefaultButtons(data: WorkDetail, options?: { [key: string]: any }): AccordionButton[] {
        return []
      }
      handlePageEvent($event: PageEvent): void {

      }
    }();
    accordion.setRefData(this.refData)
    accordion.setHeaderRow([
      {
        value: TaskField.workId,
        rounded: true
      },
      {
        value: TaskField.workType,
        rounded: true
      },
      {
        value: 'Status',
        rounded: true
      }
    ])

    this.requestService.getWorkDetails(item.id!).subscribe(s => {
      accordion.setContent(s!, s?.length)
      this.addSectionInAccordion({
        section_name: 'Work Detail',
        section_type: 'accordion_list',
        section_html_id: 'task_list',
        section_form: new FormGroup({}),
        accordionList: accordion.getAccordionList()
      }, $event.rowIndex)
    })
  }

}





