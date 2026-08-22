import type { ListRowItem } from '@nabarun-ngo/list-dashboard-core';

export interface ListRowLinkEvent<TEntity> {
  item: ListRowItem<TEntity>;
  linkId: string;
}

export function toListRowLinkEvent<TEntity>(
  event: { item: ListRowItem; linkId: string },
): ListRowLinkEvent<TEntity> {
  return {
    item: event.item as ListRowItem<TEntity>,
    linkId: event.linkId,
  };
}
