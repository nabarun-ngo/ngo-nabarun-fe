import { Component, OnInit } from '@angular/core';
import { AuthorizationService } from '@nabarun-ngo/auth-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';
import { NavTileConfig } from 'src/app/shared/components/nav-tiles/nav-tile.model';

@Component({
  selector: 'app-assets-hub',
  templateUrl: './assets-hub.component.html',
  styleUrls: ['./assets-hub.component.scss'],
  standalone: false,
})
export class AssetsHubComponent implements OnInit {
  protected navTiles: NavTileConfig[] = [];

  constructor(
    private sharedDataService: SharedDataService,
    private authorization: AuthorizationService,
  ) {}

  ngOnInit(): void {
    this.sharedDataService.setPageName('Assets');
    this.buildTiles();
  }

  private buildTiles(): void {
    const perms = this.authorization.effectivePermissions();
    const assetsBackParams = {
      backTo: AppRoute.secured_assets_hub_page.url,
      backLabel: 'Assets',
    };

    this.navTiles = [
      {
        id: 'assets',
        label: 'Physical assets',
        description: 'Register, assign and track physical assets',
        link: AppRoute.secured_assets_list_page.url,
        queryParams: assetsBackParams,
        icon: 'milestones',
        hidden: !perms.includes(SCOPE.read.assets),
      },
      {
        id: 'books',
        label: 'Library',
        description: 'Book bank — lend, return and track books',
        link: AppRoute.secured_books_list_page.url,
        queryParams: assetsBackParams,
        icon: 'icon_book',
        hidden: !perms.includes(SCOPE.read.books),
      },
    ];
  }
}
