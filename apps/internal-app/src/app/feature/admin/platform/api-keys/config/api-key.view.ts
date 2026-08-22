import type { ListDetailSection, ListRowItem } from '@nabarun-ngo/list-dashboard-core';
import { kvSection, mapAdminRow } from '../../../shared/admin-list.helpers';
import type { AdminApiKey } from '../domain';

export function mapApiKeyListRow(key: AdminApiKey): ListRowItem<AdminApiKey> {
  return mapAdminRow({
    id: key.id,
    title: key.name,
    subtitle: key.permissions.join(', '),
    metaRight: key.status === 'expired' ? 'Expired' : 'Active',
    payload: key,
  });
}

export function buildApiKeyDetailSections(key: AdminApiKey): ListDetailSection[] {
  return [
    kvSection('api_key_meta', 'API key', [
      { label: 'Name', value: key.name },
      { label: 'Status', value: key.status === 'expired' ? 'Expired' : 'Active' },
      { label: 'Permissions', value: key.permissions.join(', ') },
      { label: 'Expires at', value: key.expiresAt ?? 'Never' },
      { label: 'Created', value: key.createdAt },
      { label: 'Token', value: key.token ?? '—— (shown once at creation) ——' },
    ]),
  ];
}
