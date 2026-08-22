import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared/shared.module';
import { SharedFormsModule } from 'src/app/shared/modules/forms.module';
import { AssetsRoutingModule } from './assets-routing.module';
import { AssetsHubComponent } from './assets-hub/assets-hub.component';
import { AssetDashboardComponent } from './asset/page/asset-dashboard.component';
import { BookDashboardComponent } from './book/page/book-dashboard.component';
import { provideAssetFeatureInfrastructure } from './assets.providers';

@NgModule({
  declarations: [
    AssetsHubComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    SharedFormsModule,
    AssetDashboardComponent,
    BookDashboardComponent,
    AssetsRoutingModule,
  ],
  providers: [
    ...provideAssetFeatureInfrastructure(),
  ],
})
export class AssetsModule { }
