import { Component, Input } from '@angular/core';
import { NavTileConfig, NavTileVariant } from '../nav-tile.model';

@Component({
  selector: 'app-nav-tile',
  templateUrl: './nav-tile.component.html',
  styleUrls: ['./nav-tile.component.scss'],
  standalone: false,
})
export class NavTileComponent {
  @Input({ required: true }) tile!: NavTileConfig;
  @Input() variant: NavTileVariant = 'access';

  get linkClasses(): Record<string, boolean> {
    if (this.variant === 'hub') {
      return {
        'finance-hub__tile': true,
        [`finance-hub__tile--${this.tile.icon}`]: true,
      };
    }

    return {
      'qa-tile': true,
      [`qa-tile--${this.tile.icon}`]: true,
    };
  }

  get iconWrapClasses(): Record<string, boolean> {
    return this.variant === 'hub'
      ? { 'finance-hub__icon': true }
      : { 'qa-tile__icon': true };
  }
}
