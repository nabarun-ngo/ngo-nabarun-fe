import { CommonModule } from '@angular/common';
import { Component, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import {
  ListDashboardComponent,
  ListDetailHeroDirective,
  UniversalListDashboardModule,
  ULD_DOCUMENT_LIST,
  ULD_FILE_UPLOAD,
  provideListFormCustomStepRenderer,
  readRouteRefData,
  type ListRowBadge,
  type ListDashboardNotification,
} from '@nabarun-ngo/list-dashboard-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { DocumentListComponent } from 'src/app/shared/components/document-list/document-list.component';
import { FileUploadComponent } from 'src/app/shared/components/file-upload/file-upload.component';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { NavBackComponent } from 'src/app/shared/components/nav-back/nav-back.component';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { KeyValue } from 'src/app/shared/models/key-value.model';
import { notifyClientError, handleListNotification } from 'src/app/shared/utils/http-error.util';
import { createMemberListConfig, type MemberListConfig, type MemberListContext } from '../../config/member.config';
import { buildMemberPhoneEngineOptions } from '../../config/member.forms';
import {
  memberAvatarUrl,
  memberInitials,
  memberStatusBadge,
} from '../../config/member.view';
import { MemberDataSource } from '../../data/member-data.source';
import type { MemberListCriteria, User } from '../../domain';
import { MemberDetailHeroComponent } from '../../components/member-detail-hero/member-detail-hero.component';
import { MemberProfilePictureCustomStepComponent } from '../../components/member-profile-picture-custom-step/member-profile-picture-custom-step.component';

@Component({
  selector: 'app-member-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ListDashboardComponent,
    ListDetailHeroDirective,
    UniversalListDashboardModule,
    NavBackComponent,
    MemberDetailHeroComponent,
  ],
  templateUrl: './member-dashboard.component.html',
  styleUrls: ['./member-dashboard.component.scss'],
  providers: [
    { provide: ULD_DOCUMENT_LIST, useValue: DocumentListComponent },
    { provide: ULD_FILE_UPLOAD, useValue: FileUploadComponent },
    provideListFormCustomStepRenderer(
      'memberProfilePicture',
      MemberProfilePictureCustomStepComponent,
    ),
  ],
})
export class MemberDashboardComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly authorization = inject(AuthorizationService);
  private readonly data = inject(MemberDataSource);
  private readonly modal = inject(ModalService);
  private readonly sharedData = inject(SharedDataService);

  @ViewChild(ListDashboardComponent)
  private listDashboard?: ListDashboardComponent<User, MemberListCriteria, MemberListContext>;

  protected readonly refData = readRouteRefData(this.route) as Record<string, KeyValue[]>;
  protected readonly dashboardLink = AppRoute.secured_dashboard_page.url;
  protected readonly phoneEngineOptions = buildMemberPhoneEngineOptions(this.refData);
  protected readonly routeContext: MemberListContext = {
    refData: this.refData,
    getSelectedMember: () => this.listDashboard?.controller.dashboard.detailPage.selected,
  };
  protected readonly config: MemberListConfig = createMemberListConfig({
    data: this.data,
    authorization: this.authorization,
    modal: this.modal,
    getActiveChip: () => this.listDashboard?.controller.dashboard.listPage.activeChip,
    getRefData: () => this.routeContext.refData,
    reloadList: () => this.listDashboard?.controller.dashboard.listPage.reloadList(),
  });

  constructor() {
    this.sharedData.setPageName('Members');
  }

  /** A self edit satisfies the profile-completion guard for this session. */
  protected onMemberUpdated(): void {
    if (this.listDashboard?.controller.dashboard.listPage.activeChip === 'me') {
      void this.authorization.refresh();
    }
  }

  protected onNotification(notification: ListDashboardNotification): void {
    handleListNotification(this.modal, notification, {
      error: 'Update failed',
      success: 'Members',
    });
  }

  protected onSaveError(error: unknown): void {
    notifyClientError(this.modal, error, {
      title: 'Update failed',
      description: 'Could not save member changes. Please try again.',
    });
  }

  protected heroAvatarUrl(member: User): string | undefined {
    return memberAvatarUrl(member.picture);
  }

  protected heroInitials(member: User): string | undefined {
    return this.heroAvatarUrl(member) ? undefined : memberInitials(member);
  }

  protected heroStatusBadge(member: User): ListRowBadge | undefined {
    if (!member.status) {
      return undefined;
    }
    return memberStatusBadge(member.status, this.refData);
  }

  protected heroRoleLabels(member: User): string[] {
    return member.roles?.map(role => role.roleName).filter((name): name is string => !!name?.trim()) ?? [];
  }
}
