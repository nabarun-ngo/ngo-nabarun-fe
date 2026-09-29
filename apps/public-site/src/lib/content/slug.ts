/**
 * URL slug for API-supplied titles, e.g. `Orphan & Old Age Home Support`
 * becomes `orphan-and-old-age-home-support`.
 */
export function toSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Detail path for a project, honouring the configured `/projects/` base path. */
export function projectDetailPath(basePath: string, slug: string): string {
  const base = basePath.endsWith('/') ? basePath : `${basePath}/`
  return `${base}${slug}/`
}
