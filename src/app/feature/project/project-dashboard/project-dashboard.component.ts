import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { ProjectDefaultValue } from '../project.const';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { StandardDashboard } from 'src/app/shared/utils/standard-dashboard';
import { PagedProject } from '../model/project.model';
import { projectSearchInput } from '../fields/project.field';
import { SearchEvent } from 'src/app/shared/components/search-and-advanced-search-form/search-event.model';
import { ProjectListTabComponent } from './project-list-tab/project-list-tab.component';
import { User } from 'src/app/feature/member/models/member.model';

@Component({
  selector: 'app-project-dashboard',
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss'],
})
export class ProjectDashboardComponent extends StandardDashboard<{ projects: PagedProject, managers: User[] | undefined }> {

  @ViewChild(ProjectListTabComponent) projectListTab!: ProjectListTabComponent;

  protected AppRoute = AppRoute;
  protected navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url,
    },
  ];
  protected searchInput!: SearchAndAdvancedSearchModel;

  constructor(
    private sharedDataService: SharedDataService,
    protected override route: ActivatedRoute,
  ) {
    super(route);
  }

  protected override onInitHook(): void {
    this.sharedDataService.setPageName(ProjectDefaultValue.pageTitle);
    this.searchInput = projectSearchInput(this.refData!);
  }

  onSearch($event: SearchEvent) {
    // Forward search to the tab component
    if (this.projectListTab) {
      this.projectListTab.onSearch($event);
    }
  }
}
