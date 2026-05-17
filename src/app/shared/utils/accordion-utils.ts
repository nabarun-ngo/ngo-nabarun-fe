import { Params } from '@angular/router';

/**
 * Extracts query parameters starting with 'filter' and removes the prefix.
 * Useful for server-side filtering in Resolvers or Components.
 * 
 * @param params Query parameters from ActivatedRoute or ActivatedRouteSnapshot
 * @returns Object with extracted filters
 */
export function getUrlFilters(params: Params): { [key: string]: string } {
  const filters: { [key: string]: string } = {};
  if (!params) return filters;

  Object.keys(params).forEach(key => {
    if (key.startsWith('filter')) {
      const rawKey = key.substring(6); // Remove 'filter'
      if (rawKey) {
        // We keep the case of the remaining string as it is.
        filters[rawKey] = params[key];
      }
    }
  });
  return filters;
}
