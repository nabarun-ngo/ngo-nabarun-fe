import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { AppliedListFilter, ListRouteFilterBinding } from '@nabarun-ngo/list-dashboard-core';
import { SCOPE } from 'src/app/core/constant/auth-scope.const';
import type { AdminOAuthAccount, OAuthTokenListCriteria } from '../domain';

export const OAUTH_TOKEN_FILTER_BINDINGS: ListRouteFilterBinding[] = [
  { param: 'account', criteriaKey: 'account', type: 'string' },
];

export function resolveOAuthTokenPermissions(authorization: AuthorizationService) {
  const permissions = authorization.effectivePermissions();
  return {
    canUpdateEntity: false,
    showCreateFab: permissions.includes(SCOPE.create.oauth_token),
    canTest: permissions.includes(SCOPE.read.oauth_token),
    canRevoke: permissions.includes(SCOPE.delete.oauth_token),
  };
}

export function cloneOAuthCriteria(criteria: OAuthTokenListCriteria): OAuthTokenListCriteria {
  return { ...criteria };
}

export function emptyOAuthCriteria(): OAuthTokenListCriteria {
  return {};
}

export function buildOAuthAppliedFilters(
  criteria: OAuthTokenListCriteria,
  accounts: AdminOAuthAccount[] = [],
): AppliedListFilter[] {
  if (!criteria.account) return [];
  const selected = accounts.find(item => item.id === criteria.account);
  const label = criteria.accountLabel
    ?? (selected
      ? (selected.name ? `${selected.name} (${selected.email})` : selected.email)
      : criteria.account);
  return [{
    id: 'account',
    label: `Account: ${label}`,
  }];
}

export function countActiveOAuthSheetFilters(criteria: OAuthTokenListCriteria): number {
  return criteria.account ? 1 : 0;
}

export function removeOAuthFilterById(
  criteria: OAuthTokenListCriteria,
  pillId: string,
): OAuthTokenListCriteria {
  if (pillId !== 'account') return cloneOAuthCriteria(criteria);
  return {};
}

/** Prefer the sheet Account filter; fall back to free-text search. */
export function resolveOAuthAccountFilter(
  criteria: OAuthTokenListCriteria,
  searchText?: string,
): string | undefined {
  return criteria.account?.trim() || searchText?.trim() || undefined;
}
