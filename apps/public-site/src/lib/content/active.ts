/** Item is shown unless `active` is explicitly false. */
export type ActiveItem = { active?: boolean }

export function isActiveItem(item: ActiveItem): boolean {
  return item.active !== false
}

export function activeOnly<T extends ActiveItem>(items: readonly T[] | undefined | null): T[] {
  return (items ?? []).filter(isActiveItem)
}
