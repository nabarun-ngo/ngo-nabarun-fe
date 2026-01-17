import { Component, Input, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ActivityDefaultValue, activityTab } from '../project.const';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { StandardTabbedDashboard } from 'src/app/shared/utils/standard-tabbed-dashboard';
import { PagedActivity } from '../model/activity.model';
import { Project } from '../model/project.model';
import { activitySearchInput } from '../fields/activity.field';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { getProjectSection } from '../fields/project.field';
import { DetailedView } from 'src/app/shared/model/detailed-view.model';
import { StandardDashboard } from 'src/app/shared/utils/standard-dashboard';
import { ActivityAccordionComponent } from './activity-accordion/activity-accordion.component';
import { User } from '../../member/models/member.model';
import { ProjectService } from '../service/project.service';

@Component({
  selector: 'app-project-activities',
  templateUrl: './project-activities.component.html',
  styleUrls: ['./project-activities.component.scss'],
})
export class ProjectActivitiesComponent extends StandardDashboard<PagedActivity> {


  @ViewChild(ActivityAccordionComponent) activityAccordion!: ActivityAccordionComponent;

  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Projects',
      routerLink: AppRoute.secured_project_list_page.url,
    }
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;
  protected projectId!: string;
  protected project!: Project;
  detailedViews!: DetailedView[];

  constructor(
    private sharedDataService: SharedDataService,
    private projectService: ProjectService,
    protected override route: ActivatedRoute
  ) {
    super(route);
  }

  protected override onInitHook(): void {
    this.sharedDataService.setPageName(ActivityDefaultValue.pageTitle);
    this.searchInput = activitySearchInput(this.refData!);
  }

  protected override onHandleRouteDataHook(): void {
    this.projectId = atob(this.route.snapshot.params['id']);

    // Get project from navigation state
    const projectState = history.state as Project;
    if (projectState && projectState.id) {
      this.project = projectState;
      this.detailedViews = [getProjectSection(this.project, this.refData! || {}, [])];
    } else {
      this.projectService.getProjectDetail(this.projectId).subscribe(p => {
        this.project = p;
        this.detailedViews = [getProjectSection(this.project, this.refData! || {}, [])];
      });
    }

  }


  onSearch($event: SearchEvent) {
    // Forward search to the active tab component
    if (this.activityAccordion) {
      this.activityAccordion.onSearch($event);
    }
  }
}
