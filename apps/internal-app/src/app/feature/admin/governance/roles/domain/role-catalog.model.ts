export type RoleCatalogKind = 'role' | 'group' | 'permission';

/** Union view over roles, role-groups, and permissions for one list-dashboard. */
export interface RoleCatalogItem {
  id: string;
  kind: RoleCatalogKind;
  key: string;
  description?: string;
  /** Permission keys (role), role keys (group), or empty (permission). */
  memberKeys: string[];
  createdAt: string;
}

export interface RoleCatalogContext {
  refData: Record<string, unknown>;
  /** Mutable — updated on each list load so create/edit know the active chip. */
  activeChip: string;
  /** Available permission keys for role mapping multi-select. */
  permissionOptions: { key: string; label: string }[];
  /** Available role keys for group mapping multi-select. */
  roleOptions: { key: string; label: string }[];
}
