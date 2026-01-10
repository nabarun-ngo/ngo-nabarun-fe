import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { UserDto as UserDetail } from 'src/app/core/api-client/models';
import { PagedRequest, WorkflowRequest } from '../../model/request.model';
import { RequestType } from '../../workflow.const';
import {
  AccordionCell,
  AccordionButton,
} from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { Accordion } from 'src/app/shared/utils/accordion';
import { WorkflowConstant, RequestDefaultValue, RequestField } from '../../workflow.const';
import { ModalService } from 'src/app/core/service/modal.service';
import { AppDialog } from 'src/app/core/constant/app-dialog.const';
import { getRequestAdditionalDetailSection, getRequestDetailSection, getRequestStepsSection } from '../../fields/request.field';
import { date } from 'src/app/core/service/utilities.service';
import { filterFormChange } from 'src/app/core/service/form.service';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { RequestService } from '../../service/request.service';
import { DonationFieldVisibilityRules } from 'src/app/feature/finance/fields/donation.field';

@Component({
  selector: 'app-my-requests-tab',
  templateUrl: './my-requests-tab.component.html',
  styleUrls: ['./my-requests-tab.component.scss'],
})
export class MyRequestsTabComponent extends Accordion<WorkflowRequest> implements TabComponentInterface<PagedRequest> {

  protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    return {
      pageNumber: RequestDefaultValue.pageNumber,
      pageSize: RequestDefaultValue.pageSize,
      pageSizeOptions: RequestDefaultValue.pageSizeOptions,
    };
  }

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

  override onInitHook(): void {
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

  }

  protected override prepareHighLevelView(
    data: WorkflowRequest,
    options?: { [key: string]: any }
  ): AccordionCell[] {

    return [
      {
        type: 'text',
        value: data?.id!,
        bgColor: 'bg-purple-200'
      },
      {
        type: 'text',
        value: data?.type!,
        showDisplayValue: true,
        refDataSection: WorkflowConstant.refDataKey.workflowTypes
      },
      {
        type: 'text',
        value: data?.status!,
        showDisplayValue: true,
        refDataSection: WorkflowConstant.refDataKey.workflowStatuses
      },
      {
        type: 'text',
        value: date(data?.createdAt!)
      }
    ];
  }


  protected override prepareDetailedView(
    data: WorkflowRequest,
    options?: { [key: string]: any }
  ): DetailedView[] {
    const isCreate = options && options['create'];
    const isDelegated = options && options['forOthers'];
    return [
      getRequestDetailSection(data!, this.getRefData()!, isCreate, isDelegated),
      getRequestStepsSection(data!, this.getRefData()!, isCreate)
    ];
  }

  protected override prepareDefaultButtons(
    data: WorkflowRequest,
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

  protected override onAccordionOpen(event: { rowIndex: number }): void {
    let item = this.itemList[event.rowIndex];
    this.requestService.getAdditionalFields(item.type!).subscribe(s => {
      this.addSectionInAccordion(getRequestAdditionalDetailSection(item!, s), event.rowIndex)
    })
  }

  override handlePageEvent($event: PageEvent): void {
    this.requestService
      .findRequests('me', $event.pageIndex, $event.pageSize)
      .subscribe((data) => {
        this.setContent(data?.content!, data?.totalSize);
      });
  }


  onSearch($event: SearchEvent): void {
    if ($event.advancedSearch && !$event.reset) {
      this.requestService
        .findRequests('me', RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
        .subscribe((s) => {
          this.setContent(s?.content!, s?.totalSize);
        });
    } else if ($event.advancedSearch && $event.reset) {
      this.loadData();
    }
  }

  loadData(): void {
    this.requestService
      .findRequests('me', RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
      .subscribe((s) => {
        this.setContent(s?.content!, s?.totalSize);
      });
  }

  initCreateRequestForm(isDelegated: boolean = false) {
    this.isDelegatedRequest = isDelegated;
    this.showCreateForm();
    const form = this.getSectionForm('request_detail', 0, true);
    form?.valueChanges.pipe(filterFormChange(form.value)).subscribe((val) => {
      //console.log(val);
      if (val.requestType) {
        this.updateFieldVisibility('request_detail', 'initiatedFor', 0, val.requestType !== 'JOIN_REQUEST', true);
        this.updateFieldValidators('request_detail', 0, {
          'initiatedFor': val.requestType !== 'JOIN_REQUEST' ? [Validators.required] : [],
        }, true);
        this.requestService.getAdditionalFields(val.requestType).subscribe(s => {
          this.removeSectionInAccordion('request_data', 0, true);
          this.addSectionInAccordion(getRequestAdditionalDetailSection(undefined, s, true), 0, true)
        })
      }
    });
    if (isDelegated) {
      this.requestService.getUsers().subscribe(s => {
        const users = s.content?.map(s => {
          return {
            key: s.id,
            displayValue: s.fullName
          } as KeyValue
        })
        this.updateFieldOptions('request_detail', 0, 'initiatedFor', users!, true)
      })
    }

  }

  private performCreateRequest() {
    //console.log(this.isDelegatedRequest);
    let request_form = this.getSectionForm('request_detail', 0, true);
    let request_data_form = this.getSectionForm('request_data', 0, true);
    //console.log(request_form);
    //console.log(request_data_form);

    if (request_form?.valid && request_data_form?.valid) {
      const type = request_form?.value.requestType;
      const data = { ...request_data_form?.value };
      const requestedFor = (this.isDelegatedRequest && request_form?.value.requestType !== 'JOIN_REQUEST') ?
        request_form?.value.initiatedFor : undefined;
      const isExtUser = request_form?.value.requestType === 'JOIN_REQUEST';
      const extUserEmail = isExtUser ? data.email : undefined;
      this.requestService.createRequest(type, data, requestedFor, isExtUser, extUserEmail).subscribe(s => {
        this.hideForm(0, true);
        this.addContentRow(s!, true);
      });
    } else {
      request_form?.markAllAsTouched();
      request_data_form?.markAllAsTouched();
    }
  }


  private performWithdrawRequest(rowIndex: number) {
    let decision = this.modalService.openNotificationModal(
      AppDialog.warn_confirm_withdraw,
      'confirmation',
      'warning'
    );
    decision.onAccept$.subscribe(() => {
      this.requestService.withdrawRequest(this.itemList[rowIndex].id!).subscribe(() => {
        this.removeContentRow(rowIndex);
      });
    });

  }




  private handleRequestTypeChange(val: any) {
    this.removeSectionInAccordion('request_detail_addnl', 0, true);
    // findRefField currently not available in RequestService, 
    // skipping or using a placeholder until reference data API is confirmed.
    // this.requestService.findRefField(val['requestType']).subscribe(data => { ... });

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

