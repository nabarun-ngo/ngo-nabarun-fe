import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { NotificationService } from 'src/app/core/service/notification/notification.service';
import { AppNotification } from 'src/app/core/service/notification/notification.service';
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

  private destroy$ = new Subject<void>();

  constructor(
    public notificationService: NotificationService,
    private router: Router
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
        this.notifications = notifications.slice(0, 10); // Show only first 10
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

    this.notificationService.getMyUnreadNotifications().subscribe({
      next: () => {
        this.loading = false;
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

  viewAllNotifications(): void {
    this.closeDropdown();
    this.router.navigate(['/notifications']);
  }
}
