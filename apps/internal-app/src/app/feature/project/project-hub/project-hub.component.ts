import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { NavTileConfig } from 'src/app/shared/components/nav-tiles/nav-tile.model';

@Component({
  selector: 'app-project-hub',
  templateUrl: './project-hub.component.html',
  styleUrls: ['./project-hub.component.scss'],
  standalone: false,
})
export class ProjectHubComponent implements OnInit {
  protected navTiles: NavTileConfig[] = [];

  constructor(
    private sharedDataService: SharedDataService,
    private authorization: AuthorizationService,
  ) {}

  ngOnInit(): void {
    this.sharedDataService.setPageName('Projects');
    this.buildTiles();
  }

  private buildTiles(): void {
    const perms = this.authorization.effectivePermissions();
    const canViewActivities = perms.includes(SCOPE.read.activities)
      || perms.includes(SCOPE.create.activity)
      || perms.includes(SCOPE.update.activity);
    const projectBackParams = {
      backTo: AppRoute.secured_project_hub_page.url,
      backLabel: 'Projects',
    };

    this.navTiles = [
      {
        id: 'projects',
        label: 'Projects',
        description: 'Browse and manage projects',
        link: AppRoute.secured_project_list_page.url,
        queryParams: projectBackParams,
        icon: 'projects',
        hidden: !perms.includes(SCOPE.read.projects),
      },
      {
        id: 'activities',
        label: 'Activities',
        description: 'Tasks, activities and events',
        link: AppRoute.secured_project_activities_page.url,
        queryParams: projectBackParams,
        icon: 'activities',
        hidden: !canViewActivities,
      },
      {
        id: 'goals',
        label: 'Goals',
        description: 'Targets and measured progress',
        link: AppRoute.secured_project_goals_page.url,
        queryParams: projectBackParams,
        icon: 'goals',
        hidden: !perms.includes(SCOPE.read.goals),
      },
      {
        id: 'beneficiaries',
        label: 'Beneficiaries',
        description: 'People and groups served',
        link: AppRoute.secured_project_beneficiaries_page.url,
        queryParams: projectBackParams,
        icon: 'beneficiaries',
        hidden: !perms.includes(SCOPE.read.beneficiaries),
      },
      {
        id: 'milestones',
        label: 'Milestones',
        description: 'Key dates and completions',
        link: AppRoute.secured_project_milestones_page.url,
        queryParams: projectBackParams,
        icon: 'milestones',
        hidden: !perms.includes(SCOPE.read.milestones),
      },
      {
        id: 'team',
        label: 'Team',
        description: 'Project roles and allocations',
        link: AppRoute.secured_project_team_page.url,
        queryParams: projectBackParams,
        icon: 'team',
        hidden: !perms.includes(SCOPE.read.project_teams),
      },
      {
        id: 'risks',
        label: 'Risks',
        description: 'Identified risks and mitigation',
        link: AppRoute.secured_project_risks_page.url,
        queryParams: projectBackParams,
        icon: 'risks',
        hidden: !perms.includes(SCOPE.read.risks),
      },
      {
        id: 'reports',
        label: 'Reports',
        description: 'Generate and download project reports',
        link: AppRoute.secured_project_reports_page.url,
        icon: 'reports',
        hidden: !perms.includes(SCOPE.read.reports),
      },
    ];
  }
}
