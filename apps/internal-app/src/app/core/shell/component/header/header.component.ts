import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { IUserIdentityService } from '../../../auth/tokens/user-identity.token';
import { ModalService } from '../../service/modal.service';
import { AppRoute } from '../../../constant/app-routing.const';
import { INotificationService } from '../../tokens/notification.token';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { MainNavItem } from '../../navigation/main-nav.model';
import { DESKTOP_PRIMARY_MAX, MainNavService } from '../../navigation/main-nav.service';

const LOGOUT_DIALOG = {
  title: 'Confirm Logout',
  description: 'Are you sure to logout from current session ?',
};

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss'],
    standalone: false
})
export class HeaderComponent implements OnInit, OnDestroy {

  protected app_route = AppRoute;
  protected currentUrl = '';
  protected moreMenuOpen = false;
  protected primaryNavItems: MainNavItem[] = [];
  protected moreNavItems: MainNavItem[] = [];

  private subscriptions = new Subscription();

  constructor(
    @Inject(IUserIdentityService) private identityService: IUserIdentityService,
    private modalService: ModalService,
    @Inject(INotificationService) private notificationService: INotificationService,
    private router: Router,
    private mainNav: MainNavService,
  ) { }

  async ngOnInit(): Promise<void> {
    const split = this.mainNav.getSplit(DESKTOP_PRIMARY_MAX);
    this.primaryNavItems = split.primary;
    this.moreNavItems = split.more;
    this.currentUrl = this.router.url;

    this.subscriptions.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(e => {
          this.currentUrl = e.urlAfterRedirects;
          this.closeMoreMenu();
        })
    );

    this.notificationService.refreshUnreadCount();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  isNavActive(item: MainNavItem): boolean {
    return this.mainNav.isPrimaryActive(item, this.currentUrl);
  }

  isMoreNavActive(): boolean {
    return this.mainNav.isMoreGroupActive(this.moreNavItems, this.currentUrl, this.moreMenuOpen);
  }

  isMoreItemActive(item: MainNavItem): boolean {
    return this.mainNav.isActive(item.prefixes, this.currentUrl);
  }

  toggleMoreMenu(event: Event): void {
    event.stopPropagation();
    this.moreMenuOpen = !this.moreMenuOpen;
  }

  closeMoreMenu(): void {
    this.moreMenuOpen = false;
  }

  onMoreItemClick(item: MainNavItem): void {
    this.closeMoreMenu();
    if (item.action === 'logout') {
      this.logout();
    }
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    this.closeMoreMenu();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMoreMenu();
  }

  logout() {
    this.modalService.openNotificationModal(LOGOUT_DIALOG, 'confirmation', 'warning').onAccept$.subscribe(() => {
      this.identityService.logout();
    });
  }
}
