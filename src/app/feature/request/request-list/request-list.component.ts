import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Paginator } from 'src/app/core/component/paginator';
import { RequestDefaultValue, RequestField, requestTab } from '../request.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivatedRoute } from '@angular/router';
import { RequestService } from '../request.service';
import { PaginateRequestDetail } from 'src/app/core/api/models';
import { AccordionCell, AccordionList, AccordionRow } from 'src/app/shared/components/generic/accordion-list/accordion-list.model';
import { FormGroup } from '@angular/forms';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';

@Component({
  selector: 'app-request-list',
  templateUrl: './request-list.component.html',
  styleUrls: ['./request-list.component.scss']
})
export class RequestListComponent extends Paginator implements OnInit {
  protected tabIndex!: number;
  protected tabMapping: requestTab[] = ['self_request', 'delegated_request'];
  protected accordionList!: AccordionList;
  protected requestList!: PaginateRequestDetail;
  protected requestForm: FormGroup = new FormGroup({});
  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
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
      let refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('REQUEST', refData);
    }

    if (this.route.snapshot.data['data']) {
      this.requestList = this.route.snapshot.data['data'] as PaginateRequestDetail;
      this.itemLengthSubs.next(this.requestList?.totalSize!);
      console.log(this.requestList)
      this.loadRequests(false);
    }
  }



  protected tabChanged(index: number) {
    this.tabIndex = index;
    this.pageNumber = RequestDefaultValue.pageNumber;
    this.pageSize = RequestDefaultValue.pageSize;
    this.fetchDetails();

  }
  private fetchDetails() {
    if (this.tabMapping[this.tabIndex] == 'self_request') {
      this.requestService.findRequests(false).subscribe(s => {
        this.requestList = s!;
        this.itemLengthSubs.next(this.requestList?.totalSize!);
        this.loadRequests(false);
      })
    } else if (this.tabMapping[this.tabIndex] == 'delegated_request') {
      this.requestService.findRequests(true).subscribe(s => {
        this.requestList = s!;
        this.itemLengthSubs.next(this.requestList?.totalSize!);
        this.loadRequests(true);
      })
    }
  }

  private loadRequests(delegated: boolean) {
    let headers = [
      {
        value: RequestField.requestId,
        rounded: true
      },
      {
        value: RequestField.requestType,
        rounded: true
      },
      {
        value: delegated ? RequestField.requesterName : RequestField.requestStatus,
        rounded: true
      },
      {
        value: delegated ? RequestField.requestStatus : RequestField.requestedOn,
        rounded: true
      }
    ]
    let content = this.requestList.content?.map(m => {
      let cells = [
        {
          type: 'text',
          value: m.id,
          bgColor: 'bg-purple-200'
        },
        {
          type: 'text',
          value: m.type
        },
        {
          type: 'text',
          value: delegated ? m.requester?.fullName : m.status
        },
        {
          type: 'text',
          value: delegated ? m.status : m.createdOn
        }
      ] as AccordionCell[];

      return {
        columns: cells,
        detailed: [
          {
            section_name: 'Request Details',
            section_type: 'key_value',
            section_form: this.requestForm,
            content: [
              {
                field_name: 'Request Id',
                field_value: m.id
              },
              {
                field_name: 'Request Type',
                field_value: m.type
              },
              {
                field_name: 'Request Status',
                field_value: m.status
              }
            ]
          }
        ]
      } as AccordionRow;
    })
    this.accordionList = {
      headers: headers,
      contents: content!,
      searchValue:''
    }



  }
  override handlePageEvent($event: PageEvent): void {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.fetchDetails();
  }

  add() {
    //this.accordionList.addContent = []
  }
}


