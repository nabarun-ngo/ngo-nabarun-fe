import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Paginator } from 'src/app/core/component/paginator';
import { RequestDefaultValue, RequestField, requestTab } from '../request.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from '../request.service';
import { KeyValue, PaginateRequestDetail, RequestDetail, RequestType } from 'src/app/core/api/models';
import { AccordionButton, AccordionCell, AccordionList, AccordionRow } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { FormGroup, Validators } from '@angular/forms';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { Accordion } from 'src/app/shared/components/generic/accordion-list/accordion';
import { DetailedView, DetailedViewField } from 'src/app/shared/components/generic/detailed-view/detailed-view.model';
import { filterFormChange } from 'src/app/core/service/form.service';
import { tr } from '@faker-js/faker/.';

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

  //protected requestForm: FormGroup = new FormGroup({});

  constructor(
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private requestService: RequestService
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
    }
    this.setAccordionHeader();
    if (this.route.snapshot.data['data']) {
      this.requestList = this.route.snapshot.data['data'] as PaginateRequestDetail;
      // this.itemLengthSubs.next(this.requestList?.totalSize!);
      // console.log(this.requestList)
      // this.loadRequests(false);
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
        value: data.type!
      },
      {
        type: 'text',
        value: this.tabMapping[this.tabIndex] == 'delegated_request' ? data.requester?.fullName! : data.status!
      },
      {
        type: 'text',
        value: this.tabMapping[this.tabIndex] == 'delegated_request' ? data.status! : data.createdOn!
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
      {
        section_name: 'Request Details',
        section_type: 'key_value',
        section_form: new FormGroup({}),
        content: [
          {
            field_name: 'Request Id',
            field_value: data.id!
          },
          {
            field_name: 'Request Type',
            field_value: data.type!
          },
          {
            field_name: 'Request Status',
            field_value: data.status!
          }
        ]
      }
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
        button_id: 'UPDATE',
        button_name: 'Update'
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
                field_html_id: m1.id!,
                field_value: m1.value!,
                hide_field: false,
                form_control_name: m1.key,
                editable: true,
                form_input: {
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
          if (val['requestType'] != RequestType.JoinRequestUser) {
            this.addSectionField('request_detail_create', {
              field_name: 'Are you creating this request for someone else?',
              field_value: '',
              editable: true,
              field_html_id: 'request_delegation',
              form_control_name: 'isDelegated',
              form_input: {
                tagName: 'input',
                inputType: 'radio',
                placeholder: '',
                selectList: [{ key: 'YES', displayValue: 'Yes' }, { key: 'NO', displayValue: 'No' }]
              },
              form_input_validation: [Validators.required]
            }, 0, true)
          } else {
            this.removeSectionField('request_detail_create', 'request_delegation', 0, true);
            this.removeSectionField('request_detail_create', 'delegation_user', 0, true);
          }
        }

        if (val['isDelegated'] == 'YES') {
          this.requestService.getUsers().subscribe(data => {
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
                tagName: 'select',
                inputType: '',
                placeholder: 'Select user',
                selectList: delegatedRequester
              },
              form_input_validation: [Validators.required]
            }, 0, true)
          });
        } else if (val['isDelegated'] == 'NO') {
          this.removeSectionField('request_detail_create', 'delegation_user', 0, true);
        }
      });
  }
}


