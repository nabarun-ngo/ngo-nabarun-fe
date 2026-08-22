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
import { createRiskListConfig, type RiskListConfig } from '../config/risk.config';
import { createRiskContext } from '../config/risk.rules';
import { RiskDataSource } from '../data/risk-data.source';
import type { RiskListContext, RiskRefDataMap } from '../domain';
import { handleListNotification } from 'src/app/shared/utils/http-error.util';

@Component({
  selector: 'app-risk-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './risk-dashboard.component.html',
  styleUrls: ['./risk-dashboard.component.scss'],
})
export class RiskDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(RiskDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly refData = readRouteRefData(this.route) as RiskRefDataMap;
  protected readonly hubBackLink = AppRoute.secured_project_hub_page.url;
  protected readonly routeContext: RiskListContext = createRiskContext({
    refData: this.refData,
    projectId: this.route.snapshot.queryParamMap.get('projectId') ?? undefined,
  });
  protected readonly config: RiskListConfig = createRiskListConfig({
    data: this.data,
    authorization: this.authorization,
    context: this.routeContext,
  });

  constructor() {
    this.sharedData.setPageName('Risks');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Risk action failed',
      success: 'Risk',
    });
  }
}
