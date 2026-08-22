import { CommonModule } from '@angular/common';
import { Component, HostListener, Input } from '@angular/core';
import { ListRowBadge } from '@nabarun-ngo/list-dashboard-angular';

@Component({
  selector: 'app-member-detail-hero',
  templateUrl: './member-detail-hero.component.html',
  styleUrls: ['./member-detail-hero.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class MemberDetailHeroComponent {
  @Input() avatarUrl?: string;
  @Input() avatarInitials?: string;
  @Input() alt = 'Member profile photo';
  @Input() statusBadge?: ListRowBadge;
  @Input() roleLabels: string[] = [];

  protected previewOpen = false;

  get showAvatar(): boolean {
    return !!this.avatarUrl || !!this.avatarInitials;
  }

  get showHero(): boolean {
    return this.showAvatar || !!this.statusBadge || this.roleLabels.length > 0;
  }

  get statusBadgeClass(): string {
    return `member-detail-hero__badge--${this.statusBadge?.tone ?? 'neutral'}`;
  }

  get canPreview(): boolean {
    return !!this.avatarUrl;
  }

  onAvatarClick(): void {
    if (!this.canPreview) {
      return;
    }
    this.previewOpen = true;
  }

  closePreview(): void {
    this.previewOpen = false;
  }

  onPreviewBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closePreview();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.previewOpen) {
      this.closePreview();
    }
  }

  trackRole(_index: number, role: string): string {
    return role;
  }
}
