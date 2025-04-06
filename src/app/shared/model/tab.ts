import { OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { Component } from '@angular/core';

@Component({
  template: 'app-base-tabbed-page',
})
export abstract class TabbedPage<T> implements OnInit {
  tabIndex: number = 0;
  abstract tabMapping: T[];

  constructor(protected route: ActivatedRoute) {}

  ngOnInit(): void {
    this.initializeTabIndex();
    this.handleRouteData();
  }

  /**
   * Initializes the tab index based on the route data.
   */
  private initializeTabIndex(): void {
    const tab = this.route.snapshot.data['tab'] as T | undefined;
    if (tab) {
      this.tabMapping.forEach((value: T, key: number) => {
        if (tab === value) {
          this.tabIndex = key;
        }
      });
    }
  }

  /**
   * Handles additional route data (e.g., reference data).
   */
  abstract handleRouteData(): void;

  /**
   * Handles tab changes.
   * @param index The new tab index.
   */
  tabChanged(index: number): void {
    this.tabIndex = index;
    this.onTabChanged();
  }

  /**
   * Hook for child classes to handle tab changes.
   */
  abstract onTabChanged(): void;

}