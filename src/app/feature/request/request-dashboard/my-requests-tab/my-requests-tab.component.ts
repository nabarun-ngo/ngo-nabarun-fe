import { Component, EventEmitter } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators } from '@angular/forms';
import { RequestDetail, KeyValue, UserDetail, AdditionalField, WorkDetail, PaginateRequestDetail, RequestType } from 'src/app/core/api/models';
import {
  AccordionCell,
  AccordionButton,
} from 'src/app/shared/model/accordion-list.model';
import { DetailedView, DetailedViewField } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { RequestConstant, RequestDefaultValue, RequestField } from '../../request.const';
import { RequestService } from '../../request.service';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { getRequestAdditionalDetailSection, getRequestDetailSection, getWorkActionDetailSection, getWorkDetailSection } from '../../request.field';
import { date } from 'src/app/core/service/utilities.service';
import { filterFormChange } from 'src/app/core/service/form.service';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';

@Component({
  selector: 'app-my-requests-tab',
  templateUrl: './my-requests-tab.component.html',
  styleUrls: ['./my-requests-tab.component.scss'],
})
export class MyRequestsTabComponent extends Accordion<RequestDetail> implements TabComponentInterface<PaginateRequestDetail> {

  protected userList: UserDetail[] | undefined;
  protected isDelegatedRequest: boolean = false; // Track if creating delegated request

  constructor(
    protected route: ActivatedRoute,
    protected requestService: RequestService,
    protected router: Router,
    protected modalService: ModalService
  ) {
    super();
  }

  onSearch($event: SearchEvent): void {
    if ($event.advancedSearch && !$event.reset) {
      this.requestService
        .findRequests(false, RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
        .subscribe((s) => {
          this.setContent(s?.content!, s?.totalSize);
        });
    } else if ($event.advancedSearch && $event.reset) {
      console.log('Resetting search');
      this.loadData();
    }
  }

  loadData(): void {
    this.requestService
      .findRequests(false, RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
      .subscribe((s) => {
        this.setContent(s?.content!, s?.totalSize);
      });
  }

  override ngOnInit(): void {
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
        value: RequestField.requestStatus,
        rounded: true
      },
      {
        value: RequestField.requestedOn,
        rounded: true
      }
    ]);
    this.init(
      RequestDefaultValue.pageNumber,
      RequestDefaultValue.pageSize,
      RequestDefaultValue.pageSizeOptions
    );
  }

  protected override prepareHighLevelView(
    data: RequestDetail,
    options?: { [key: string]: any }
  ): AccordionCell[] {
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
        value: data.status!,
        showDisplayValue: true,
        refDataSection: RequestConstant.refDataKey.workflowSteps
      },
      {
        type: 'text',
        value: date(data.createdOn!)
      }
    ];
  }

  protected override prepareDetailedView(
    data: RequestDetail,
    options?: { [key: string]: any }
  ): DetailedView[] {
    if (options?.['create']) {
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
                selectList: this.getFilteredWorkflowTypes()
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
      ];
    }
    return [
      getRequestDetailSection(data!),
      getRequestAdditionalDetailSection(data!)
    ];
  }

  protected override prepareDefaultButtons(
    data: RequestDetail,
    options?: { [key: string]: any }
  ): AccordionButton[] {
    if (options && options['create']) {
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
    ];
  }

  protected override onClick(event: {
    buttonId: string;
    rowIndex: number;
  }): void {
    switch (event.buttonId) {
      case 'CREATE':
        this.performCreateRequest();
        break;
      case 'CANCEL_CREATE':
        this.hideForm(0, true);
        break;
      case 'WITHDRAW':
        this.performWithdrawRequest(event.rowIndex);
        break;
    }
  }

  private performCreateRequest() {
    let request_form = this.getSectionForm('request_detail_create', 0, true);
    let request_addnl_form = this.getSectionForm('request_detail_addnl', 0, true);
    if (request_form?.valid && request_addnl_form?.valid) {
      let additionalFields: AdditionalField[] = [];
      Object.keys(request_addnl_form.value).forEach(key => {
        additionalFields?.push({
          key: key as any,
          value: request_addnl_form!.value[key]
        });
      });
      let request: RequestDetail = {
        type: request_form?.value.requestType,
        description: request_form?.value.description,
        delegated: this.isDelegatedRequest,
        requester: (this.isDelegatedRequest && request_form?.value.requestType !== 'JOIN_REQUEST_USER') ?
          this.userList?.find(f => f.id == request_form?.value.delegation_user) : undefined,
        additionalFields: additionalFields,
      };
      this.requestService.createRequest(request).subscribe(s => {
        this.hideForm(0, true);
        this.addContentRow(s!, true);
      });
    } else {
      request_form?.markAllAsTouched();
      request_addnl_form?.markAllAsTouched();
    }
  }

  private performWithdrawRequest(rowIndex: number) {
    let decision = this.modalService.openNotificationModal(
      AppDialog.warn_confirm_withdraw,
      'confirmation',
      'warning'
    );
    decision.onAccept$.subscribe(d => {
      this.requestService.withdrawRequest(this.itemList[rowIndex].id!).subscribe(d => {
        this.removeContentRow(rowIndex);
      });
    });
  }

  protected override onAccordionOpen(event: { rowIndex: number }): void {
    let item = this.itemList[event.rowIndex];
    this.requestService.getWorkDetails(item.id!).subscribe(s => {
      // Create a nested accordion for work details
      let workAccordion = new class extends Accordion<WorkDetail> {
        override ngOnInit(): void { }
        protected override onClick(event: { buttonId: string; rowIndex: number; }): void { }
        protected override onAccordionOpen(event: { rowIndex: number; }): void { }

        prepareHighLevelView(item: WorkDetail, options?: { [key: string]: any }): AccordionCell[] {
          return [
            {
              type: 'text',
              value: item?.id!,
              bgColor: 'bg-purple-200'
            },
            {
              type: 'text',
              value: item?.workType!
            },
            {
              type: 'text',
              value: item?.stepCompleted ? 'Completed' : 'Pending'
            }
          ];
        }

        prepareDetailedView(data: WorkDetail, options?: { [key: string]: any }): DetailedView[] {
          return data.stepCompleted ? [
            getWorkDetailSection(data, 'completed_worklist'),
            getWorkActionDetailSection(data)
          ] : [
            getWorkDetailSection(data, 'pending_worklist')
          ];
        }

        prepareDefaultButtons(data: WorkDetail, options?: { [key: string]: any }): AccordionButton[] {
          return [];
        }

        handlePageEvent($event: PageEvent): void { }
      }();

      // Set up the nested accordion
      workAccordion.setRefData(this.getRefData()!);
      workAccordion.setHeaderRow([
        {
          value: 'Work Id',
          rounded: true
        },
        {
          value: 'Work Type',
          rounded: true
        },
        {
          value: 'Status',
          rounded: true
        }
      ]);

      // Set the content
      workAccordion.setContent(s!, s?.length);

      // Add the section with properly initialized accordion
      this.addSectionInAccordion({
        section_name: 'Work Detail',
        section_type: 'accordion_list',
        section_html_id: 'task_list',
        section_form: new FormGroup({}),
        accordionList: workAccordion.getAccordionList(),
        accordion: {
          object: workAccordion,
          accordionOpened: new EventEmitter<{ rowIndex: number }>(),
          buttonClick: new EventEmitter<{ buttonId: string; rowIndex: number }>()
        }
      }, event.rowIndex);
    });
  }

  override handlePageEvent($event: PageEvent): void {
    this.requestService
      .findRequests(false, $event.pageIndex, $event.pageSize)
      .subscribe((data) => {
        this.setContent(data?.content!, data?.totalSize);
      });
  }

  /**
 * Get filtered workflow types excluding JOIN_REQUEST_USER for My Requests tab
 */
  protected getFilteredWorkflowTypes(): KeyValue[] {
    const allTypes = this.getRefData()?.['visibleWorkflowTypes'] || [];
    return allTypes.filter((type: KeyValue) => type.key !== RequestType.JoinRequestUser);
  }

  initCreateRequestForm(isDelegated: boolean = false) {
    this.isDelegatedRequest = isDelegated;
    this.showCreateForm({});
    let request_create_form = this.getSectionForm('request_detail_create', 0, true);
    request_create_form?.valueChanges.pipe(filterFormChange(request_create_form.value))
      .subscribe((val) => {
        if (val['requestType']) {
          this.handleRequestTypeChange(val);
        }
      });
  }

  private handleRequestTypeChange(val: any) {
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
      });
      this.addSectionInAccordion({
        section_name: 'Additional Request Detail',
        section_type: 'key_value',
        section_html_id: 'request_detail_addnl',
        section_form: new FormGroup({}),
        show_form: true,
        content: addnl_fields
      }, 0, true);
    });
    // Handle delegation field - automatically setup based on context
    if (this.isDelegatedRequest) {
      if (val['requestType'] !== 'JOIN_REQUEST_USER') {
        // Show requester dropdown for regular delegated requests
        this.handleDelegationChange({});
      } else {
        // Remove requester dropdown for JOIN_REQUEST_USER since it's for joining users
        this.removeSectionField('request_detail_create', 'delegation_user', 0, true);
      }
    }
  }


  private handleDelegationChange(val: any) {
    let requestForm = this.getSectionForm('request_detail_create', 0, true);
    this.requestService.getUsers().subscribe(data => {
      this.userList = data?.content;
      let delegatedRequester: KeyValue[] = [];
      data?.content?.forEach(m => {
        delegatedRequester.push({ key: m.id, displayValue: m.fullName });
      });

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
          autocomplete: true,
          selectList: delegatedRequester
        },
        form_input_validation: [Validators.required]
      }, 0, true);
    });
  }
}
