import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserIdentityService } from '../../service/user-identity.service';
import { AuthUser } from '../../model/auth-user.model';
import { ModalService } from '../../service/modal.service';
import { AppDialog } from '../../constant/app-dialog.const';
import { AppRoute } from '../../constant/app-routing.const';
import { SecuredDashboardComponent } from 'src/app/feature/dashboard/secured-dashboard/secured-dashboard.component';
import { NotificationService } from '../../service/notification/notification.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {

  protected app_route = AppRoute;
  user!: AuthUser;
  notificationCount: number = 0;
  showNotification: boolean = false;

  private subscriptions = new Subscription();

  constructor(
    private identityService: UserIdentityService,
    private modalService: ModalService,
    private notificationService: NotificationService
  ) { }

  async ngOnInit(): Promise<void> {
    this.user = await this.identityService.getUser();
    console.log(this.user);
    // Check for existing permission and initialize listening if granted
    if ('Notification' in window && Notification.permission === 'granted') {
      this.notificationService.requestPermission().subscribe({
        next: () => {
          this.notificationService.listen();
        },
        error: (error) => {
          console.error('Failed to initialize notifications:', error);
        }
      });
    }

    // Subscribe to unread count updates
    this.subscriptions.add(
      this.notificationService.unreadCount$.subscribe(count => {
        this.notificationCount = count;
      })
    );

    // Subscribe to incoming FCM messages
    this.subscriptions.add(
      this.notificationService.message$.subscribe(payload => {
        if (payload) {
          this.handleNotificationPayload(payload);
        }
      })
    );

    // Load initial unread count
    this.notificationService.refreshUnreadCount();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private handleNotificationPayload(payload: any): void {
    const data = payload.data || payload;

  }

  logout() {
    this.modalService.openNotificationModal(AppDialog.logout_dialog, 'confirmation', 'warning').onAccept$.subscribe(() => {
      this.identityService.logout();
    });
  }
}
