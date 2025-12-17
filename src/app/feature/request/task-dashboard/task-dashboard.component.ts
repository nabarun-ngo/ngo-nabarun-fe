import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { TaskDefaultValue, workListTab } from '../request.const';
import { PendingTasksTabComponent } from './pending-tasks-tab/pending-tasks-tab.component';
import { CompletedTasksTabComponent } from './completed-tasks-tab/completed-tasks-tab.component';
import { PaginateWorkDetail } from 'src/app/core/api-client/models';
import { TabComponentInterface } from 'src/app/shared/interfaces/tab-component.interface';
import { taskSearchInput } from '../request.field';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';

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
  }

  protected override onInitHook(): void {
    this.sharedDataService.setPageName(TaskDefaultValue.pageTitle);
    this.searchInput = taskSearchInput(this.getCurrentTab(), this.refData!);
  }


  protected override onTabChangedHook(): void {
    this.searchInput = taskSearchInput(this.getCurrentTab(), this.refData!);
  }


  onSearch(event: SearchEvent): void {
    // Forward search to the active tab component
    this.forwardSearchToActiveTab(event);
  }

}
