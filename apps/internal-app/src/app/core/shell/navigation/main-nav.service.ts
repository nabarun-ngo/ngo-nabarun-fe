import { Injectable } from '@angular/core';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { AppRoute } from '../../constant/app-routing.const';
import { SCOPE } from '../../constant/auth-scope.const';
import { MainNavItem } from './main-nav.model';

/** Bottom nav: keep room for the More tab. */
export const MOBILE_PRIMARY_MAX = 4;
/** Desktop header: primary links before overflow into More. */
export const DESKTOP_PRIMARY_MAX = 5;

export interface MainNavSplit {
  primary: MainNavItem[];
  more: MainNavItem[];
}

@Injectable({ providedIn: 'root' })
export class MainNavService {
  constructor(private authorization: AuthorizationService) {}

  /**
   * Visible nav split: first `maxPrimary` routable items are primary;
   * the rest (including Logout) go under More.
   */
  getSplit(maxPrimary: number): MainNavSplit {
    const visible = this.visibleItems(this.getAllItems());
    const routable = visible.filter(item => item.action !== 'logout');
    const actions = visible.filter(item => item.action === 'logout');

    const primary = routable.slice(0, maxPrimary);
    const more = [...routable.slice(maxPrimary), ...actions];

    return { primary, more };
  }

  getPrimaryItems(maxPrimary: number = MOBILE_PRIMARY_MAX): MainNavItem[] {
    return this.getSplit(maxPrimary).primary;
  }

  getMoreItems(maxPrimary: number = MOBILE_PRIMARY_MAX): MainNavItem[] {
    return this.getSplit(maxPrimary).more;
  }

  visibleItems(items: MainNavItem[]): MainNavItem[] {
    return items.filter(item => !item.hidden);
  }

  isActive(prefixes: string[], currentUrl: string): boolean {
    return prefixes.some(prefix => currentUrl.startsWith(prefix));
  }

  isPrimaryActive(item: MainNavItem, currentUrl: string): boolean {
    if (item.id === 'home') {
      const dashboardUrl = AppRoute.secured_dashboard_page.url;
      return currentUrl === dashboardUrl || currentUrl === `${dashboardUrl}/`;
    }

    if (item.id === 'finance') {
      return this.isHubRouteActive(AppRoute.secured_finance_hub_page.url, currentUrl);
    }

    if (item.id === 'projects') {
      return this.isHubRouteActive(AppRoute.secured_project_hub_page.url, currentUrl);
    }

    if (item.id === 'assets') {
      return this.isHubRouteActive(AppRoute.secured_assets_hub_page.url, currentUrl);
    }

    return item.prefixes.some(prefix => currentUrl.startsWith(prefix));
  }

  isMoreGroupActive(moreItems: MainNavItem[], currentUrl: string, moreMenuOpen = false): boolean {
    if (moreMenuOpen) {
      return true;
    }
    const prefixes = moreItems
      .filter(item => !item.action)
      .flatMap(item => item.prefixes);
    return this.isActive(prefixes, currentUrl);
  }

  private getAllItems(): MainNavItem[] {
    const perms = this.authorization.effectivePermissions();

    return [
      {
        id: 'home',
        label: 'Dashboard',
        url: AppRoute.secured_dashboard_page.url,
        prefixes: [AppRoute.secured_dashboard_page.url],
        icon: 'M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z',
      },
      {
        id: 'finance',
        label: 'Finance',
        url: AppRoute.secured_finance_hub_page.url,
        prefixes: [AppRoute.secured_finance_hub_page.url],
        icon: 'M5 9.2h3V19H5zM10.6 5h2.8v14h-2.8zm5.6 8H19v6h-2.8z',
      },
      {
        id: 'members',
        label: 'Members',
        url: AppRoute.secured_member_members_page.url,
        prefixes: [AppRoute.secured_member_profile_page.url],
        icon: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z',
      },
      {
        id: 'projects',
        label: 'Projects',
        url: AppRoute.secured_project_hub_page.url,
        prefixes: [AppRoute.secured_project_hub_page.url],
        icon: 'M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z',
        hidden: !perms.includes(SCOPE.read.projects),
      },
      {
        id: 'assets',
        label: 'Assets',
        url: AppRoute.secured_assets_hub_page.url,
        prefixes: [AppRoute.secured_assets_hub_page.url],
        icon: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z',
        hidden: !perms.includes(SCOPE.read.assets),
      },
      {
        id: 'requests',
        label: 'Requests',
        url: AppRoute.secured_request_list_page.url,
        prefixes: [AppRoute.secured_request_list_page.url],
        icon: 'M22 12h-4l-3 9L9 3l-3 9H2',
        hidden: !perms.includes(SCOPE.read.requests),
      },
      {
        id: 'meetings',
        label: 'Events & Meetings',
        url: AppRoute.secured_meetings_list_page.url,
        prefixes: [AppRoute.secured_meetings_list_page.url],
        icon: 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z',
        hidden: !perms.includes(SCOPE.read.meetings),
      },
      {
        id: 'admin',
        label: 'Admin Console',
        url: AppRoute.secured_admin_hub_page.url,
        prefixes: [AppRoute.secured_admin_hub_page.url],
        icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z',
        hidden: ![
          SCOPE.read.apikey,
          SCOPE.read.cron,
          SCOPE.read.jobs,
          SCOPE.read.oauth_token,
          SCOPE.read.notifications,
          SCOPE.read.users,
          SCOPE.read.user_roles,
          SCOPE.read.roles,
          SCOPE.read.json_documents,
          SCOPE.read.custom_forms,
        ].some(p => perms.includes(p)),
      },
      {
        id: 'help',
        label: 'Help',
        url: AppRoute.secured_help_home_page.url,
        prefixes: [AppRoute.secured_help_home_page.url],
        icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z',
      },
      {
        id: 'logout',
        label: 'Logout',
        url: '',
        prefixes: [],
        action: 'logout',
        icon: 'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
      },
    ];
  }

  private isHubRouteActive(hubUrl: string, currentUrl: string): boolean {
    return currentUrl === hubUrl
      || currentUrl === `${hubUrl}/`
      || currentUrl.startsWith(`${hubUrl}/`)
      || currentUrl.startsWith(`${hubUrl}?`);
  }
}
