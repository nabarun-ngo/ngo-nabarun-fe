import { SearchEvent } from "../components/search-and-advanced-search-form/search-event.model";

/**
 * Standard interface that all tab components should implement
 */
export interface TabComponentInterface<TData = any> {
  /**
   * Handle search operations for this tab
   */
  onSearch($event: SearchEvent): void;

  /**
   * Load data for this tab (called when no initial data is provided or on tab switch)
   */
  loadData(): void;
}

