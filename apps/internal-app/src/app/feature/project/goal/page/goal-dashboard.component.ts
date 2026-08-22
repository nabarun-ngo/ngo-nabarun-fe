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
import { createGoalListConfig, type GoalListConfig } from '../config/goal.config';
import { createGoalContext } from '../config/goal.rules';
import { GoalDataSource } from '../data/goal-data.source';
import type { GoalListContext, GoalRefDataMap } from '../domain';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-goal-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './goal-dashboard.component.html',
  styleUrls: ['./goal-dashboard.component.scss'],
})
export class GoalDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(GoalDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly refData = readRouteRefData(this.route) as GoalRefDataMap;
  protected readonly hubBackLink = AppRoute.secured_project_hub_page.url;
  protected readonly routeContext: GoalListContext = createGoalContext({
    refData: this.refData,
    projectId: this.route.snapshot.queryParamMap.get('projectId') ?? undefined,
  });
  protected readonly config: GoalListConfig = createGoalListConfig({
    data: this.data,
    authorization: this.authorization,
    context: this.routeContext,
  });

  constructor() {
    this.sharedData.setPageName('Goals');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Goal action failed',
      success: 'Goal',
    });
  }
}
