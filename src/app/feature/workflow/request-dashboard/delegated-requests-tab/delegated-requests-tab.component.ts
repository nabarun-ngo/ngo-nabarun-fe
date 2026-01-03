import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormGroup, Validators } from '@angular/forms';
import { WorkflowRequest } from '../../model/request.model';

import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { RequestField, WorkflowConstant } from '../../workflow.const';
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
        value: data?.initiatedForName!
      },
      {
        type: 'text',
        value: data?.status!,
        showDisplayValue: true,
        refDataSection: WorkflowConstant.refDataKey.workflowStatuses
      }
    ];
  }

  override handlePageEvent($event: PageEvent): void {
    this.requestService
      .findRequests('others', $event.pageIndex, $event.pageSize)
      .subscribe((data) => {
        this.setContent(data?.content!, data?.totalSize);
      });
  }


  /**
   * Override to include all workflow types for delegated requests (including JOIN_REQUEST_USER)
   */
  protected override prepareDetailedView(
    data: WorkflowRequest,
    options?: { [key: string]: any }
  ): DetailedView[] {
    options = {
      ...options,
      forOthers: true
    }
    return super.prepareDetailedView(data, options);
  }

  override loadData(): void {
    this.requestService
      .findRequests('others')
      .subscribe((data) => {
        this.setContent(data?.content!, data?.totalSize);
      });
  }
}
