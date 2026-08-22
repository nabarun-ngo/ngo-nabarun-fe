import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { NavTileConfig } from 'src/app/shared/components/nav-tiles/nav-tile.model';

interface AdminHubSection {
  id: string;
  title: string;
  tiles: NavTileConfig[];
}

@Component({
  selector: 'app-admin-hub',
  templateUrl: './admin-hub.component.html',
  styleUrls: ['./admin-hub.component.scss'],
  standalone: false,
})
export class AdminHubComponent implements OnInit {
  protected sections: AdminHubSection[] = [];

  constructor(
    private sharedDataService: SharedDataService,
    private authorization: AuthorizationService,
  ) {}

  ngOnInit(): void {
    this.sharedDataService.setPageName('Admin Console');
    this.buildSections();
  }

  private buildSections(): void {
    const perms = this.authorization.effectivePermissions();
    const has = (scope: string) => perms.includes(scope);
    const back = {
      backTo: AppRoute.secured_admin_hub_page.url,
      backLabel: 'Admin',
    };

    this.sections = [
      {
        id: 'platform',
        title: 'Platform Ops',
        tiles: [
          {
            id: 'api-keys',
            label: 'API Keys',
            description: 'Generate and revoke service API keys',
            link: AppRoute.secured_admin_api_keys_page.url,
            queryParams: back,
            icon: 'icon_code',
            hidden: !has(SCOPE.read.apikey),
          },
          {
            id: 'oauth',
            label: 'OAuth Tokens',
            description: 'Manage integration OAuth connections',
            link: AppRoute.secured_admin_oauth_page.url,
            queryParams: back,
            icon: 'icon_globe',
            hidden: !has(SCOPE.read.oauth_token),
          },
          {
            id: 'jobs',
            label: 'Background Jobs',
            description: 'Inspect and retry queue jobs',
            link: AppRoute.secured_admin_jobs_page.url,
            queryParams: back,
            icon: 'activities',
            hidden: !has(SCOPE.read.jobs),
          },
          {
            id: 'cron',
            label: 'Cron Jobs',
            description: 'Schedule definitions and run-now',
            link: AppRoute.secured_admin_cron_jobs_page.url,
            queryParams: back,
            icon: 'milestones',
            hidden: !has(SCOPE.read.cron),
          },
          {
            id: 'notifications',
            label: 'Notification Audit',
            description: 'Review and resend notifications',
            link: AppRoute.secured_admin_notifications_page.url,
            queryParams: back,
            icon: 'icon_comment',
            hidden: !has(SCOPE.read.notifications),
          },
        ],
      },
      {
        id: 'configuration',
        title: 'Configuration',
        tiles: [
          {
            id: 'roles',
            label: 'Roles Catalog',
            description: 'Manage roles, permissions, groups, and mappings',
            link: AppRoute.secured_admin_roles_page.url,
            queryParams: back,
            icon: 'icon_book',
            hidden: !(has(SCOPE.read.roles) || has(SCOPE.read.permissions) || has(SCOPE.read.role_groups)),
          },
          {
            id: 'json-store',
            label: 'JSON Store',
            description: 'Lookups, catalogs, templates, and site content — all namespaces',
            link: AppRoute.secured_admin_json_store_page.url,
            queryParams: back,
            icon: 'reports',
            hidden: !has(SCOPE.read.json_documents),
          },
          {
            id: 'forms',
            label: 'Custom Forms',
            description: 'Form definitions, publish, and disable',
            link: AppRoute.secured_admin_custom_forms_page.url,
            queryParams: back,
            icon: 'icon_presentation',
            hidden: !has(SCOPE.read.custom_forms),
          },
        ],
      },
    ];
  }

  protected visibleTiles(tiles: NavTileConfig[]): NavTileConfig[] {
    return tiles.filter(t => !t.hidden);
  }
}
