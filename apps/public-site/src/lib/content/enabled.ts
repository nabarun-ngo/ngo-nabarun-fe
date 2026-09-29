/** Item is shown unless `enabled` is explicitly `false`. */
export type ToggleableItem = { enabled?: boolean }

export function isEnabled(item: ToggleableItem): boolean {
  return item.enabled !== false
}

export function enabledOnly<T extends ToggleableItem>(items: readonly T[] | undefined | null): T[] {
  return (items ?? []).filter(isEnabled)
}

export interface TextListItem {
  text: string
  enabled?: boolean
}

export function textListItemLabel(item: TextListItem): string {
  return item.text
}
