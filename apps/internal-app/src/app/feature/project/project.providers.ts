import type { Provider } from '@angular/core';
import { provideActivityInfrastructure } from './activity/data/activity.providers';
import { provideBeneficiaryInfrastructure } from './beneficiary/data/beneficiary.providers';
import { provideGoalInfrastructure } from './goal/data/goal.providers';
import { provideMilestoneInfrastructure } from './milestone/data/milestone.providers';
import { provideProjectInfrastructure } from './project/data/project.providers';
import { provideRiskInfrastructure } from './risk/data/risk.providers';
import { provideTeamInfrastructure } from './team/data/team.providers';

/** Every project entity swaps live and demo data sources here and nowhere else. */
export function provideProjectFeatureInfrastructure(): Provider[] {
  return [
    ...provideProjectInfrastructure(),
    ...provideActivityInfrastructure(),
    ...provideGoalInfrastructure(),
    ...provideBeneficiaryInfrastructure(),
    ...provideMilestoneInfrastructure(),
    ...provideTeamInfrastructure(),
    ...provideRiskInfrastructure(),
  ];
}
