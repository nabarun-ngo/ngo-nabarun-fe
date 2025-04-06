import { Component, Input } from '@angular/core';
import { NavigationButtonModel } from '../../components/generic/page-navigation-buttons/page-navigation-buttons.component';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

@Component({
  selector: 'app-page-layout',
  templateUrl: './page-layout.component.html',
  styleUrls: ['./page-layout.component.scss']
})
export class PageLayoutComponent {

  @Input() navigations: NavigationButtonModel[]  = [];

}

export interface PageNavigation {
  navigations: NavigationButtonModel[];
}
