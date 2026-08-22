import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from 'src/app/shared/shared.module';
import { SharedFormsModule } from 'src/app/shared/modules/forms.module';
import { ProjectRoutingModule } from './project-routing.module';
import { ProjectHubComponent } from './project-hub/project-hub.component';
import { ActivityDashboardComponent } from './activity/page/activity-dashboard.component';
import { GoalDashboardComponent } from './goal/page/goal-dashboard.component';
import { BeneficiaryDashboardComponent } from './beneficiary/page/beneficiary-dashboard.component';
import { MilestoneDashboardComponent } from './milestone/page/milestone-dashboard.component';
import { TeamDashboardComponent } from './team/page/team-dashboard.component';
import { RiskDashboardComponent } from './risk/page/risk-dashboard.component';
import { ProjectDashboardComponent } from './project/page/project-dashboard.component';
import { provideProjectFeatureInfrastructure } from './project.providers';

@NgModule({
  declarations: [
    ProjectHubComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    SharedFormsModule,
    ProjectDashboardComponent,
    ActivityDashboardComponent,
    GoalDashboardComponent,
    BeneficiaryDashboardComponent,
    MilestoneDashboardComponent,
    TeamDashboardComponent,
    RiskDashboardComponent,
    ProjectRoutingModule,
  ],
  providers: [
    ...provideProjectFeatureInfrastructure(),
  ],
})
export class ProjectModule { }
