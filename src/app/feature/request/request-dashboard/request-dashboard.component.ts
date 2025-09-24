import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { RequestService } from '../request.service';
import { RequestDefaultValue, requestTab, RequestConstant } from '../request.const';
import {
  KeyValue,
  PaginateRequestDetail,
} from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { TabbedPage } from 'src/app/shared/utils/tab';
import { removeNullFields } from 'src/app/core/service/utilities.service';

@Component({
  selector: 'app-request-dashboard',
  templateUrl: './request-dashboard.component.html',
  styleUrls: ['./request-dashboard.component.scss'],
})
export class RequestDashboardComponent extends TabbedPage<requestTab> {
  protected AppRoute = AppRoute;
  protected requestList!: PaginateRequestDetail;
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;
  private refData: any;

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
    private requestService: RequestService
  ) {
    super(route);
    this.sharedDataService.setPageName(RequestDefaultValue.pageTitle);
  }

  override handleRouteData(): void {
    if (this.route.snapshot.data['data']) {
      this.requestList = this.route.snapshot.data[
        'data'
      ] as PaginateRequestDetail;
    }
    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
    }
    this.initializeSearchInput();
  }

  private initializeSearchInput(): void {
    this.searchInput = {
      normalSearchPlaceHolder: 'Search by Request ID, Type, or Description',
      advancedSearch: {
        title: 'Advanced Request Search',
        buttonText: {
          search: 'Search Requests',
          close: 'Clear & Close'
        },
        searchFormFields: [
          {
            formControlName: 'requestId',
            inputModel: {
              tagName: 'input',
              inputType: 'text',
              html_id: 'requestId',
              labelName: 'Request ID',
              placeholder: 'Enter Request ID',
              cssInputClass: 'bg-white'
            }
          },
          {
            formControlName: 'requestType',
            inputModel: {
              tagName: 'select',
              inputType: '',
              html_id: 'requestType',
              labelName: 'Request Type',
              placeholder: 'Select Request Type',
              selectList: this.refData?.[RequestConstant.refDataKey.workflowTypes] || [],
              cssInputClass: 'bg-white'
            }
          },
          {
            formControlName: 'status',
            inputModel: {
              tagName: 'select',
              inputType: '',
              html_id: 'status',
              labelName: 'Request Status',
              placeholder: 'Select Status',
              selectList: this.refData?.[RequestConstant.refDataKey.workflowSteps] || [],
              cssInputClass: 'bg-white'
            }
          },
          {
            formControlName: 'fromDate',
            inputModel: {
              tagName: 'input',
              inputType: 'date',
              html_id: 'fromDate',
              labelName: 'From Date',
              placeholder: 'Select from date',
              cssInputClass: 'bg-white'
            }
          },
          {
            formControlName: 'toDate',
            inputModel: {
              tagName: 'input',
              inputType: 'date',
              html_id: 'toDate',
              labelName: 'To Date',
              placeholder: 'Select to date',
              cssInputClass: 'bg-white'
            }
          },
          // Only show for delegated requests tab
          {
            formControlName: 'requesterName',
            inputModel: {
              tagName: 'input',
              inputType: 'text',
              html_id: 'requesterName',
              labelName: 'Requester Name',
              placeholder: 'Enter requester name',
              cssInputClass: 'bg-white'
            },
            hidden: this.tabMapping[this.tabIndex] !== 'delegated_request'
          },
          {
            formControlName: 'description',
            inputModel: {
              tagName: 'textarea',
              inputType: '',
              html_id: 'description',
              labelName: 'Description Contains',
              placeholder: 'Enter keywords from description',
              cssInputClass: 'bg-white',
              props: { rows: 3 }
            }
          }
        ]
      }
    };
  }

  protected tabMapping: requestTab[] = ['self_request', 'delegated_request'];
  protected override onTabChanged(): void {
    // Refresh search input to show/hide tab-specific fields
    this.initializeSearchInput();
    
    if (this.tabMapping[this.tabIndex] == 'self_request') {
      this.requestService
        .findRequests(false, RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
        .subscribe((s) => {
          this.requestList = s!;
        });
    } else if (this.tabMapping[this.tabIndex] == 'delegated_request') {
      this.requestService
        .findRequests(true, RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
        .subscribe((s) => {
          this.requestList = s!;
        });
    }
  }

  onSearch($event: {
    buttonName?: string;
    advancedSearch: boolean;
    reset: boolean;
    value: any;
  }) {
    if ($event.advancedSearch && !$event.reset) {
      console.log('Advanced search:', $event.value);
      this.performAdvancedSearch($event.value);
    } else if ($event.advancedSearch && $event.reset) {
      console.log('Resetting search');
      this.onTabChanged();
    } else if (!$event.advancedSearch) {
      console.log('Normal search:', $event.value);
      this.performNormalSearch($event.value);
    } else if ($event?.buttonName === 'ADVANCED_SEARCH') {
      // Handle when user clicks 'Advanced Search' button to populate dynamic data
      this.populateAdvancedSearchData();
    }
  }

  private performNormalSearch(searchTerm: string): void {
    if (!searchTerm || searchTerm.trim() === '') {
      this.onTabChanged();
      return;
    }

    // Since backend filter is limited, we'll fetch all data and filter client-side
    const isDelegated = this.tabMapping[this.tabIndex] === 'delegated_request';
    this.requestService
      .findRequests(isDelegated, RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
      .subscribe((response) => {
        if (response?.content) {
          const filteredContent = this.filterRequestsBySearchTerm(response.content, searchTerm);
          this.requestList = {
            ...response,
            content: filteredContent,
            totalSize: filteredContent.length
          };
        }
      });
  }

  private performAdvancedSearch(searchCriteria: any): void {
    const cleanCriteria = removeNullFields(searchCriteria);
    if (Object.keys(cleanCriteria).length === 0) {
      this.onTabChanged();
      return;
    }

    // Since backend filter is limited, we'll fetch all data and filter client-side
    const isDelegated = this.tabMapping[this.tabIndex] === 'delegated_request';
    this.requestService
      .findRequests(isDelegated, RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
      .subscribe((response) => {
        if (response?.content) {
          const filteredContent = this.filterRequestsByAdvancedCriteria(response.content, cleanCriteria);
          this.requestList = {
            ...response,
            content: filteredContent,
            totalSize: filteredContent.length
          };
        }
      });
  }

  private filterRequestsBySearchTerm(requests: any[], searchTerm: string): any[] {
    if (!searchTerm) return requests;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    return requests.filter(request => 
      (request.id?.toLowerCase().includes(lowerSearchTerm)) ||
      (request.type?.toLowerCase().includes(lowerSearchTerm)) ||
      (request.description?.toLowerCase().includes(lowerSearchTerm)) ||
      (request.status?.toLowerCase().includes(lowerSearchTerm)) ||
      (request.requester?.fullName?.toLowerCase().includes(lowerSearchTerm))
    );
  }

  private filterRequestsByAdvancedCriteria(requests: any[], criteria: any): any[] {
    return requests.filter(request => {
      // Request ID filter
      if (criteria.requestId && !request.id?.toLowerCase().includes(criteria.requestId.toLowerCase())) {
        return false;
      }

      // Request Type filter
      if (criteria.requestType && request.type !== criteria.requestType) {
        return false;
      }

      // Status filter
      if (criteria.status && request.status !== criteria.status) {
        return false;
      }

      // Date range filter
      if (criteria.fromDate || criteria.toDate) {
        const requestDate = new Date(request.createdOn);
        if (criteria.fromDate && requestDate < new Date(criteria.fromDate)) {
          return false;
        }
        if (criteria.toDate && requestDate > new Date(criteria.toDate + ' 23:59:59')) {
          return false;
        }
      }

      // Requester name filter (for delegated requests)
      if (criteria.requesterName && this.tabMapping[this.tabIndex] === 'delegated_request') {
        const requesterName = request.requester?.fullName || '';
        if (!requesterName.toLowerCase().includes(criteria.requesterName.toLowerCase())) {
          return false;
        }
      }

      // Description filter
      if (criteria.description && !request.description?.toLowerCase().includes(criteria.description.toLowerCase())) {
        return false;
      }

      return true;
    });
  }

  private populateAdvancedSearchData(): void {
    // If we need to load any dynamic data for advanced search
    // For example, loading users for requester dropdown in delegated requests
    if (this.tabMapping[this.tabIndex] === 'delegated_request') {
      this.requestService.getUsers().subscribe(data => {
        const requesterField = this.searchInput.advancedSearch?.searchFormFields
          .find(field => field.formControlName === 'requesterName');
        
        if (requesterField && data?.content) {
          // Convert users to dropdown options if needed in future
          console.log('Users loaded for advanced search:', data.content.length);
        }
      });
    }
  }
}
