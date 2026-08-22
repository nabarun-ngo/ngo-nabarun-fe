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
import { createBookListConfig, type BookListConfig } from '../config/book.config';
import { createBookContext } from '../config/book.rules';
import { BookDataSource } from '../data/book-data.source';
import type { BookListContext, BookRefDataMap } from '../domain';

@Component({
  selector: 'app-book-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    UniversalListDashboardModule,
    NavBackComponent,
  ],
  templateUrl: './book-dashboard.component.html',
  styleUrls: ['./book-dashboard.component.scss'],
})
export class BookDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(BookDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  protected readonly refData = readRouteRefData(this.route) as BookRefDataMap;
  protected readonly hubBackLink = AppRoute.secured_assets_hub_page.url;
  protected readonly routeContext: BookListContext = createBookContext({
    refData: this.refData,
  });
  protected readonly config: BookListConfig = createBookListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    context: this.routeContext,
  });

  constructor() {
    this.sharedData.setPageName('Library');
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Book action failed',
      success: 'Book',
    });
  }
}
