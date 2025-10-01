import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabComponentInterface } from '../interfaces/tab-component.interface';
import { StandardDashboard } from './standard-dashboard';
import { SearchEvent } from '../components/search-and-advanced-search-form/search-event.model';

/**
 * Standardized base class for all tabbed dashboard components.
 * Provides consistent patterns for:
 * - Resolver data consumption
 * - Tab component management
 * - Search forwarding
 * - Data distribution
 */
@Component({
  template: ''
})
export abstract class StandardTabbedDashboard<TTab extends string | number, TData=any>
  extends StandardDashboard<TData>
  implements AfterViewInit,OnInit {

  protected tabIndex: number = 0;
  protected abstract tabMapping: TTab[];

  /**
   * Track visited tabs for lazy loading (optional feature)
   */
  protected visitedTabs: Set<TTab> = new Set();

  /**
   * Map of tab types to their corresponding components
   * Must be implemented by child classes
   */
  protected abstract get tabComponents(): { [key in TTab]?: TabComponentInterface<TData> };

  /**
   * Default tab that receives initial resolver data
   * Must be implemented by child classes
   */
  protected abstract get defaultTab(): TTab;

  constructor(protected override route: ActivatedRoute) {super(route);}


  override ngOnInit(): void {
    this.initializeTabIndex();
    super.ngOnInit();
  }

  /**
   * Initializes the tab index based on the route data.
   */
  private initializeTabIndex(): void {
    const tab = this.route.snapshot.data['tab'] as TTab | undefined;
    if (tab) {
      this.tabMapping.forEach((value: TTab, key: number) => {
        if (tab === value) {
          this.tabIndex = key;
        }
      });
    }
  }

  /**
   * Standard tab change handling
   */
  protected tabChanged(index: number): void {
    this.tabIndex = index;
    // Mark current tab as visited for lazy loading
    this.visitedTabs.add(this.getCurrentTab());

    // Allow child classes to perform tab-specific operations
    // Trigger data load in the newly active tab after a slight delay to ensure view is updated
    setTimeout(() => {
      this.tabComponents[this.getCurrentTab()]?.loadData();
      this.onTabChangedHook();
    });

    // Child components will handle their own data loading
    // No direct API calls from parent needed
  }

  /**
   * Standard search forwarding to active tab
   */
  protected forwardSearchToActiveTab(event: SearchEvent): void {
    const currentTab = this.getCurrentTab();
    const activeTabComponent = this.tabComponents[currentTab];

    if (activeTabComponent) {
      activeTabComponent.onSearch(event);
    }
  }

  /**
   * Get initial data for a specific tab
   * Returns data only if it matches the default tab (from resolver)
   */
  protected getInitialDataForTab(tabType: TTab): TData | undefined {
    if (!this.initialData) {
      return undefined;
    }

    // Only return initial data for the default tab
    return tabType === this.defaultTab ? this.initialData : undefined;
  }

  /**
   * Get the current active tab
   */
  protected getCurrentTab(): TTab {
    return this.tabMapping[this.tabIndex];
  }

  /**
   * Check if the given tab is currently active
   */
  protected isActiveTab(tab: TTab): boolean {
    return this.getCurrentTab() === tab;
  }

  /**
   * Check if a tab should be loaded (for lazy loading)
   * Override this method to implement custom lazy loading logic
   */
  protected shouldLoadTab(tab: TTab): boolean {
    return this.visitedTabs.has(tab);
  }

  // Hooks for child classes to implement

  /**
   * Hook called during route data handling
   * Override in child classes for additional route data processing
   */
  protected override onHandleRouteDataHook(): void {
    // Mark initial tab as visited for lazy loading
    this.visitedTabs.add(this.getCurrentTab());
    super.onHandleRouteDataHook();
    // Default implementation - no action needed
  }

  /**
   * Hook called when tab changes
   * Override in child classes for tab-specific operations
   */
  protected abstract onTabChangedHook(): void;
}
