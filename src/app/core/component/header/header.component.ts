import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserIdentityService } from '../../service/user-identity.service';
import { AuthUser } from '../../model/auth-user.model';
import { ModalService } from '../../service/modal.service';
import { AppDialog } from '../../constant/app-dialog.const';
import { AppRoute } from '../../constant/app-routing.const';
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

    // Load initial unread count
    this.notificationService.refreshUnreadCount();
  }

  ngOnDestroy(): void {
  }

  logout() {
    this.modalService.openNotificationModal(AppDialog.logout_dialog, 'confirmation', 'warning').onAccept$.subscribe(() => {
      this.identityService.logout();
    });
  }
}
