import { Component } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { FormGroup, Validators } from '@angular/forms';
import { WorkflowRequest } from '../../model/request.model';

import { AccordionCell, AccordionButton } from 'src/app/shared/model/accordion-list.model';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { RequestDefaultValue, RequestField, WorkflowConstant } from '../../workflow.const';
import { MyRequestsTabComponent } from '../my-requests-tab/my-requests-tab.component';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { removeNullFields } from 'src/app/core/service/utilities.service';

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

  override onSearch($event: SearchEvent): void {
    if ($event.advancedSearch && !$event.reset) {
      this.requestService
        .findRequests('others', undefined, undefined, {
          ...removeNullFields($event.value),
        })
        .subscribe((s) => {
          this.setContent(s?.content!, s?.totalSize);
        });
    } else if ($event.advancedSearch && $event.reset) {
      this.loadData();
    }
  }

  override loadData(): void {
    this.requestService
      .findRequests('others', RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
      .subscribe((data) => {
        this.setContent(data?.content!, data?.totalSize);
      });
  }
}
