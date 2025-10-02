/**
 * Standard search event structure
 */
export interface SearchEvent {
  buttonName?: 'SEARCH' | 'CLOSE' | 'ADVANCED_SEARCH';
  advancedSearch: boolean;
  reset: boolean;
  value: any;
}