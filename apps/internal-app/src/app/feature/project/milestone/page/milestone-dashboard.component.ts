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
import {
  createMilestoneListConfig,
  type MilestoneListConfig,
} from '../config/milestone.config';
import { createMilestoneContext } from '../config/milestone.rules';
import { MilestoneDataSource } from '../data/milestone-data.source';
import type { MilestoneListContext, MilestoneRefDataMap } from '../domain';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-milestone-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './milestone-dashboard.component.html',
  styleUrls: ['./milestone-dashboard.component.scss'],
})
export class MilestoneDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(MilestoneDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly refData = readRouteRefData(this.route) as MilestoneRefDataMap;
  protected readonly hubBackLink = AppRoute.secured_project_hub_page.url;
  protected readonly routeContext: MilestoneListContext = createMilestoneContext({
    refData: this.refData,
    projectId: this.route.snapshot.queryParamMap.get('projectId') ?? undefined,
  });
  protected readonly config: MilestoneListConfig = createMilestoneListConfig({
    data: this.data,
    authorization: this.authorization,
    context: this.routeContext,
  });

  constructor() {
    this.sharedData.setPageName('Milestones');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Milestone action failed',
      success: 'Milestone',
    });
  }
}
