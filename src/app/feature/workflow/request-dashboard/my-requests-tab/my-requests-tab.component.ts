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
import { getRequestDetailSection } from '../../fields/request.field';
import { date } from 'src/app/core/service/utilities.service';
import { filterFormChange } from 'src/app/core/service/form.service';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { RequestService } from '../../service/request.service';

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

  onSearch($event: SearchEvent): void {
    if ($event.advancedSearch && !$event.reset) {
      this.requestService
        .findRequests('me', RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
        .subscribe((s) => {
          this.setContent(s?.content!, s?.totalSize);
        });
    } else if ($event.advancedSearch && $event.reset) {

      //console.log('Resetting search');
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
        value: data.id!,
        bgColor: 'bg-purple-200'
      },
      {
        type: 'text',
        value: data.type!,
        showDisplayValue: true,
        refDataSection: WorkflowConstant.refDataKey.workflowTypes
      },
      {
        type: 'text',
        value: data.status!,
        showDisplayValue: true,
        refDataSection: WorkflowConstant.refDataKey.workflowStatuses
      },
      {
        type: 'text',
        value: date(data.createdAt!)
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
    // this.requestService.getRequestDetail(item.id!).subscribe(s => {
    //   // Flatten tasks from all steps to show in the nested accordion
    //   const allTasks: Task[] = [];
    //   s.steps?.forEach(step => {
    //     step.tasks?.forEach(task => {
    //       allTasks.push(task);
    //     });
    //   });

    //   let workAccordion = new class extends Accordion<Task> {
    //     protected override get paginationConfig(): { pageNumber: number; pageSize: number; pageSizeOptions: number[]; } {
    //       return {
    //         pageNumber: TaskDefaultValue.pageNumber,
    //         pageSize: TaskDefaultValue.pageSize,
    //         pageSizeOptions: TaskDefaultValue.pageSizeOptions,
    //       };
    //     }
    //     override onInitHook(): void { }
    //     protected override onClick(event: { buttonId: string; rowIndex: number; }): void { }
    //     protected override onAccordionOpen(event: { rowIndex: number; }): void { }

    //     prepareHighLevelView(item: Task, options?: { [key: string]: any }): AccordionCell[] {
    //       return [
    //         {
    //           type: 'text',
    //           value: item?.id!,
    //           bgColor: 'bg-purple-200'
    //         },
    //         {
    //           type: 'text',
    //           value: item?.name!
    //         },
    //         {
    //           type: 'text',
    //           value: item?.status!
    //         }
    //       ];
    //     }

    //     prepareDetailedView(data: Task, options?: { [key: string]: any }): DetailedView[] {
    //       return [
    //         getWorkDetailSection(data, data.status === 'COMPLETED' ? 'completed_worklist' : 'pending_worklist')
    //       ];
    //     }

    //     prepareDefaultButtons(data: Task, options?: { [key: string]: any }): AccordionButton[] {
    //       return [];
    //     }

    //     handlePageEvent($event: PageEvent): void { }
    //   }();


    //   // Set up the nested accordion
    //   workAccordion.setRefData(this.getRefData()!);
    //   workAccordion.setHeaderRow([
    //     {
    //       value: 'Work Id',
    //       rounded: true
    //     },
    //     {
    //       value: 'Work Type',
    //       rounded: true
    //     },
    //     {
    //       value: 'Status',
    //       rounded: true
    //     }
    //   ]);

    //   // Set the content
    //   workAccordion.setContent(allTasks, allTasks.length);

    //   // Add the section with properly initialized accordion
    //   this.addSectionInAccordion({
    //     section_name: 'Work Detail',
    //     section_type: 'accordion_list',
    //     section_html_id: 'task_list',
    //     section_form: new FormGroup({}),
    //     accordionList: workAccordion.getAccordionList(),
    //     accordion: {
    //       object: workAccordion,
    //       accordionOpened: new EventEmitter<{ rowIndex: number }>(),
    //       buttonClick: new EventEmitter<{ buttonId: string; rowIndex: number }>()
    //     }
    //   }, event.rowIndex);
    // });
  }

  override handlePageEvent($event: PageEvent): void {
    this.requestService
      .findRequests('me', $event.pageIndex, $event.pageSize)
      .subscribe((data) => {
        this.setContent(data?.content!, data?.totalSize);
      });
  }


  private performCreateRequest() {
    let request_form = this.getSectionForm('request_detail', 0, true);
    if (request_form?.valid) {
      const type = request_form?.value.requestType;
      const data = { description: request_form?.value.description };
      const requestedFor = (this.isDelegatedRequest && request_form?.value.requestType !== 'JOIN_REQUEST_USER') ?
        request_form?.value.delegation_user : undefined;

      this.requestService.createRequest(type, data, requestedFor).subscribe(s => {
        this.hideForm(0, true);
        this.addContentRow(s!, true);
      });
    } else {
      request_form?.markAllAsTouched();
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


  initCreateRequestForm(isDelegated: boolean = false) {
    this.isDelegatedRequest = isDelegated;
    this.showCreateForm({} as any);

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

