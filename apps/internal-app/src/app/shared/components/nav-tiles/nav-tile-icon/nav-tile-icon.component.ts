import { Component, Input } from '@angular/core';
import { NavTileIcon } from '../nav-tile.model';

@Component({
  selector: 'app-nav-tile-icon',
  templateUrl: './nav-tile-icon.component.html',
  styleUrls: ['./nav-tile-icon.component.scss'],
  standalone: false,
})
export class NavTileIconComponent {
  @Input({ required: true }) icon!: NavTileIcon;
}
