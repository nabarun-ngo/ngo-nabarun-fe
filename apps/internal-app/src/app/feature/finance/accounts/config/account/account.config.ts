import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import { catchError, firstValueFrom, map, of, throwError } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import { notifyFeatureError } from 'src/app/shared/utils/http-error.util';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import type { AccountDataSource } from '../../data/account-data.source';
import type {
  Account,
  AccountListContext,
  AccountListCriteria,
  AccountPrimaryChip,
  AccountRefData,
  UpiDetail,
} from '../../domain';
import {
  ACCOUNT_BANKING_STEPPER_STEPS,
  ACCOUNT_CREATE_STEPPER_STEPS,
  ACCOUNT_TRANSFER_DOCUMENT_HINT,
  ACCOUNT_TRANSFER_DOCUMENT_TYPES,
  accountCriteriaToValues,
  accountToBankingFormValues,
  accountToUpdateValues,
  accountToUpiEditorRows,
  accountValuesToCriteria,
  buildAccountBankingStepDefinition,
  buildAccountCreateStepDefinition,
  buildAccountFilterForm,
  buildAccountTransferFormDefinition,
  buildAccountUpdateForm,
  defaultAccountCreateFormValues,
  defaultAccountTransferFormValues,
  fetchTransferPayableAccountOptions,
  isAccountTransferReferenceType,
  resolveAccountBankingStepsFromValues,
  resolveAccountCreateSteps,
  saveAccountBanking,
  accountCreateLocksFromPresets,
  saveAccountCreate,
  saveAccountTransfer,
  transferReferenceOptionsForAccount,
  type AccountBankingStep,
  type AccountCreateStep,
  validateAccountBankingStep,
  validateAccountCreateStep,
  validateAccountCreateValues,
} from './account.forms';
import {
  ACCOUNT_CHIPS,
  ACCOUNT_DEFAULT_CHIP,
  ACCOUNT_LIST_ROUTE_FILTER_BINDINGS,
  buildAccountAppliedFilters,
  cloneAccountCriteria,
  countActiveAccountSheetFilters,
  getDefaultCriteriaForChip,
  isAccountPrimaryChip,
  isActiveChip,
  isClosedAccount,
  isMineChip,
  normalizeAccountChip,
  removeAccountFilterById,
  resolveAccountPermissions,
  canTransferFromAccount,
  shouldUseOrgList,
  validateTransferValues,
} from './account.rules';
import { buildAccountListDetailSections, mapAccountListRow } from './account.view';

export type AccountListConfig = ListDashboardConfig<
  Account,
  AccountListCriteria,
  AccountListContext,
  AccountListOperations
>;

export type AccountListOperations = {
  transactions(account: Account): void;
};

const MOBILE_PAGE_SIZE = 12;

export function createAccountListConfig(deps: {
  data: AccountDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  context: AccountListContext;
  getActiveChip: () => AccountPrimaryChip;
  getCurrentUserId: () => string | undefined;
  openTransactions: (account: Account, isSelf: boolean) => void;
}): AccountListConfig {
  const permissions = () => resolveAccountPermissions(deps.authorization);
  /** Tracks last transfer reference per account so payable options reload once per change. */
  const transferLastReferenceByAccountId = new Map<string, string>();
  const accountMenuActions: NonNullable<AccountListConfig['actions']>['rowMenu'] = [
    {
      id: 'transactions',
      label: 'Transactions',
      icon: 'receipt_long',
      when: ctx => {
        const account = ctx.entity as Account | undefined;
        return !!account?.id && !!permissions().canReadTransactions;
      },
      run: 'transactions',
    },
    {
      id: 'transfer',
      label: 'Record transfer',
      icon: 'swap_horiz',
      when: ctx => {
        const account = ctx.entity as Account | undefined;
        const perms = permissions();
        if (!account || !isMineChip(ctx.activeChip as AccountPrimaryChip)) {
          return false;
        }
        return canTransferFromAccount(account, {
          canTransfer: !!perms.canTransfer,
          chipId: ctx.activeChip as AccountPrimaryChip,
          currentUserId: deps.getCurrentUserId(),
        });
      },
      run: 'openTransfer',
      actionFormId: 'transfer',
    },
    {
      id: 'changeStatus',
      label: 'Change Account Status',
      icon: 'manage_accounts',
      when: ctx =>
        !!ctx.permissions['canUpdateAccount']
        && isActiveChip(ctx.activeChip as AccountPrimaryChip),
      run: 'openDetailEdit',
    },
  ];

  return {
    list: {
      pageSize: MOBILE_PAGE_SIZE,
      chips: [...ACCOUNT_CHIPS],
      defaultChip: ACCOUNT_DEFAULT_CHIP,
      isValidChip: isAccountPrimaryChip,
      route: {
        chipConfig: {
          defaultChip: ACCOUNT_DEFAULT_CHIP,
          normalize: normalizeAccountChip,
        },
        filterBindings: ACCOUNT_LIST_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneAccountCriteria,
      getDefaultCriteriaForChip: chip => getDefaultCriteriaForChip(chip as AccountPrimaryChip),
      buildFilterFormDefinition: (chip, refData) =>
        buildAccountFilterForm(
          chip as AccountPrimaryChip,
          refData as Record<string, KeyValue[]>,
          deps.context.memberOptions,
        ),
      criteriaToFilterFormValues: (_chip, criteria) => accountCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values, criteria) =>
        accountValuesToCriteria(values, criteria, deps.context.memberOptions),
      buildAppliedFilters: (criteria, refData) =>
        buildAccountAppliedFilters(criteria, refData),
      countActiveSheetFilters: countActiveAccountSheetFilters,
      removeFilterById: removeAccountFilterById,
      loadPage: (query, ctx) => {
        const chipId = normalizeAccountChip(query.chipId);
        const perms = permissions();
        return deps.data.loadListPage({
          chipId,
          criteria: query.criteria as AccountListCriteria,
          searchText: query.searchText,
          pageIndex: query.pageIndex,
          pageSize: query.pageSize,
          useOrgList: shouldUseOrgList(chipId, !!perms.canManageAccounts),
        }).pipe(
          map(page => ({
            items: (page.content ?? []).map(account =>
              mapAccountListRow(
                account,
                ctx.refData as AccountRefData,
              )),
            totalSize: page.totalSize ?? 0,
            pageIndex: query.pageIndex,
            pageSize: query.pageSize,
          })),
          catchError(() => of({
            items: [],
            totalSize: 0,
            pageIndex: query.pageIndex,
            pageSize: MOBILE_PAGE_SIZE,
          })),
        );
      },
      mapToListRow: (entity, ctx) =>
        mapAccountListRow(entity, ctx.refData as AccountRefData),
    },
    detail: {
      getTitle: account => account.id ?? 'Account',
      buildViewSections: (account, refData) =>
        buildAccountListDetailSections(account, refData as AccountRefData),
      fetchById: id => deps.data.fetchAccountById(
        id,
        isMineChip(deps.getActiveChip()),
      ).pipe(
        catchError(() => of(undefined)),
      ),
      findInList: (items, id) => items
        .map(item => item.payload as Account | undefined)
        .find(account => account?.id?.toLowerCase() === id.toLowerCase()),
      edit: {
        buildEditSummary: ctx => {
          const rows = [
            { label: 'Account ID', value: ctx.entity.id ?? '-' },
            { label: 'Type', value: ctx.entity.accountTypeLabel ?? ctx.entity.accountType ?? '-' },
            { label: 'Balance', value: ctx.entity.formattedBalance ?? '-' },
          ];
          if (ctx.entity.accountType === 'INVESTMENT') {
            const sourceId = ctx.entity.bankDetail?.sourceAccountId;
            const sourceLabel = deps.context.sourceBankOptions.find(o => o.key === sourceId)?.label
              ?? sourceId
              ?? '-';
            rows.push(
              { label: 'Source bank', value: sourceLabel },
              {
                label: 'On close',
                value: 'Requires received INTEREST earning; balance returns to source bank.',
              },
            );
          }
          return rows;
        },
        buildEditForm: ctx =>
          buildAccountUpdateForm(ctx.refData as Record<string, KeyValue[]>),
        entityToEditValues: accountToUpdateValues,
        save: ctx => {
          const status = String(ctx.values['status'] ?? ctx.entity.status) as 'ACTIVE' | 'CLOSED';
          return deps.data.updateAccountDetail(ctx.entity.id, { status }).pipe(
            map(account => {
              if (status === 'CLOSED' && ctx.entity.accountType === 'INVESTMENT') {
                deps.modal.openNotificationModal({
                  title: 'Investment closed',
                  description: 'Balance was returned to the source bank account.',
                }, 'notification', 'success');
              }
              return account;
            }),
          );
        },
      },
    },
    create: {
      kind: 'stepper',
      route: {
        actionParam: 'create',
        presets: [
          { param: 'accountType', stateKey: 'accountType', type: 'string' },
          { param: 'ownerType', stateKey: 'ownerType', type: 'string' },
          { param: 'accountHolder', stateKey: 'accountHolder', type: 'string' },
          { param: 'backTo', stateKey: 'backTo', type: 'string' },
          { param: 'backLabel', stateKey: 'backLabel', type: 'string' },
          { param: 'expenseId', stateKey: 'expenseId', type: 'string' },
        ],
      },
      canOpen: ctx =>
        isActiveChip(ctx.activeChip as AccountPrimaryChip)
        && !!ctx.permissions['canCreateAccount'],
      steps: ACCOUNT_CREATE_STEPPER_STEPS,
      defaultCreateValues: (_refData, presets) => defaultAccountCreateFormValues(presets),
      customSteps: {
        upi: { rendererKey: 'upiRows' },
      },
      buildStepDefinition: (stepId, values, ctx) =>
        buildAccountCreateStepDefinition(
          stepId as AccountCreateStep,
          ctx.refData as Record<string, KeyValue[]>,
          ctx.memberOptions ?? deps.context.memberOptions,
          values,
          (ctx as { sourceBankOptions?: FieldOption[] }).sourceBankOptions
            ?? deps.context.sourceBankOptions
            ?? [],
          accountCreateLocksFromPresets(ctx.presets ?? {}),
        ),
      resolveSteps: values => resolveAccountCreateSteps(values),
      validateStep: (stepId, values) =>
        validateAccountCreateStep(stepId as AccountCreateStep, values),
      createSave: (values, ctx) => {
        const validationError = validateAccountCreateValues(values);
        if (validationError) {
          return throwError(() => new Error(validationError));
        }
        const customStepData = ctx?.['customStepData'] as Record<string, unknown> | undefined;
        const upiRows = customStepData?.['upi'] as UpiDetail[] | undefined;
        return saveAccountCreate(values, deps.data, deps.modal, upiRows);
      },
    },
    actionForms: {
      transfer: {
        kind: 'form',
        title: 'Record amount transfer',
        saveLabel: 'Confirm transfer',
        showDocumentUpload: true,
        documentTypes: ACCOUNT_TRANSFER_DOCUMENT_TYPES,
        documentUploadHint: ACCOUNT_TRANSFER_DOCUMENT_HINT,
        defaultValues: entity => {
          transferLastReferenceByAccountId.set(entity.id, '');
          return defaultAccountTransferFormValues();
        },
        buildForm: (entity, ctx) => {
          const referenceOptions = transferReferenceOptionsForAccount(
            entity,
            ctx.refData as AccountRefData,
          );
          return buildAccountTransferFormDefinition([], referenceOptions);
        },
        onValuesChange: (entity, values, ctx) => {
          const reference = String(values['transferReferenceType'] ?? '');
          const last = transferLastReferenceByAccountId.get(entity.id) ?? '';
          if (reference === last) {
            return;
          }
          transferLastReferenceByAccountId.set(entity.id, reference);
          const referenceOptions = transferReferenceOptionsForAccount(
            entity,
            ctx.refData as AccountRefData,
          );

          if (!isAccountTransferReferenceType(reference)) {
            return of({
              definition: buildAccountTransferFormDefinition([], referenceOptions),
              values: { ...values, transferTo: '', amount: null },
            });
          }

          return fetchTransferPayableAccountOptions(
            deps.data,
            reference,
            entity.id,
          ).pipe(
            map(accountOptions => ({
              definition: buildAccountTransferFormDefinition(accountOptions, referenceOptions),
              values: { ...values, transferTo: '' },
            })),
            catchError(err => {
              notifyFeatureError(deps.modal, err, {
                title: 'Transfer accounts unavailable',
                description: 'Could not load payable accounts for this transfer reference.',
              });
              return of({
                definition: buildAccountTransferFormDefinition([], referenceOptions),
                values: { ...values, transferTo: '', amount: null },
              });
            }),
          );
        },
        validateBeforeSave: ctx => validateTransferValues(ctx.values, ctx.documents),
        save: ctx => {
          const chip = deps.getActiveChip();
          const perms = permissions();
          return saveAccountTransfer({
            accountData: deps.data,
            fromAccount: ctx.entity,
            values: ctx.values,
            documents: ctx.documents as readonly FileUpload[],
            isAdminTransfer: shouldUseOrgList(chip, !!perms.canManageAccounts),
          });
        },
        success: {
          mode: 'reloadList',
          reopenDetail: true,
          message: 'The transfer was recorded successfully.',
        },
      },
      banking: {
        kind: 'stepper',
        title: entity =>
          entity.accountType === 'INVESTMENT'
            ? 'Update investment details'
            : 'Update account details',
        saveLabel: 'Save',
        steps: ACCOUNT_BANKING_STEPPER_STEPS,
        customSteps: {
          upi: { rendererKey: 'upiRows' },
        },
        defaultValues: entity => accountToBankingFormValues(entity),
        defaultCustomStepData: entity => ({
          upi: accountToUpiEditorRows(entity),
        }),
        buildStepDefinition: (stepId, _values, ctx) =>
          buildAccountBankingStepDefinition(
            stepId as AccountBankingStep,
            ctx.entity,
            (ctx as { sourceBankOptions?: FieldOption[] }).sourceBankOptions
              ?? deps.context.sourceBankOptions
              ?? [],
            ctx.refData as AccountRefData,
          ),
        resolveSteps: values => resolveAccountBankingStepsFromValues(values),
        validateStep: (stepId, values, ctx) =>
          validateAccountBankingStep(stepId as AccountBankingStep, ctx.entity, values),
        save: ctx =>
          saveAccountBanking({
            account: ctx.entity,
            values: ctx.values,
            upiRows: (ctx.customStepData['upi'] as UpiDetail[] | undefined) ?? [],
            accountData: deps.data,
            modal: deps.modal,
            isSelf: isMineChip(deps.getActiveChip()),
          }),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
        },
      },
    },
    operations: {
      transactions: account => {
        if (!account?.id || !permissions().canReadTransactions) {
          return;
        }
        deps.openTransactions(account, isMineChip(deps.getActiveChip()));
      },
    },
    meta: {
      id: 'finance.accounts',
      title: 'Account',
      pageName: 'Accounts',
      searchPlaceholder: 'Search by account ID',
      filterSheetTitle: 'Account Filters',
      emptyMessage: 'No accounts match this filter.',
      detailRouteSync: { idParam: 'accountId', idParamAliases: ['id'] },
    },
    permissions: {
      resolve: () => resolveAccountPermissions(deps.authorization),
    },
    behavior: {
      canUpdateEntity: ctx =>
        isActiveChip(ctx.activeChip as AccountPrimaryChip)
        && !!resolveAccountPermissions(deps.authorization).canUpdateAccount,
    },
    preparation: {
      tasks: [{
        id: 'member-options',
        cache: 'instance',
        run: async (context: AccountListContext) => {
          const options = await firstValueFrom(deps.data.fetchMemberOptions());
          context.memberOptions = options;
          return options;
        },
      }, {
        id: 'source-bank-options',
        cache: 'instance',
        run: async (context: AccountListContext) => {
          const accounts = await firstValueFrom(
            deps.data.fetchPayableAccounts({ purpose: 'INVESTMENT_FUNDING' }).pipe(
              catchError(() => of([])),
            ),
          );
          const options = accounts.map(account => ({
            key: account.id,
            label: `${account.displayName || account.id}${account.formattedBalance ? ` · ${account.formattedBalance}` : ''}`,
          }));
          context.sourceBankOptions = options;
          return options;
        },
      }],
      triggers: {
        init: ['member-options', 'source-bank-options'],
        filterOpen: ['member-options'],
        createOpen: ['member-options', 'source-bank-options'],
        editPrepare: ['source-bank-options'],
      },
    },
    actions: {
      rowMenu: accountMenuActions,
      detailMenu: accountMenuActions,
      detailFooter: [
        {
          id: 'banking',
          label: 'Edit',
          appearance: 'secondary',
          when: ctx => {
            const account = ctx.entity as Account | undefined;
            const perms = permissions();
            if (!perms.canUpdateBanking || !account || isClosedAccount(account)) {
              return false;
            }
            return isMineChip(ctx.activeChip as AccountPrimaryChip)
              || !!perms.canUpdateAccount;
          },
          run: 'openBanking',
          actionFormId: 'banking',
        },
      ],
      floating: [
        {
          id: 'create',
          label: 'Create account',
          appearance: 'fab',
          icon: 'add',
          when: ctx =>
            isActiveChip(ctx.activeChip as AccountPrimaryChip)
            && !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
    },
  };
}
