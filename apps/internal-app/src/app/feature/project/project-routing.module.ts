import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from '@nabarun-ngo/auth-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { ProjectHubComponent } from './project-hub/project-hub.component';
import { ActivityDashboardComponent } from './activity/page/activity-dashboard.component';
import { activityRefDataResolver } from './activity/data/activity.resolver';
import { GoalDashboardComponent } from './goal/page/goal-dashboard.component';
import { goalRefDataResolver } from './goal/data/goal.resolver';
import { BeneficiaryDashboardComponent } from './beneficiary/page/beneficiary-dashboard.component';
import { beneficiaryRefDataResolver } from './beneficiary/data/beneficiary.resolver';
import { MilestoneDashboardComponent } from './milestone/page/milestone-dashboard.component';
import { milestoneRefDataResolver } from './milestone/data/milestone.resolver';
import { TeamDashboardComponent } from './team/page/team-dashboard.component';
import { teamRefDataResolver } from './team/data/team.resolver';
import { RiskDashboardComponent } from './risk/page/risk-dashboard.component';
import { riskRefDataResolver } from './risk/data/risk.resolver';
import { ProjectDashboardComponent } from './project/page/project-dashboard.component';
import { projectRefDataResolver } from './project/data/project.resolver';
import { reportsRoute } from '../reports/reports.routes';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_project_hub_page.path,
    component: ProjectHubComponent,
  },
  {
    path: route_data.secured_project_list_page.path,
    component: ProjectDashboardComponent,
    canActivate: [permissionGuard(SCOPE.read.projects)],
    resolve: {
      ref_data: projectRefDataResolver,
    },
  },
  {
    path: route_data.secured_project_activities_page.path,
    component: ActivityDashboardComponent,
    canActivate: [permissionGuard(SCOPE.read.activities)],
    resolve: {
      ref_data: activityRefDataResolver,
    },
  },
  {
    path: route_data.secured_project_goals_page.path,
    component: GoalDashboardComponent,
    canActivate: [permissionGuard(SCOPE.read.goals)],
    resolve: {
      ref_data: goalRefDataResolver,
    },
  },
  {
    path: route_data.secured_project_beneficiaries_page.path,
    component: BeneficiaryDashboardComponent,
    canActivate: [permissionGuard(SCOPE.read.beneficiaries)],
    resolve: {
      ref_data: beneficiaryRefDataResolver,
    },
  },
  {
    path: route_data.secured_project_milestones_page.path,
    component: MilestoneDashboardComponent,
    canActivate: [permissionGuard(SCOPE.read.milestones)],
    resolve: {
      ref_data: milestoneRefDataResolver,
    },
  },
  {
    path: route_data.secured_project_team_page.path,
    component: TeamDashboardComponent,
    canActivate: [permissionGuard(SCOPE.read.project_teams)],
    resolve: {
      ref_data: teamRefDataResolver,
    },
  },
  {
    path: route_data.secured_project_risks_page.path,
    component: RiskDashboardComponent,
    canActivate: [permissionGuard(SCOPE.read.risks)],
    resolve: {
      ref_data: riskRefDataResolver,
    },
  },
  reportsRoute({
    path: route_data.secured_project_reports_page.path,
    backTo: route_data.secured_project_hub_page.url,
    backLabel: 'Projects',
  }),
  {
    path: 'list',
    redirectTo: route_data.secured_project_list_page.path,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule { }
