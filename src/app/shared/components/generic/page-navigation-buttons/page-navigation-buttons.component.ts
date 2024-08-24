import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-page-navigation-buttons',
  templateUrl: './page-navigation-buttons.component.html',
  styleUrls: ['./page-navigation-buttons.component.scss']
})
export class PageNavigationButtonsComponent {

  @Input()
  navigations: { displayName: string; routerLink: string }[] = [];

}
