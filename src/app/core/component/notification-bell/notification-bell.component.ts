import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService, PagedNotifications } from 'src/app/core/service/notification/notification.service';
import { AppNotification } from 'src/app/core/service/notification/notification.service';
import { SharedDataService } from '../../service/shared-data.service';
@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  unreadCount = 0;
  notifications: AppNotification[] = [];
  isDropdownOpen = false;
  loading = false;
  loadingMore = false;

  // Pagination
  currentPage = 0;
  pageSize = 10;
  hasMore = true;

  private destroy$ = new Subject<void>();

  constructor(
    public notificationService: NotificationService,
    private router: Router,
    private sharedDataService: SharedDataService
  ) { }

  ngOnInit(): void {
    // Subscribe to unread count
    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    // Subscribe to notifications
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifications => {
        this.notifications = notifications;
      });

    this.sharedDataService.notificationRefresh.subscribe((value) => {
      if (value) {
        this.notificationService.refreshUnreadCount();
      }
    });

  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;

    if (this.isDropdownOpen) {
      this.refreshNotifications();
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  refreshNotifications(): void {
    this.loading = true;
    this.currentPage = 0;
    this.hasMore = true;

    this.notificationService.getMyNotificationsPaged(this.currentPage, this.pageSize).subscribe({
      next: (result) => {
        this.loading = false;
        this.hasMore = result.data.length === this.pageSize;
      },
      error: (error) => {
        console.error('Failed to load notifications:', error);
        this.loading = false;
      }
    });

    this.notificationService.getMyUnreadCount().subscribe();
  }

  markAsRead(notification: AppNotification, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification.id).subscribe({
      next: () => {
        console.log('Notification marked as read');
      },
      error: (error) => {
        console.error('Failed to mark notification as read:', error);
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: (response) => {
        console.log(`${response.markedCount} notifications marked as read`);
      },
      error: (error) => {
        console.error('Failed to mark all as read:', error);
      }
    });
  }

  onNotificationClick(notification: AppNotification): void {
    // Mark as read
    this.markAsRead(notification);

    // Navigate to action URL if available
    if (notification.actionUrl) {
      this.closeDropdown();
      this.router.navigateByUrl(notification.actionUrl);
    }
  }

  deleteNotification(notification: AppNotification, event: Event): void {
    event.stopPropagation();

    this.notificationService.deleteNotification(notification.id).subscribe({
      next: () => {
        console.log('Notification deleted');
      },
      error: (error) => {
        console.error('Failed to delete notification:', error);
      }
    });
  }

  loadMore(): void {
    if (this.loadingMore || !this.hasMore) {
      return;
    }

    this.loadingMore = true;
    this.currentPage++;

    this.notificationService.getMyNotificationsPaged(this.currentPage, this.pageSize).subscribe({
      next: (result) => {
        this.loadingMore = false;
        this.hasMore = result.data.length === this.pageSize;

        // Append new notifications to existing ones
        const currentNotifications = this.notificationService.getCurrentNotifications();
        this.notificationService.appendNotifications(result.data);
      },
      error: (error) => {
        console.error('Failed to load more notifications:', error);
        this.loadingMore = false;
        this.currentPage--; // Revert page increment on error
      }
    });
  }

  onScroll(event: Event): void {
    const element = event.target as HTMLElement;
    const threshold = 50; // pixels from bottom
    const position = element.scrollTop + element.clientHeight;
    const height = element.scrollHeight;

    if (position > height - threshold) {
      this.loadMore();
    }
  }

  viewAllNotifications(): void {
    this.closeDropdown();
    this.router.navigate(['/notifications']);
  }

  /**
   * Get icon based on notification type/category
   */
  getNotificationIcon(notification: AppNotification): string {
    if (notification.icon) {
      return notification.icon;
    }

    // Default icons based on type
    switch (notification.type) {
      case 'SUCCESS':
        return 'check_circle';
      case 'WARNING':
        return 'warning';
      case 'ERROR':
        return 'error';
      case 'TASK':
        return 'assignment';
      case 'APPROVAL':
        return 'approval';
      case 'REMINDER':
        return 'alarm';
      case 'ANNOUNCEMENT':
        return 'campaign';
      case 'INFO':
        return 'info';
      default:
        return 'notifications';
    }
  }

  /**
   * Get color class based on notification type
   */
  getNotificationColor(notification: AppNotification): string {
    switch (notification.type) {
      case 'SUCCESS':
        return 'success';
      case 'WARNING':
      case 'REMINDER':
        return 'warning';
      case 'ERROR':
        return 'error';
      case 'APPROVAL':
      case 'TASK':
        return 'primary';
      case 'INFO':
      case 'ANNOUNCEMENT':
        return 'accent';
      default:
        return 'default';
    }
  }

  /**
   * Format date as time ago string
   */
  getTimeAgo(date: string | Date): string {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) {
      return 'Just now';
    } else if (diffMins < 60) {
      return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      return notificationDate.toLocaleDateString();
    }
  }
}
