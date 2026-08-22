import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { SharedMaterialModule } from './material.module';
import { NavBackComponent } from '../components/nav-back/nav-back.component';
import { NavTileIconComponent } from '../components/nav-tiles/nav-tile-icon/nav-tile-icon.component';
import { NavTileComponent } from '../components/nav-tiles/nav-tile/nav-tile.component';
import { NavTileGridComponent } from '../components/nav-tiles/nav-tile-grid/nav-tile-grid.component';
import { DashOverviewPanelComponent } from '../components/nav-tiles/dash-overview-panel/dash-overview-panel.component';

@NgModule({
  declarations: [
    NavTileIconComponent,
    NavTileComponent,
    NavTileGridComponent,
    DashOverviewPanelComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedMaterialModule,
    NavBackComponent,
  ],
  exports: [
    NavTileIconComponent,
    NavTileComponent,
    NavTileGridComponent,
    DashOverviewPanelComponent,
    NavBackComponent,
  ],
})
export class SharedNavigationModule {}
