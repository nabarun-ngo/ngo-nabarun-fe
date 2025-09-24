import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { TaskDefaultValue, workListTab } from '../request.const';
import { PendingTasksTabComponent } from './pending-tasks-tab/pending-tasks-tab.component';
import { CompletedTasksTabComponent } from './completed-tasks-tab/completed-tasks-tab.component';
import { KeyValue, PaginateWorkDetail } from 'src/app/core/api/models';
import { SearchEvent, TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';

@Component({
  selector: 'app-task-dashboard',
  templateUrl: './task-dashboard.component.html',
  styleUrls: ['./task-dashboard.component.scss']
})
export class TaskDashboardComponent extends StandardTabbedDashboard<workListTab, PaginateWorkDetail> {

  @ViewChild(PendingTasksTabComponent) pendingTasksTab!: PendingTasksTabComponent;
  @ViewChild(CompletedTasksTabComponent) completedTasksTab!: CompletedTasksTabComponent;

  protected tabMapping: workListTab[] = ['pending_worklist', 'completed_worklist'];

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;

  // Implement abstract properties
  protected get tabComponents(): { [key in workListTab]?: TabComponentInterface<PaginateWorkDetail> } {
    return {
      pending_worklist: this.pendingTasksTab,
      completed_worklist: this.completedTasksTab
    };
  }

  protected get defaultTab(): workListTab {
    return TaskDefaultValue.tabName as workListTab;
  }

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
  ) {
    super(route);
    this.sharedDataService.setPageName(TaskDefaultValue.pageTitle);
  }

  protected override onHandleRouteData(): void {
    // Set reference data in shared service
    if (this.refData) {
      this.sharedDataService.setRefData('TASK', this.refData);
    }

    // Initialize search input
    this.searchInput = this.getSearchInput();
  }

  protected override onTabChangedHook(): void {
    // Update search input for the new tab
    this.searchInput = this.getSearchInput();
    
    // Trigger data loading for the active tab (lazy loading)
    this.triggerTabDataLoad();
  }


  private getSearchInput(): SearchAndAdvancedSearchModel {
    return {
      normalSearchPlaceHolder: 'Search by Work Id, Request Id, Work Type',
      advancedSearch: {
        searchFormFields: [
          {
            formControlName: 'workId',
            inputModel: {
              tagName: 'input' as const,
              inputType: 'text' as const,
              html_id: 'workId',
              labelName: 'Work Id',
              placeholder: 'Enter Work Id',
              cssInputClass: 'bg-white'
            },
          },
          {
            formControlName: 'requestId',
            inputModel: {
              tagName: 'input' as const,
              inputType: 'text' as const,
              html_id: 'requestId',
              labelName: 'Request Id',
              placeholder: 'Enter Request Id',
            },
          },
          {
            formControlName: 'fromDate',
            inputModel: {
              tagName: 'input' as const,
              inputType: 'date' as const,
              html_id: 'startDate',
              labelName: 'From Date',
              placeholder: 'Enter From Date',
            },
          },
          {
            formControlName: 'toDate',
            inputModel: {
              tagName: 'input' as const,
              inputType: 'date' as const,
              html_id: 'endDate',
              labelName: 'To Date',
              placeholder: 'Enter To Date',
            },
          },
        ]
      }
    };
  }

  onSearch(event: SearchEvent): void {
    // Forward search to the active tab component
    this.forwardSearchToActiveTab(event);
  }

  /**
   * Get the current active tab type based on tabIndex
   */
  private get currentTab(): workListTab {
    return this.tabMapping[this.tabIndex];
  }

  /**
   * Check if current tab is pending tasks
   */
  private get isPendingTab(): boolean {
    return this.currentTab === 'pending_worklist';
  }

  /**
   * Check if current tab is completed tasks  
   */
  private get isCompletedTab(): boolean {
    return this.currentTab === 'completed_worklist';
  }



  /**
   * Get initial data for a specific tab from resolver data
   * Returns data only if resolver data matches the requested tab
   */
  override getInitialDataForTab(tabType: workListTab): PaginateWorkDetail | undefined {
    return super.getInitialDataForTab(tabType);
  }

  /**
   * Trigger data loading for the currently active tab
   */
  private triggerTabDataLoad(): void {
    // Use setTimeout to ensure ViewChild components are ready
    setTimeout(() => {
      if (this.isPendingTab && this.pendingTasksTab) {
        this.pendingTasksTab.triggerDataLoad();
      } else if (this.isCompletedTab && this.completedTasksTab) {
        this.completedTasksTab.triggerDataLoad();
      }
    });
  }

}
