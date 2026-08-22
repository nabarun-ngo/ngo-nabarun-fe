import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { permissionGuard } from '@nabarun-ngo/auth-angular';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import { AssetDashboardComponent } from './asset/page/asset-dashboard.component';
import { assetRefDataResolver } from './asset/data/asset.resolver';
import { BookDashboardComponent } from './book/page/book-dashboard.component';
import { bookRefDataResolver } from './book/data/book.resolver';
import { AssetsHubComponent } from './assets-hub/assets-hub.component';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_assets_hub_page.path,
    component: AssetsHubComponent,
  },
  {
    path: route_data.secured_assets_list_page.path,
    component: AssetDashboardComponent,
    canActivate: [permissionGuard(SCOPE.read.assets)],
    resolve: {
      ref_data: assetRefDataResolver,
    },
  },
  {
    path: route_data.secured_books_list_page.path,
    component: BookDashboardComponent,
    canActivate: [permissionGuard(SCOPE.read.books)],
    resolve: {
      ref_data: bookRefDataResolver,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AssetsRoutingModule { }
