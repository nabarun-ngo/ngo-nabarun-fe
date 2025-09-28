import { Observable } from 'rxjs';
import { KeyValue } from 'src/app/core/api/models';

/**
 * Standard interface that all tab components should implement
 */
export interface TabComponentInterface<TData = any> {
  /**
   * Initial data passed from parent component (usually from resolver)
   */
  initialData?: TData;

  /**
   * Initial data passed from parent component (usually from resolver)
   */
  refData?: { [key: string]: KeyValue[] };

  /**
   * Handle search operations for this tab
   */
  onSearch(event: SearchEvent): void;

  /**
   * Load data for this tab (called when no initial data is provided)
   */
  loadData(): void;
}

/**
 * Standard search event structure
 */
export interface SearchEvent {
  buttonName?: string;
  advancedSearch: boolean;
  reset: boolean;
  value: any;
}

/**
 * Base configuration for tab components
 */
export interface TabComponentConfig<TData = any> {
  /**
   * Reference to the tab component instance
   */
  component: TabComponentInterface<TData>;

  /**
   * Initial data for this tab (if available)
   */
  initialData?: TData;
}
