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
import { handleListNotification } from 'src/app/shared/utils/http-error.util';
import { createAssetListConfig, type AssetListConfig } from '../config/asset.config';
import { createAssetContext } from '../config/asset.rules';
import { AssetDataSource } from '../data/asset-data.source';
import type { AssetListContext, AssetRefDataMap } from '../domain';

@Component({
  selector: 'app-asset-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './asset-dashboard.component.html',
  styleUrls: ['./asset-dashboard.component.scss'],
})
export class AssetDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(AssetDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly refData = readRouteRefData(this.route) as AssetRefDataMap;
  protected readonly hubBackLink = AppRoute.secured_assets_hub_page.url;
  protected readonly routeContext: AssetListContext = createAssetContext({
    refData: this.refData,
  });
  protected readonly config: AssetListConfig = createAssetListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    context: this.routeContext,
  });

  constructor() {
    this.sharedData.setPageName('Assets');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Asset action failed',
      success: 'Asset',
    });
  }
}
