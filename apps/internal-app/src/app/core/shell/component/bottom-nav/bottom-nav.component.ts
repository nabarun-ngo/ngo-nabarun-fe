import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { setMobileSheetOpen } from 'src/app/shared/utils/mobile-sheet-body-lock';
import { IUserIdentityService } from '../../../auth/tokens/user-identity.token';
import { ModalService } from '../../service/modal.service';
import { MainNavItem } from '../../navigation/main-nav.model';
import { MainNavService, MOBILE_PRIMARY_MAX } from '../../navigation/main-nav.service';

const LOGOUT_DIALOG = {
  title: 'Confirm Logout',
  description: 'Are you sure to logout from current session ?',
};

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.component.html',
  styleUrls: ['./bottom-nav.component.scss'],
  standalone: false,
})
export class BottomNavComponent implements OnInit, OnDestroy {
  protected currentUrl = '';
  protected moreMenuOpen = false;
  protected primaryItems: MainNavItem[] = [];
  protected moreMenuItems: MainNavItem[] = [];
  private sub = new Subscription();

  constructor(
    private router: Router,
    private mainNav: MainNavService,
    private modalService: ModalService,
    @Inject(IUserIdentityService) private identityService: IUserIdentityService,
  ) {}

  ngOnInit(): void {
    const split = this.mainNav.getSplit(MOBILE_PRIMARY_MAX);
    this.primaryItems = split.primary;
    this.moreMenuItems = split.more;
    this.currentUrl = this.router.url;
    this.sub.add(
      this.router.events
        .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
        .subscribe(e => {
          this.currentUrl = e.urlAfterRedirects;
          if (this.moreMenuOpen) {
            this.closeMoreMenu();
          }
        })
    );
  }

  ngOnDestroy(): void {
    if (this.moreMenuOpen) {
      setMobileSheetOpen(false);
    }
    this.sub.unsubscribe();
  }

  isTabActive(item: MainNavItem): boolean {
    return this.mainNav.isPrimaryActive(item, this.currentUrl);
  }

  isMoreTabActive(): boolean {
    return this.mainNav.isMoreGroupActive(this.moreMenuItems, this.currentUrl, this.moreMenuOpen);
  }

  isMoreItemActive(item: MainNavItem): boolean {
    return this.mainNav.isActive(item.prefixes, this.currentUrl);
  }

  toggleMoreMenu(event: Event): void {
    event.stopPropagation();
    this.moreMenuOpen = !this.moreMenuOpen;
    setMobileSheetOpen(this.moreMenuOpen);
  }

  closeMoreMenu(): void {
    if (!this.moreMenuOpen) {
      return;
    }
    this.moreMenuOpen = false;
    setMobileSheetOpen(false);
  }

  onMoreItemClick(item: MainNavItem): void {
    this.closeMoreMenu();
    if (item.action === 'logout') {
      this.modalService
        .openNotificationModal(LOGOUT_DIALOG, 'confirmation', 'warning')
        .onAccept$.subscribe(() => {
          this.identityService.logout();
        });
    }
  }
}
