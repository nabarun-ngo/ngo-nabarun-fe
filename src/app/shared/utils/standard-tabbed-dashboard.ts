import { AfterViewInit, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TabbedPage } from './tab';
import { SearchEvent, TabComponentInterface } from '../interfaces/tab-component.interface';

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
export abstract class StandardTabbedDashboard<TTab extends string | number, TData = any> 
  extends TabbedPage<TTab> 
  implements AfterViewInit {

  /**
   * Initial data from resolver (if available)
   */
  protected initialData?: TData;

  /**
   * Reference data from resolver (if available)
   */
  protected refData?: { [key: string]: any };

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

  constructor(protected override route: ActivatedRoute) {
    super(route);
  }

  ngAfterViewInit(): void {
    // Allow child components to perform additional initialization
    this.onAfterViewInit();
  }

  /**
   * Handle resolver data in a standardized way
   */
  override handleRouteData(): void {
    // Extract data from resolver
    if (this.route.snapshot.data['data']) {
      this.initialData = this.route.snapshot.data['data'] as TData;
    }
    
    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
    }

    // Allow child classes to perform additional route data handling
    this.onHandleRouteData();
  }

  /**
   * Standard tab change handling
   */
  protected override onTabChanged(): void {
    // Mark current tab as visited for lazy loading
    this.visitedTabs.add(this.getCurrentTab());
    
    // Allow child classes to perform tab-specific operations
    this.onTabChangedHook();
    
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
   * Hook called after view initialization
   * Override in child classes for additional setup
   */
  protected onAfterViewInit(): void {
    // Default implementation - no action needed
  }

  /**
   * Hook called during route data handling
   * Override in child classes for additional route data processing
   */
  protected onHandleRouteData(): void {
    // Mark initial tab as visited for lazy loading
    this.visitedTabs.add(this.getCurrentTab());
    // Default implementation - no action needed
  }

  /**
   * Hook called when tab changes
   * Override in child classes for tab-specific operations
   */
  protected onTabChangedHook(): void {
    // Default implementation - no action needed
  }

  /**
   * Abstract method for handling search events
   * Must be implemented by child classes
   */
  abstract onSearch(event: SearchEvent): void;
}
