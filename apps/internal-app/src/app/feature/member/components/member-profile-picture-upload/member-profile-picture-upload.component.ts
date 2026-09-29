import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { sanitizeBase64 } from 'src/app/shared/utils/utilities.service';

@Component({
  selector: 'app-member-profile-picture-upload',
  templateUrl: './member-profile-picture-upload.component.html',
  styleUrls: ['./member-profile-picture-upload.component.scss'],
  standalone: true,
  imports: [CommonModule, SharedModule],
})
export class MemberProfilePictureUploadComponent {
  @Input() currentPictureUrl?: string;
  @Input() initials?: string;
  @Input() alt = 'Profile photo';

  @Output() pictureChange = new EventEmitter<string | undefined>();

  protected previewUrl?: string;

  get displayUrl(): string | undefined {
    return this.previewUrl ?? this.currentPictureUrl;
  }

  get showInitials(): boolean {
    return !this.displayUrl && !!this.initials;
  }

  protected onFilesSelected(files: FileUpload[]): void {
    const file = files[0];
    if (!file) {
      this.previewUrl = undefined;
      this.pictureChange.emit(undefined);
      return;
    }

    const base64 = sanitizeBase64(file.detail.base64Content);
    this.previewUrl = file.detail.base64Content;
    this.pictureChange.emit(base64);
  }

  protected clearSelection(): void {
    this.previewUrl = undefined;
    this.pictureChange.emit(undefined);
  }
}
