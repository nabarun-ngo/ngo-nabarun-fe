import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  ListDashboardComponent,
  UniversalListDashboardModule,
  readRouteRefData,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { createTeamListConfig, type TeamListConfig } from '../config/team.config';
import { createTeamContext } from '../config/team.rules';
import { TeamDataSource } from '../data/team-data.source';
import type { TeamListContext, TeamRefDataMap } from '../domain';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-team-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './team-dashboard.component.html',
  styleUrls: ['./team-dashboard.component.scss'],
})
export class TeamDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(TeamDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly refData = readRouteRefData(this.route) as TeamRefDataMap;
  protected readonly hubBackLink = AppRoute.secured_project_hub_page.url;
  protected readonly routeContext: TeamListContext = createTeamContext({
    refData: this.refData,
    projectId: this.route.snapshot.queryParamMap.get('projectId') ?? undefined,
  });
  protected readonly config: TeamListConfig = createTeamListConfig({
    data: this.data,
    authorization: this.authorization,
    context: this.routeContext,
  });

  constructor() {
    this.sharedData.setPageName('Team');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Team action failed',
      success: 'Team',
    });
  }
}
