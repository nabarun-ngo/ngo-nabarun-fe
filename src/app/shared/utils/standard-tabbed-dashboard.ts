import { AfterViewInit, Component, inject, DestroyRef, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TabComponentInterface } from '../interfaces/tab-component.interface';
import { StandardDashboard } from './standard-dashboard';
import { SearchEvent } from '../components/search-and-advanced-search-form/search-event.model';
import { Final } from './final';



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
export abstract class StandardTabbedDashboard<TTab extends string | number, TData>
  extends StandardDashboard<TData>
  implements AfterViewInit, OnInit {

  #tabIndex: number = 0;

  get tabIndex(): number {
    return this.#tabIndex;
  }

  set tabIndex(value: number) {
    this.#tabIndex = value;
  }

  protected abstract tabMapping: TTab[];

  /**
   * Track visited tabs for lazy loading (optional feature)
   */
  #visitedTabs: Set<TTab> = new Set();

  /**
   * Map of tab types to their corresponding components
   * Must be implemented by child classes
   */
  /**
   * Reference to dynamically loaded components
   */
  private dynamicTabComponents = new Map<TTab, TabComponentInterface<TData>>();

  /**
   * Map of tab types to their corresponding components
   * Must be implemented by child classes
   */
  protected abstract get tabComponents(): { [key in TTab]?: TabComponentInterface<TData> };

  /**
   * Register a dynamically loaded tab component.
   * Call this from the template when using dynamic rendering.
   */
  onDynamicTabActivated(id: TTab, instance: TabComponentInterface<TData>): void {
    this.dynamicTabComponents.set(id, instance);
  }

  /**
   * Helper to get component from either static definition or dynamic registry
   */
  protected getActiveComponent(tab: TTab): TabComponentInterface<TData> | undefined {
    return this.tabComponents[tab] || this.dynamicTabComponents.get(tab);
  }

  /**
   * Default tab that receives initial resolver data
   * Must be implemented by child classes
   */
  protected abstract get defaultTab(): TTab;

  constructor(protected override route: ActivatedRoute) { super(route); }


  protected readonly router = inject(Router);
  protected readonly destroyRef = inject(DestroyRef);

  override ngOnInit(): void {
    this.initializeTabIndex();
    super.ngOnInit();

    // Subscribe to query params to handle tab changes (including back/forward button)
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        const tab = params['tab'] as TTab | undefined;
        if (tab) {
          this.handleTabChangeFromUrl(tab);
        }
      });
  }

  /**
   * Initializes the tab index based on the route data.
   */
  private initializeTabIndex(): void {
    const tab = this.route.snapshot.queryParams['tab'] as TTab | undefined;
    if (tab) {
      this.tabMapping.forEach((value: TTab, key: number) => {
        if (tab === value) {
          this.tabIndex = key;
        }
      });
    }
  }

  /**
   * Handle tab change triggered by URL updates
   */
  private handleTabChangeFromUrl(tab: TTab): void {
    const index = this.tabMapping.indexOf(tab);
    if (index !== -1 && index !== this.tabIndex) {
      this.tabIndex = index;
      this.#visitedTabs.add(tab);

      // Trigger data load and hooks
      setTimeout(() => {
        this.getActiveComponent(tab)?.loadData();
        this.onTabChangedHook();
      });
    }
  }

  protected tabChanged: Final<(index: number) => void> = (index: number) => {
    // Navigate to update the URL
    // The subscription will handle the actual state update if needed,
    // but we also update local state immediately for responsiveness if relying on binding
    const tab = this.tabMapping[index];

    // Update URL which will trigger the subscription
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      queryParamsHandling: 'merge',
    });

    // Also run immediate logic in case the navigation is ignored (e.g. same URL)
    // or to ensure immediate UI feedback patterns that might rely on side effects
    this.tabIndex = index;
    this.#visitedTabs.add(tab);

    setTimeout(() => {
      this.getActiveComponent(tab)?.loadData();
      this.onTabChangedHook();
    });
  };

  /**
   * Standard search forwarding to active tab
   */
  protected forwardSearchToActiveTab(event: SearchEvent): void {
    const currentTab = this.getCurrentTab();
    const activeTabComponent = this.getActiveComponent(currentTab);

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
    return this.#visitedTabs.has(tab);
  }

  // Hooks for child classes to implement

  /**
   * Hook called during route data handling
   * Override in child classes for additional route data processing
   */
  protected override onHandleRouteDataHook(): void {
    // Mark initial tab as visited for lazy loading
    this.#visitedTabs.add(this.getCurrentTab());
    super.onHandleRouteDataHook();
    // Default implementation - no action needed
  }

  /**
   * Hook called when tab changes
   * Override in child classes for tab-specific operations
   */
  protected abstract onTabChangedHook(): void;
}
