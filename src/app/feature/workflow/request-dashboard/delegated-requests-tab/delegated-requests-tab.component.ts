import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormGroup, Validators } from '@angular/forms';
import { RequestDetail } from 'src/app/core/api-client/models';
import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { RequestConstant, RequestField } from '../../workflow.const';
import { MyRequestsTabComponent } from '../my-requests-tab/my-requests-tab.component';

@Component({
  selector: 'app-delegated-requests-tab',
  templateUrl: './delegated-requests-tab.component.html',
  styleUrls: ['./delegated-requests-tab.component.scss'],
})
export class DelegatedRequestsTabComponent extends MyRequestsTabComponent {

  protected override isDelegatedRequest: boolean = true;

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
        value: RequestField.requesterName,
        rounded: true
      },
      {
        value: RequestField.requestStatus,
        rounded: true
      }
    ]);
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
        value: data.requester?.fullName!
      },
      {
        type: 'text',
        value: data.status!,
        showDisplayValue: true,
        refDataSection: RequestConstant.refDataKey.workflowSteps
      }
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

    // Delegated requests may have different button options
    return [
      {
        button_id: 'WITHDRAW',
        button_name: 'Withdraw'
      }
    ];
  }

  override handlePageEvent($event: PageEvent): void {
    this.requestService
      .findRequests(true, $event.pageIndex, $event.pageSize)
      .subscribe((data) => {
        this.setContent(data?.content!, data?.totalSize);
      });
  }

  override initCreateRequestForm(): void {
    // Call parent method with delegation flag set to true
    super.initCreateRequestForm(true);
  }

  /**
   * Override to include all workflow types for delegated requests (including JOIN_REQUEST_USER)
   */
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
                selectList: this.getRefData()!['visibleWorkflowTypes'] // Include all types
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
    return super.prepareDetailedView(data, options);
  }
}
