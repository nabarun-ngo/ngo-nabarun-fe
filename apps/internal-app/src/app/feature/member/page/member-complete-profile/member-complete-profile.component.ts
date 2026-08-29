import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthorizationService, sanitizeInternalRedirectUrl } from '@nabarun-ngo/auth-angular';
import type { FormDefinition, FormValues } from '@nabarun-ngo/forms-core';
import type { CfFormStepperStep } from '@nabarun-ngo/forms-angular';
import { Subscription } from 'rxjs';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { ModalService } from 'src/app/core/shell/service/modal.service';
import { KeyValue } from 'src/app/shared/models/key-value.model';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { notifyClientError } from 'src/app/shared/utils/http-error.util';
import { saveMyProfileWithPicture } from '../../config/member.config';
import {
  buildMemberPhoneEngineOptions,
  buildMemberProfileStepDefinition,
  memberProfileStepLabel,
  resolveMemberProfileEditSteps,
  userToMemberProfileFormValues,
  type MemberProfileEditStep,
} from '../../config/member.forms';
import { MemberDataSource } from '../../data/member-data.source';
import { User } from '../../domain';
import { memberAvatarUrl, memberInitials } from '../../config/member.view';
import { UserConstant } from '../../config/member.rules';

type CompleteProfileStep = 'picture' | MemberProfileEditStep;

@Component({
  selector: 'app-member-complete-profile',
  templateUrl: './member-complete-profile.component.html',
  styleUrls: ['./member-complete-profile.component.scss'],
  standalone: false,
})
export class MemberCompleteProfilePageComponent implements OnInit, OnDestroy {
  protected user!: User;
  protected refData: Record<string, KeyValue[]> = {};
  protected initialValues: FormValues = {};
  protected phoneEngineOptions = buildMemberPhoneEngineOptions();
  protected saving = false;
  protected readonly steps: CfFormStepperStep<CompleteProfileStep>[] = [
    { id: 'picture', label: 'Profile photo', kind: 'custom' },
    { id: 'personal', label: memberProfileStepLabel('personal'), kind: 'form' },
    { id: 'present_address', label: memberProfileStepLabel('present_address'), kind: 'form' },
    { id: 'permanent_address', label: memberProfileStepLabel('permanent_address'), kind: 'form' },
  ];

  private pendingPictureBase64?: string;
  private readonly subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private sharedDataService: SharedDataService,
    @Inject(MemberDataSource) private memberData: MemberDataSource,
    private authorization: AuthorizationService,
    private modalService: ModalService,
  ) {}

  ngOnInit(): void {
    this.refData = (this.route.snapshot.data['ref_data'] as Record<string, KeyValue[]>) ?? {};
    this.sharedDataService.setRefData(UserConstant.refDataName, this.refData);
    this.user = this.route.snapshot.data['data'] as User;
    this.initialValues = userToMemberProfileFormValues(this.user);
    this.phoneEngineOptions = buildMemberPhoneEngineOptions(this.refData);
    this.sharedDataService.setPageName('Complete Profile');
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  protected readonly buildStepDefinition = (
    step: CompleteProfileStep,
    _values: FormValues,
  ): FormDefinition => buildMemberProfileStepDefinition(
    step as MemberProfileEditStep,
    this.refData,
    { completeProfile: true },
  );

  protected readonly resolveSteps = (values: FormValues): CompleteProfileStep[] => [
    'picture',
    ...resolveMemberProfileEditSteps(values),
  ];

  protected get avatarUrl(): string | undefined {
    return memberAvatarUrl(this.user.picture);
  }

  protected get avatarInitials(): string | undefined {
    return this.avatarUrl ? undefined : memberInitials(this.user);
  }

  protected onPictureChange(base64: string | undefined): void {
    this.pendingPictureBase64 = base64;
  }

  protected onValidationError(message: string): void {
    this.modalService.openNotificationModal({
      title: 'Complete your profile',
      description: message,
    }, 'notification', 'error');
  }

  protected onCompleted(values: FormValues): void {
    if (this.saving) {
      return;
    }
    this.saving = true;
    this.subscriptions.add(
      saveMyProfileWithPicture(
        this.memberData,
        this.user,
        values,
        this.pendingPictureBase64,
        this.refData,
      ).subscribe({
        next: updated => {
          this.user = updated;
          this.pendingPictureBase64 = undefined;
          void this.authorization.refresh();
          void this.router.navigateByUrl(this.postCompleteRedirectUrl());
        },
        error: error => {
          this.saving = false;
          notifyClientError(this.modalService, error, {
            title: 'Update failed',
            description: 'Could not save your profile. Please try again.',
          });
        },
        complete: () => {
          this.saving = false;
        },
      }),
    );
  }

  private postCompleteRedirectUrl(): string {
    const stateData = this.location.getState() as { redirect_to?: string };
    return sanitizeInternalRedirectUrl(
      stateData.redirect_to,
      AppRoute.secured_dashboard_page.url,
    );
  }
}
