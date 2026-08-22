import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  ListDashboardComponent,
  ListDetailViewExtrasDirective,
  UniversalListDashboardModule,
  readRouteRefData,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { EntityCommentsPanelComponent } from 'src/app/shared/components/comments/entity-comments-panel.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { CorrespondenceFollowService } from 'src/app/shared/correspondence/correspondence-follow.service';
import {
  createProjectListConfig,
  type ProjectChildList,
  type ProjectListConfig,
} from '../config/project.config';
import { createProjectContext } from '../config/project.rules';
import { ProjectDataSource } from '../data/project-data.source';
import type { Project, ProjectListContext, ProjectRefDataMap } from '../domain';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

const CHILD_ROUTES: Record<ProjectChildList, string> = {
  activities: AppRoute.secured_project_activities_page.url,
  goals: AppRoute.secured_project_goals_page.url,
  beneficiaries: AppRoute.secured_project_beneficiaries_page.url,
  milestones: AppRoute.secured_project_milestones_page.url,
  team: AppRoute.secured_project_team_page.url,
  risks: AppRoute.secured_project_risks_page.url,
};

@Component({
  selector: 'app-project-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    ListDetailViewExtrasDirective,
    UniversalListDashboardModule,
    NavBackComponent,
    EntityCommentsPanelComponent,
  ],
  templateUrl: './project-dashboard.component.html',
  styleUrls: ['./project-dashboard.component.scss'],
})
export class ProjectDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(ProjectDataSource);
  private readonly modal = inject(ModalService);
  private readonly follow = inject(CorrespondenceFollowService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly refData = readRouteRefData(this.route) as ProjectRefDataMap;
  protected readonly hubBackLink = AppRoute.secured_project_hub_page.url;
  protected readonly routeContext: ProjectListContext = createProjectContext({
    refData: this.refData,
  });
  protected readonly config: ProjectListConfig = createProjectListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    follow: this.follow,
    context: this.routeContext,
    openChildList: (project, child) => this.openChildList(project, child),
  });

  constructor() {
    this.sharedData.setPageName('Projects');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Project action failed',
      success: 'Project',
    });
  }

  /** Child lists stay scoped to the project and come back to this detail sheet. */
  private openChildList(project: Project, child: ProjectChildList): void {
    void this.router.navigate([CHILD_ROUTES[child]], {
      queryParams: {
        projectId: project.id,
        backTo: `${AppRoute.secured_project_list_page.url}?projectId=${project.id}`,
        backLabel: project.name,
      },
    });
  }
}
