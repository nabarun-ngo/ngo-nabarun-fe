/**
 * Generic paged result model
 * Reusable for all paginated API responses
 */

export class PagedResult<T> {
  content?: T[];
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
}

/**
 * Generic interface for API paged results
 * Used by mapper functions to convert API paged results to domain paged results
 */
export interface ApiPagedResult<T> {
  content?: T[];
  totalSize?: number;
  pageIndex?: number;
  pageSize?: number;
  currentSize?: number;
  totalPages?: number;
  nextPageIndex?: number;
  prevPageIndex?: number;
}

/**
 * Generic mapper function to convert API paged results to domain paged results
 * @param apiResult The API paged result
 * @param itemMapper Function to map each item from API model to domain model
 * @returns Domain paged result
 */
export function mapPagedResult<TDto, TDomain>(
  apiResult: ApiPagedResult<TDto>,
  itemMapper: (dto: TDto) => TDomain
): PagedResult<TDomain> {
  return {
    content: apiResult.content?.map(itemMapper) ?? [],
    totalSize: apiResult.totalSize ?? 0,
    pageIndex: apiResult.pageIndex ?? 0,
    pageSize: apiResult.pageSize ?? 0,
  };
}

