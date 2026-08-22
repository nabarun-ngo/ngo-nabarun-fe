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
import {
  createActivityListConfig,
  type ActivityLinkedFinance,
  type ActivityListConfig,
} from '../config/activity.config';
import { createActivityContext } from '../config/activity.rules';
import { ActivityDataSource } from '../data/activity-data.source';
import type { Activity, ActivityListContext, ActivityRefDataMap } from '../domain';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-activity-dashboard',
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
  templateUrl: './activity-dashboard.component.html',
  styleUrls: ['./activity-dashboard.component.scss'],
})
export class ActivityDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(ActivityDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly refData = readRouteRefData(this.route) as ActivityRefDataMap;
  protected readonly hubBackLink = AppRoute.secured_project_hub_page.url;
  protected readonly routeContext: ActivityListContext = createActivityContext({
    refData: this.refData,
    projectId: this.route.snapshot.queryParamMap.get('projectId') ?? undefined,
  });
  protected readonly config: ActivityListConfig = createActivityListConfig({
    data: this.data,
    authorization: this.authorization,
    context: this.routeContext,
    openLinkedFinance: (activity, target) => this.openLinkedFinance(activity, target),
  });

  constructor() {
    this.sharedData.setPageName('Activities');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Activity action failed',
      success: 'Activity',
    });
  }

  /** Finance lists stay scoped to the activity and come back to this list. */
  private openLinkedFinance(activity: Activity, target: ActivityLinkedFinance): void {
    const backTo = `${AppRoute.secured_project_activities_page.url}?activityId=${activity.id}`;
    const shared = {
      projectId: activity.projectId,
      backTo,
      backLabel: activity.name,
    };

    if (target === 'donations') {
      void this.router.navigate([AppRoute.secured_donation_dashboard_page.url], {
        queryParams: {
          ...shared,
          forEventId: activity.id,
          projectLabel: activity.name,
        },
      });
      return;
    }

    void this.router.navigate([AppRoute.secured_manage_account_page.url], {
      queryParams: {
        ...shared,
        activityId: activity.id,
        expenseRefId: activity.id,
        eventName: activity.name,
      },
    });
  }
}
