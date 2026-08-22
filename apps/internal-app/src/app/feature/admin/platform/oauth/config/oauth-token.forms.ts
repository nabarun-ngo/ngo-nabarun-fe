import { baseField, toFieldOptions, type FormDefinition, type FormValues } from '@nabarun-ngo/forms-core';
import type { RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import type { AdminOAuthAccount, OAuthTokenListCriteria } from '../domain';

function options(refData: RefDataMap, key: string) {
  return toFieldOptions(refData[key] as { key: string; label?: string }[] | undefined);
}

export function accountFieldOptions(
  accounts: AdminOAuthAccount[] | undefined,
): { key: string; label: string }[] {
  return (accounts ?? []).map(account => ({
    key: account.id,
    label: account.name ? `${account.name} (${account.email})` : account.email,
  }));
}

export function buildOAuthFilterForm(
  refData: RefDataMap,
  provider: string,
): FormDefinition {
  const accountsByProvider = (refData['accountsByProvider'] ?? {}) as Record<
    string,
    AdminOAuthAccount[]
  >;
  return {
    id: 'oauth-token-filter',
    key: 'oauth-token-filter',
    label: 'Filters',
    description: null,
    fields: [
      baseField({
        id: 'account',
        key: 'account',
        label: 'Account',
        fieldType: 'select',
        mandatory: false,
        sortOrder: 1,
        fieldOptions: accountFieldOptions(accountsByProvider[provider]),
        placeholder: 'Any connected account',
      }),
    ],
  };
}

export function oauthCriteriaToValues(criteria: OAuthTokenListCriteria): FormValues {
  return { account: criteria.account ?? '' };
}

export function oauthValuesToCriteria(
  values: FormValues,
  accounts: AdminOAuthAccount[] = [],
): OAuthTokenListCriteria {
  const account = String(values['account'] ?? '').trim() || undefined;
  const selected = accounts.find(item => item.id === account);
  return {
    account,
    accountLabel: selected
      ? (selected.name ? `${selected.name} (${selected.email})` : selected.email)
      : undefined,
  };
}

export function buildOAuthAuthorizationForm(refData: RefDataMap): FormDefinition {
  return {
    id: 'oauth-authorization',
    key: 'oauth-authorization',
    label: 'Authorize OAuth account',
    description: 'Choose a provider and the access scopes to grant.',
    fields: [
      baseField({
        id: 'provider',
        key: 'provider',
        label: 'Provider',
        fieldType: 'select',
        mandatory: true,
        sortOrder: 1,
        fieldOptions: options(refData, 'providers'),
      }),
      baseField({
        id: 'scopes',
        key: 'scopes',
        label: 'Scopes',
        fieldType: 'multiselect',
        mandatory: true,
        sortOrder: 2,
        fieldOptions: options(refData, 'scopes'),
        hint: refData['scopesLoading']
          ? 'Loading scopes…'
          : 'Select one or more scopes for this connection.',
      }),
    ],
  };
}

export function defaultOAuthAuthorizationValues(provider: string): FormValues {
  return { provider, scopes: [] };
}
