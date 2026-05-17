/**
 * Performs a fuzzy search on a string.
 * Returns true if the characters in the query appear in the text in the same order.
 * Case-insensitive.
 */
export function fuzzySearch(text: string, query: string): boolean {
  if (!text || !query) return false;
  const target = text.toLowerCase();
  const search = query.toLowerCase();
  
  let searchIdx = 0;
  for (let i = 0; i < target.length; i++) {
    if (target[i] === search[searchIdx]) {
      searchIdx++;
    }
    if (searchIdx === search.length) {
      return true;
    }
  }
  return false;
}
