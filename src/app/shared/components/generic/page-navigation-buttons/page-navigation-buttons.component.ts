import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-page-navigation-buttons',
  templateUrl: './page-navigation-buttons.component.html',
  styleUrls: ['./page-navigation-buttons.component.scss']
})
export class PageNavigationButtonsComponent {

  @Input()
  navigations: NavigationButtonModel[] = [];

  @Output()
  onClick:EventEmitter<NavigationButtonModel>=new EventEmitter()
}

export interface NavigationButtonModel {
  buttonId?: string;
  displayName: string; 
  routerLink?: string
}
