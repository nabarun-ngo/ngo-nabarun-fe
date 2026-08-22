import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { FormValues } from '@nabarun-ngo/forms-core';
import type { ListDashboardConfig, RefDataMap } from '@nabarun-ngo/list-dashboard-core';
import { catchError, defer, map, of, tap, throwError } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { notifyFeatureError } from 'src/app/shared/utils/http-error.util';
import type { OAuthTokenDataSource } from '../data/oauth-token-data.source';
import type {
  AdminOAuthAccount,
  AdminOAuthToken,
  OAuthAuthorizationStarted,
  OAuthTokenListCriteria,
} from '../domain';
import {
  buildOAuthAuthorizationForm,
  buildOAuthFilterForm,
  defaultOAuthAuthorizationValues,
  oauthCriteriaToValues,
  oauthValuesToCriteria,
} from './oauth-token.forms';
import {
  buildOAuthAppliedFilters,
  cloneOAuthCriteria,
  countActiveOAuthSheetFilters,
  emptyOAuthCriteria,
  OAUTH_TOKEN_FILTER_BINDINGS,
  removeOAuthFilterById,
  resolveOAuthAccountFilter,
  resolveOAuthTokenPermissions,
} from './oauth-token.rules';
import { buildOAuthTokenDetailSections, mapOAuthTokenListRow } from './oauth-token.view';

export type OAuthTokenOperations = {
  testConnection(token: AdminOAuthToken): void;
  revokeToken(token: AdminOAuthToken): void;
};

export type OAuthTokenListConfig = ListDashboardConfig<
  AdminOAuthToken,
  OAuthTokenListCriteria,
  unknown,
  OAuthTokenOperations
>;

const PAGE_SIZE = 20;

function accountsForProvider(refData: RefDataMap, provider: string): AdminOAuthAccount[] {
  const accountsByProvider = (refData['accountsByProvider'] ?? {}) as Record<
    string,
    AdminOAuthAccount[]
  >;
  return accountsByProvider[provider] ?? [];
}

export function createOAuthTokenListConfig(deps: {
  data: OAuthTokenDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  providers: string[];
  onProviderSelected: (provider: string, values: FormValues) => void;
  onMutation: () => void;
}): OAuthTokenListConfig {
  const permissions = () => resolveOAuthTokenPermissions(deps.authorization);
  const defaultProvider = deps.providers[0] ?? '';
  let createValues = defaultOAuthAuthorizationValues(defaultProvider);
  let selectedProvider = defaultProvider;
  const chips = deps.providers.map(provider => ({
    id: provider,
    label: provider.charAt(0).toUpperCase() + provider.slice(1),
  }));

  return {
    meta: {
      id: 'admin-oauth-connections',
      title: 'OAuth connections',
      pageName: 'OAuth connections',
      searchPlaceholder: 'Filter by account name, email, or ID',
      emptyMessage: 'No connected accounts matched this provider and filter.',
      detailRouteSync: { idParam: 'tokenId' },
    },
    list: {
      pageSize: PAGE_SIZE,
      chips,
      defaultChip: defaultProvider,
      isValidChip: chipId => deps.providers.includes(chipId),
      route: {
        chipConfig: {
          defaultChip: defaultProvider,
          normalize: chipId => deps.providers.includes(chipId ?? '') ? chipId! : defaultProvider,
        },
        filterBindings: OAUTH_TOKEN_FILTER_BINDINGS,
      },
      cloneCriteria: cloneOAuthCriteria,
      getDefaultCriteriaForChip: () => emptyOAuthCriteria(),
      buildFilterFormDefinition: (chipId, refData) =>
        buildOAuthFilterForm(refData, chipId),
      criteriaToFilterFormValues: (_chip, criteria) => oauthCriteriaToValues(criteria),
      filterFormValuesToCriteria: (chipId, values, _criteria, ctx) =>
        oauthValuesToCriteria(values, accountsForProvider(ctx.refData ?? {}, chipId)),
      buildAppliedFilters: (criteria, refData, chipId) =>
        buildOAuthAppliedFilters(criteria, accountsForProvider(refData, chipId)),
      countActiveSheetFilters: criteria => countActiveOAuthSheetFilters(criteria),
      removeFilterById: removeOAuthFilterById,
      loadPage: query => deps.data.listTokens(
        query.chipId,
        query.pageIndex,
        PAGE_SIZE,
        resolveOAuthAccountFilter(
          query.criteria as OAuthTokenListCriteria,
          query.searchText,
        ),
      ).pipe(
        map(page => ({
          items: page.items.map(mapOAuthTokenListRow),
          totalSize: page.totalSize,
          pageIndex: query.pageIndex,
          pageSize: PAGE_SIZE,
        })),
        catchError(() => of({
          items: [],
          totalSize: 0,
          pageIndex: query.pageIndex,
          pageSize: PAGE_SIZE,
        })),
      ),
      mapToListRow: token => mapOAuthTokenListRow(token),
    },
    detail: {
      getTitle: token => token.account?.name || token.email,
      buildViewSections: token => buildOAuthTokenDetailSections(token),
      fetchById: () => of(undefined),
      findInList: (items, id) => items
        .map(item => item.payload as AdminOAuthToken | undefined)
        .find(token => token?.id === id),
      edit: {
        buildEditSummary: () => [],
        buildEditForm: () => ({
          id: 'oauth-readonly',
          key: 'oauth-readonly',
          label: 'OAuth connection',
          description: null,
          fields: [],
        }),
        entityToEditValues: () => ({}),
        save: () => throwError(() => new Error('OAuth connections cannot be edited.')),
      },
    },
    create: {
      kind: 'form',
      route: { actionParam: 'authorize' },
      saveLabel: 'Authorize',
      canOpen: () => !!permissions().showCreateFab,
      buildCreateForm: (refData: RefDataMap) => buildOAuthAuthorizationForm(refData),
      defaultCreateValues: () => ({ ...createValues }),
      onValuesChange: values => {
        createValues = { ...values };
        const provider = String(values['provider'] ?? '');
        if (provider && provider !== selectedProvider) {
          selectedProvider = provider;
          createValues = { ...createValues, scopes: [] };
          deps.onProviderSelected(provider, createValues);
        }
      },
      createSave: values => {
        const provider = String(values['provider'] ?? '');
        const scopes = Array.isArray(values['scopes']) ? values['scopes'].map(String) : [];
        if (!provider) return throwError(() => new Error('Select a provider.'));
        if (!scopes.length) return throwError(() => new Error('Select at least one scope.'));
        const initiatedAt = new Date().toISOString();
        return defer(() => {
          // Open synchronously while the click still has browser user activation;
          // navigating only after the HTTP response is commonly blocked as a pop-up.
          const authWindow = window.open('about:blank', '_blank');
          if (!authWindow) {
            return throwError(() => new Error(
              'The authorization window was blocked. Allow pop-ups and try again.',
            ));
          }
          authWindow.opener = null;
          return deps.data.authorize(provider, scopes).pipe(
            tap({
              next: result => { authWindow.location.href = result.url; },
              error: () => authWindow.close(),
            }),
          );
        }).pipe(
          map((): OAuthAuthorizationStarted => ({ provider, initiatedAt })),
        );
      },
    },
    permissions: { resolve: permissions },
    behavior: { canUpdateEntity: () => false },
    operations: {
      testConnection(token) {
        deps.data.testConnection(token.provider, token.id).subscribe({
          next: result => {
            deps.modal.openNotificationModal({
              title: result.ok ? 'Connection is valid' : 'Connection test failed',
              description: [
                result.message,
                result.accountName ? `Account: ${result.accountName}` : null,
                result.email ? `Email: ${result.email}` : null,
                result.refreshed ? 'Access token was refreshed during the probe.' : null,
              ].filter(Boolean).join('\n'),
            }, 'notification', result.ok ? 'success' : 'error');
            if (result.ok && result.refreshed) deps.onMutation();
          },
          error: err => notifyFeatureError(deps.modal, err, {
            title: 'Connection test failed',
            description: err?.message ?? 'Unable to test the OAuth connection.',
          }),
        });
      },
      revokeToken(token) {
        deps.modal.openNotificationModal({
          title: 'Revoke OAuth connection?',
          description: `Revoke ${token.email} from ${token.provider}? Access will stop immediately.`,
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.revoke(token.provider, token.id).subscribe({
            next: () => {
              deps.modal.openNotificationModal({
                title: 'Connection revoked',
                description: token.email,
              }, 'notification', 'success');
              deps.onMutation();
            },
            error: err => notifyFeatureError(deps.modal, err, {
              title: 'Revoke failed',
              description: err?.message ?? 'Unable to revoke the OAuth connection.',
            }),
          });
        });
      },
    },
    actions: {
      detailFooter: [
        {
          id: 'test-connection',
          label: 'Test connection',
          appearance: 'primary',
          when: () => !!permissions().canTest,
          run: 'testConnection',
        },
        {
          id: 'revoke',
          label: 'Revoke',
          appearance: 'secondary',
          when: () => !!permissions().canRevoke,
          run: 'revokeToken',
        },
      ],
      floating: [{
        id: 'authorize',
        label: 'Authorize account',
        appearance: 'fab',
        icon: 'add_link',
        when: () => !!permissions().showCreateFab,
        run: 'openCreate',
      }],
    },
  };
}
