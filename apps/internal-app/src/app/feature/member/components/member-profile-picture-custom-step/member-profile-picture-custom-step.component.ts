import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import type { ListFormCustomStepComponent } from '@nabarun-ngo/list-dashboard-angular';
import { MemberDataSource } from '../../data/member-data.source';
import { memberAvatarUrl, memberInitials } from '../../config/member.view';
import { MemberProfilePictureUploadComponent } from '../member-profile-picture-upload/member-profile-picture-upload.component';

/**
 * Custom stepper step for Me-chip profile edit — same picture upload UX as the
 * former my-profile page, adapted to the list-dashboard custom-step contract.
 */
@Component({
  selector: 'app-member-profile-picture-custom-step',
  standalone: true,
  imports: [CommonModule, MemberProfilePictureUploadComponent],
  template: `
    <app-member-profile-picture-upload
      [currentPictureUrl]="previewUrl ?? currentPictureUrl"
      [initials]="initials"
      alt="Profile photo"
      (pictureChange)="onPictureChange($event)">
    </app-member-profile-picture-upload>
  `,
})
export class MemberProfilePictureCustomStepComponent
  implements ListFormCustomStepComponent<string | undefined> {
  private readonly memberData = inject(MemberDataSource);

  @Input() set data(value: string | undefined) {
    this.pendingBase64 = value;
  }

  @Output() dataChange = new EventEmitter<string | undefined>();

  protected currentPictureUrl?: string;
  protected initials?: string;
  protected previewUrl?: string;
  private pendingBase64?: string;

  constructor() {
    this.memberData.getMyProfile().subscribe({
      next: user => {
        this.currentPictureUrl = memberAvatarUrl(user.picture);
        this.initials = memberInitials(user);
      },
      error: () => {
        this.currentPictureUrl = undefined;
        this.initials = undefined;
      },
    });
  }

  protected onPictureChange(base64: string | undefined): void {
    this.pendingBase64 = base64;
    this.previewUrl = base64
      ? (base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`)
      : undefined;
    this.dataChange.emit(base64);
  }
}
