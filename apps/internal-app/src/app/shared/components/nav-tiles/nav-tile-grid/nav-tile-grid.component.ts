import { Component, Input } from '@angular/core';
import {
  NavTileConfig,
  NavTileGridLayout,
  NavTileVariant,
} from '../nav-tile.model';

@Component({
  selector: 'app-nav-tile-grid',
  templateUrl: './nav-tile-grid.component.html',
  styleUrls: ['./nav-tile-grid.component.scss'],
  standalone: false,
})
export class NavTileGridComponent {
  @Input({ required: true }) tiles: NavTileConfig[] = [];
  @Input() variant: NavTileVariant = 'access';
  @Input() layout: NavTileGridLayout = 'access';
  @Input() emptyMessage = '';

  get visibleTiles(): NavTileConfig[] {
    return this.tiles.filter(tile => !tile.hidden);
  }

  get gridClasses(): Record<string, boolean> {
    return {
      'finance-hub__grid': this.layout === 'hub',
    };
  }

  get emptyClass(): string {
    return this.layout === 'hub' ? 'finance-hub__empty' : 'qa-empty';
  }
}
