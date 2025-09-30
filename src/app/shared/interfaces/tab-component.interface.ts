import { AfterViewInit } from '@angular/core';
import { KeyValue } from 'src/app/core/api/models';

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

/**
 * Standard search event structure
 */
export interface SearchEvent {
  buttonName?: string;
  advancedSearch: boolean;
  reset: boolean;
  value: any;
}