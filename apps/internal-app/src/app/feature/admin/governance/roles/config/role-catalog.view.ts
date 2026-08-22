import type { ListDetailSection, ListRowItem } from '@nabarun-ngo/list-dashboard-core';
import { kvSection, mapAdminRow } from '../../../shared/admin-list.helpers';
import type { RoleCatalogItem } from '../domain';

function kindLabel(item: RoleCatalogItem): string {
  if (item.kind === 'group') return 'Role group';
  if (item.kind === 'permission') return 'Permission';
  return 'Role';
}

function memberMeta(item: RoleCatalogItem): string | undefined {
  if (item.kind === 'permission') return undefined;
  return `${item.memberKeys.length} ${item.kind === 'role' ? 'permission(s)' : 'role(s)'}`;
}

export function mapRoleCatalogListRow(item: RoleCatalogItem): ListRowItem<RoleCatalogItem> {
  return mapAdminRow({
    id: item.id,
    title: item.key,
    subtitle: item.description || kindLabel(item),
    metaRight: memberMeta(item),
    payload: item,
  });
}

export function buildRoleCatalogDetailSections(item: RoleCatalogItem): ListDetailSection[] {
  const sections: ListDetailSection[] = [
    kvSection('role_catalog', kindLabel(item), [
      { label: 'Key', value: item.key },
      { label: 'Description', value: item.description ?? '—' },
      { label: 'Created', value: item.createdAt },
    ]),
  ];

  if (item.kind === 'role') {
    sections.push(
      kvSection(
        'role_catalog_members',
        'Permissions',
        item.memberKeys.length
          ? item.memberKeys.map(key => ({ label: key, value: 'Granted' }))
          : [{ label: 'Permission keys', value: '—' }],
      ),
    );
  }

  if (item.kind === 'group') {
    sections.push(
      kvSection(
        'role_catalog_members',
        'Roles',
        item.memberKeys.length
          ? item.memberKeys.map(key => ({ label: key, value: 'Included' }))
          : [{ label: 'Role keys', value: '—' }],
      ),
    );
  }

  return sections;
}
