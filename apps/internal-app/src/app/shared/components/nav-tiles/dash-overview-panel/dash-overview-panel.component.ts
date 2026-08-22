import { Component, Input } from '@angular/core';
import { NavTileConfig } from '../nav-tile.model';

@Component({
  selector: 'app-dash-overview-panel',
  templateUrl: './dash-overview-panel.component.html',
  styleUrls: ['./dash-overview-panel.component.scss'],
  standalone: false,
})
export class DashOverviewPanelComponent {
  @Input({ required: true }) tiles: NavTileConfig[] = [];
}
