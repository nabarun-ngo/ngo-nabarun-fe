import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { RequestDefaultValue, requestTab } from '../request.const';
import { PaginateRequestDetail } from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { SearchEvent, TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { MyRequestsTabComponent } from './my-requests-tab/my-requests-tab.component';
import { DelegatedRequestsTabComponent } from './delegated-requests-tab/delegated-requests-tab.component';
import { requestSearchInput } from '../request.field';

@Component({
  selector: 'app-request-dashboard',
  templateUrl: './request-dashboard.component.html',
  styleUrls: ['./request-dashboard.component.scss'],
})
export class RequestDashboardComponent extends StandardTabbedDashboard<requestTab, PaginateRequestDetail> {

  @ViewChild(MyRequestsTabComponent) selfRequestTab!: MyRequestsTabComponent;
  @ViewChild(DelegatedRequestsTabComponent) delegatedRequestTab!: DelegatedRequestsTabComponent;

  protected AppRoute = AppRoute;
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;
  protected tabMapping: requestTab[] = ['self_request', 'delegated_request'];

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
  ) {
    super(route);
  }

  protected override onInitHook(): void {
    this.sharedDataService.setPageName(RequestDefaultValue.pageTitle);
    this.searchInput = requestSearchInput(this.getCurrentTab(),this.refData!);
  }

  protected override get tabComponents(): { [key in requestTab]?: TabComponentInterface<PaginateRequestDetail> } {
    return {
      self_request: this.selfRequestTab,
      delegated_request: this.delegatedRequestTab
    };
  }
  protected override get defaultTab(): requestTab {
    return RequestDefaultValue.tabName as requestTab; 
  }

  protected override onTabChangedHook(): void {
    this.searchInput = requestSearchInput(this.getCurrentTab(),this.refData!);
    // if (this.tabMapping[this.tabIndex] == 'self_request') {
    //   this.requestService
    //     .findRequests(false, RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
    //     .subscribe((s) => {
    //       this.requestList = s!;
    //     });
    // } else if (this.tabMapping[this.tabIndex] == 'delegated_request') {
    //   this.requestService
    //     .findRequests(true, RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
    //     .subscribe((s) => {
    //       this.requestList = s!;
    //     });
    // }
  }

  onSearch($event: SearchEvent) {
    this.forwardSearchToActiveTab($event);
    // if ($event.advancedSearch && !$event.reset) {
    //   console.log('Advanced search:', $event.value);
    //   this.performAdvancedSearch($event.value);
    // } else if ($event.advancedSearch && $event.reset) {
    //   console.log('Resetting search');
    //   this.onTabChanged();
    // } else if (!$event.advancedSearch) {
    //   console.log('Normal search:', $event.value);
    //   this.performNormalSearch($event.value);
    // } else 
      
    // if ($event?.buttonName === 'ADVANCED_SEARCH') {
    //   // Handle when user clicks 'Advanced Search' button to populate dynamic data
    //   this.populateAdvancedSearchData();
    // }
  }

  // private performNormalSearch(searchTerm: string): void {
  //   if (!searchTerm || searchTerm.trim() === '') {
  //     this.onTabChanged();
  //     return;
  //   }

  //   // Since backend filter is limited, we'll fetch all data and filter client-side
  //   const isDelegated = this.tabMapping[this.tabIndex] === 'delegated_request';
  //   this.requestService
  //     .findRequests(isDelegated, RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
  //     .subscribe((response) => {
  //       if (response?.content) {
  //         const filteredContent = this.filterRequestsBySearchTerm(response.content, searchTerm);
  //         this.requestList = {
  //           ...response,
  //           content: filteredContent,
  //           totalSize: filteredContent.length
  //         };
  //       }
  //     });
  // }

  // private performAdvancedSearch(searchCriteria: any): void {
  //   const cleanCriteria = removeNullFields(searchCriteria);
  //   if (Object.keys(cleanCriteria).length === 0) {
  //     this.onTabChanged();
  //     return;
  //   }

  //   // Since backend filter is limited, we'll fetch all data and filter client-side
  //   const isDelegated = this.tabMapping[this.tabIndex] === 'delegated_request';
  //   this.requestService
  //     .findRequests(isDelegated, RequestDefaultValue.pageNumber, RequestDefaultValue.pageSize)
  //     .subscribe((response) => {
  //       if (response?.content) {
  //         const filteredContent = this.filterRequestsByAdvancedCriteria(response.content, cleanCriteria);
  //         this.requestList = {
  //           ...response,
  //           content: filteredContent,
  //           totalSize: filteredContent.length
  //         };
  //       }
  //     });
  // }

  // private filterRequestsBySearchTerm(requests: any[], searchTerm: string): any[] {
  //   if (!searchTerm) return requests;

  //   const lowerSearchTerm = searchTerm.toLowerCase();
  //   return requests.filter(request =>
  //     (request.id?.toLowerCase().includes(lowerSearchTerm)) ||
  //     (request.type?.toLowerCase().includes(lowerSearchTerm)) ||
  //     (request.description?.toLowerCase().includes(lowerSearchTerm)) ||
  //     (request.status?.toLowerCase().includes(lowerSearchTerm)) ||
  //     (request.requester?.fullName?.toLowerCase().includes(lowerSearchTerm))
  //   );
  // }

  // private filterRequestsByAdvancedCriteria(requests: any[], criteria: any): any[] {
  //   return requests.filter(request => {
  //     // Request ID filter
  //     if (criteria.requestId && !request.id?.toLowerCase().includes(criteria.requestId.toLowerCase())) {
  //       return false;
  //     }

  //     // Request Type filter
  //     if (criteria.requestType && request.type !== criteria.requestType) {
  //       return false;
  //     }

  //     // Status filter
  //     if (criteria.status && request.status !== criteria.status) {
  //       return false;
  //     }

  //     // Date range filter
  //     if (criteria.fromDate || criteria.toDate) {
  //       const requestDate = new Date(request.createdOn);
  //       if (criteria.fromDate && requestDate < new Date(criteria.fromDate)) {
  //         return false;
  //       }
  //       if (criteria.toDate && requestDate > new Date(criteria.toDate + ' 23:59:59')) {
  //         return false;
  //       }
  //     }

  //     // Requester name filter (for delegated requests)
  //     if (criteria.requesterName && this.tabMapping[this.tabIndex] === 'delegated_request') {
  //       const requesterName = request.requester?.fullName || '';
  //       if (!requesterName.toLowerCase().includes(criteria.requesterName.toLowerCase())) {
  //         return false;
  //       }
  //     }

  //     // Description filter
  //     if (criteria.description && !request.description?.toLowerCase().includes(criteria.description.toLowerCase())) {
  //       return false;
  //     }

  //     return true;
  //   });
  // }

  // private populateAdvancedSearchData(): void {
  //   // If we need to load any dynamic data for advanced search
  //   // For example, loading users for requester dropdown in delegated requests
  //   if (this.getCurrentTab() === 'delegated_request') {
  //     this.requestService.getUsers().subscribe(data => {
  //       const requesterField = this.searchInput.advancedSearch?.searchFormFields
  //         .find(field => field.formControlName === 'requesterName');

  //       if (requesterField && data?.content) {
  //         // Convert users to dropdown options if needed in future
  //         console.log('Users loaded for advanced search:', data.content.length);
  //       }
  //     });
  //   }
  // }
}
