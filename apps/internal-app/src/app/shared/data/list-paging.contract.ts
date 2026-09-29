/**
 * Describes where list filtering and paging are executed.
 *
 * `clientRoster` is a compatibility mode for endpoints that only return a
 * complete collection. It must not be presented as true server pagination.
 */
// TODO: drop clientRoster / serverWithClientFilter once list APIs accept
// pageIndex, pageSize, search, and filters (team roster; expenseRefType).
export type ListPagingMode =
  | 'server'
  | 'serverWithClientFilter'
  | 'clientRoster';
