import type { ListDetailSection, ListRowItem } from '@nabarun-ngo/list-dashboard-core';
import { kvSection, mapAdminRow } from '../../../shared/admin-list.helpers';
import type { AdminOAuthToken } from '../domain';

export function mapOAuthTokenListRow(token: AdminOAuthToken): ListRowItem<AdminOAuthToken> {
  return mapAdminRow({
    id: token.id,
    title: token.account?.name || token.email,
    subtitle: token.account?.name ? token.email : token.provider,
    metaLeft: token.provider,
    metaRight: token.expiresAt ? `Expires ${new Date(token.expiresAt).toLocaleDateString()}` : 'No expiry',
    payload: token,
  });
}

export function buildOAuthTokenDetailSections(token: AdminOAuthToken): ListDetailSection[] {
  return [
    kvSection('oauth-account', 'Account', [
      { label: 'Name', value: token.account?.name ?? '—' },
      { label: 'Email', value: token.email },
      { label: 'Provider', value: token.provider },
      { label: 'Account ID', value: token.accountId },
    ]),
    kvSection('oauth-token', 'Authorization', [
      { label: 'Client', value: token.clientId },
      { label: 'Scopes', value: token.scopes.join(', ') || '—' },
      { label: 'Token type', value: token.tokenType ?? '—' },
      { label: 'Expires', value: token.expiresAt ?? '—' },
      { label: 'Authorized', value: token.createdAt },
      { label: 'Last updated', value: token.updatedAt },
    ]),
  ];
}
