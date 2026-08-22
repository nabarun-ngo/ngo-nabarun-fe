import type { AuthorizationService } from '@nabarun-ngo/auth-angular';
import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { Router } from '@angular/router';
import { catchError, firstValueFrom, forkJoin, map, of, switchMap, throwError } from 'rxjs';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { LineItemRow } from 'src/app/shared/components/line-items-editor/line-items-editor.component';
import type { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import { AccountConstant } from '../../finance.const';
import type { Account } from '../../accounts/domain';
import type { AccountDataSource } from '../../accounts/data/account-data.source';
import { saveAccountTransfer } from '../../accounts/config/account/account.forms';
import type { ExpenseDataSource } from '../data/expense-data.source';
import type {
  Expense,
  ExpenseFilterCriteria,
  ExpenseListContext,
  ExpensePrimaryChip,
  ExpenseRefData,
} from '../domain';
import {
  buildExpenseCreateStep,
  buildExpenseEditForm,
  buildExpenseFilterForm,
  buildExpenseResubmitForm,
  buildExpenseSendBackForm,
  buildExpenseTopUpForm,
  createValuesToExpenseUpdate,
  defaultExpenseCreateValues,
  defaultExpenseTopUpValues,
  expenseCriteriaToValues,
  expenseItemsToLineItemRows,
  expenseToEditValues,
  EXPENSE_CREATE_STEPPER_STEPS,
  EXPENSE_TOP_UP_DOCUMENT_HINT,
  EXPENSE_TOP_UP_DOCUMENT_TYPES,
  lineItemRowsToExpenseItems,
  saveExpenseCreate,
  expenseValuesToCriteria,
  resolveExpenseCreateSteps,
  validateExpenseTopUpValues,
  type ExpenseCreateStep,
} from './expense.forms';
import {
  buildCreateWalletRoute,
  buildExpenseTransactionRoute,
  EXPENSE_CHIPS,
  EXPENSE_DEFAULT_CHIP,
  getExpensePayerWallet,
  isMineChip,
  isSettlementEligibleStatus,
  isUnsubmittedExpenseStatus,
  normalizeExpenseChip,
  resolveExpensePermissions,
  resolveSettlementReadiness,
  settlementShortfall,
  shouldUseOrgList,
} from './expense.rules';
import {
  buildExpenseDetailSections,
  buildExpenseDocuments,
  buildExpenseDocumentsLoading,
  mapExpenseListRow,
} from './expense.view';

export type ExpenseListConfig = ListDashboardConfig<
  Expense,
  ExpenseFilterCriteria,
  ExpenseListContext,
  ExpenseListOperations
>;

export type ExpenseListOperations = {
  submitForReimbursement(expense: Expense): void;
  approveAndSettle(expense: Expense): void;
  navigateToTransaction(expense: Expense): void;
  navigateCreateWallet(expense: Expense): void;
};

const MOBILE_PAGE_SIZE = 12;

function labelsForKeys(values: KeyValue[] | undefined, keys: string[] | undefined): string[] {
  if (!keys?.length || !values?.length) return keys ?? [];
  return keys.map(k => values.find(v => v.key === k)?.displayValue ?? k);
}

function createOptionsFromContext(context: ExpenseListContext) {
  return {
    memberOptions: context.memberOptions,
    eventOptions: context.eventOptions,
    defaultPayerId: context.defaultPayerId,
    presetActivityId: context.presetActivityId,
    lockEvent: !!context.presetActivityId,
  };
}

function mapFundingAccountOptions(
  accounts: readonly Account[],
  excludeWalletId?: string,
): FieldOption[] {
  return accounts
    .filter(account => account.id && account.id !== excludeWalletId)
    .map(account => ({
      key: account.id,
      label: `${account.id} · ${account.accountTypeLabel ?? account.accountType}`,
    }));
}

function canAdminSettleActions(ctx: {
  permissions: Record<string, boolean | undefined>;
  activeChip: string;
  entity?: Expense;
}): boolean {
  return !!ctx.permissions['canFinalizeExpense']
    && !!ctx.permissions['canSettleExpense']
    && ctx.activeChip === 'pending_reimburse'
    && isSettlementEligibleStatus(ctx.entity?.status);
}

export function createExpenseListConfig(deps: {
  data: ExpenseDataSource;
  accounts: AccountDataSource;
  authorization: AuthorizationService;
  modal: ModalService;
  router: Router;
  context: ExpenseListContext;
  onExpenseUpdated?: (expense: Expense) => void;
  documentUploadHint?: string;
}): ExpenseListConfig {
  const permissions = () => resolveExpensePermissions(deps.authorization);

  return {
    list: {
      pageSize: MOBILE_PAGE_SIZE,
      chips: [...EXPENSE_CHIPS],
      defaultChip: EXPENSE_DEFAULT_CHIP,
      isValidChip: chip => EXPENSE_CHIPS.some(item => item.id === chip),
      route: {
        chipConfig: {
          defaultChip: EXPENSE_DEFAULT_CHIP,
          normalize: normalizeExpenseChip,
        },
        filterBindings: [
          { param: 'status', criteriaKey: 'status', type: 'csv' },
          { param: 'expenseRefType', criteriaKey: 'expenseRefType', type: 'csv' },
          { param: 'filterExpenseId', criteriaKey: 'expenseId', type: 'string' },
          { param: 'expenseRefId', criteriaKey: 'expenseRefId', type: 'string' },
          { param: 'startDate', criteriaKey: 'startDate', type: 'string' },
          { param: 'endDate', criteriaKey: 'endDate', type: 'string' },
          { param: 'payerId', criteriaKey: 'payerId', type: 'string' },
        ],
      },
      cloneCriteria: criteria => ({
        ...criteria,
        status: criteria.status ? [...criteria.status] : undefined,
        expenseRefType: criteria.expenseRefType ? [...criteria.expenseRefType] : undefined,
      }),
      getDefaultCriteriaForChip: () => ({}),
      buildFilterFormDefinition: (chip, refData) =>
        buildExpenseFilterForm(
          chip as ExpensePrimaryChip,
          refData as ExpenseRefData,
          deps.context.memberOptions,
          deps.context.eventOptions,
        ),
      criteriaToFilterFormValues: (_chip, criteria) =>
        expenseCriteriaToValues(criteria),
      filterFormValuesToCriteria: (chip, values, criteria) =>
        expenseValuesToCriteria(
          chip as ExpensePrimaryChip,
          values,
          criteria,
          deps.context.memberOptions,
          deps.context.eventOptions,
        ),
      buildAppliedFilters: (criteria, refData) => {
        const pills: { id: string; label: string }[] = [];
        const statusRef = refData[AccountConstant.refDataKey.expenseStatus] as KeyValue[] | undefined;
        const typeRef = refData[AccountConstant.refDataKey.expenseType] as KeyValue[] | undefined;
        if (criteria.expenseId) {
          pills.push({ id: 'expenseId', label: `ID: ${criteria.expenseId}` });
        }
        if (criteria.expenseRefType?.length) {
          pills.push({
            id: 'expenseRefType',
            label: `Type: ${labelsForKeys(typeRef, criteria.expenseRefType).join(', ')}`,
          });
        }
        if (criteria.expenseRefId) {
          pills.push({
            id: 'expenseRefId',
            label: `Event: ${criteria.eventName ?? criteria.expenseRefId}`,
          });
        }
        if (criteria.payerId) {
          pills.push({
            id: 'payerId',
            label: `Payer: ${criteria.payerName ?? criteria.payerId}`,
          });
        }
        if (criteria.status?.length) {
          pills.push({
            id: 'status',
            label: `Status: ${labelsForKeys(statusRef, criteria.status).join(', ')}`,
          });
        }
        if (criteria.startDate || criteria.endDate) {
          pills.push({
            id: 'dateRange',
            label: `Dates: ${criteria.startDate ?? '…'} – ${criteria.endDate ?? '…'}`,
          });
        }
        return pills;
      },
      countActiveSheetFilters: criteria => [
        criteria.expenseId,
        criteria.expenseRefType?.length,
        criteria.expenseRefId,
        criteria.payerId,
        criteria.status?.length,
        criteria.startDate || criteria.endDate,
      ].filter(Boolean).length,
      removeFilterById: (criteria, id) => {
        const next = { ...criteria };
        if (id === 'status') next.status = undefined;
        if (id === 'expenseRefType') {
          next.expenseRefType = undefined;
          next.expenseRefId = undefined;
          next.eventName = undefined;
        }
        if (id === 'expenseRefId') {
          next.expenseRefId = undefined;
          next.eventName = undefined;
        }
        if (id === 'dateRange') {
          next.startDate = undefined;
          next.endDate = undefined;
        }
        if (id === 'expenseId') next.expenseId = undefined;
        if (id === 'payerId') {
          next.payerId = undefined;
          next.payerName = undefined;
        }
        return next;
      },
      loadPage: (query, context) => {
        const chipId = normalizeExpenseChip(query.chipId);
        const { canManageExpenses } = permissions();
        return deps.data.loadListPage({
          chipId,
          criteria: query.criteria as ExpenseFilterCriteria,
          searchText: query.searchText,
          pageIndex: query.pageIndex,
          pageSize: query.pageSize,
          useOrgList: shouldUseOrgList(chipId, canManageExpenses),
          refData: context.refData as ExpenseRefData,
        }).pipe(
          map(page => ({
            items: (page.content ?? []).map(mapExpenseListRow),
            totalSize: page.totalSize ?? 0,
            pageIndex: query.pageIndex,
            pageSize: MOBILE_PAGE_SIZE,
          })),
          catchError(() => of({
            items: [],
            totalSize: 0,
            pageIndex: query.pageIndex,
            pageSize: MOBILE_PAGE_SIZE,
          })),
        );
      },
      mapToListRow: entity => mapExpenseListRow(entity),
    },
    detail: {
      getTitle: expense => expense.id ?? 'Expense',
      buildViewSections: (expense, refData) =>
        buildExpenseDetailSections(
          expense,
          refData as ExpenseRefData,
          {
            payerWallet: expense.id
              ? deps.context.payerWallets.get(expense.id)
              : undefined,
          },
        ),
      documents: {
        buildLoadingSection: buildExpenseDocumentsLoading,
        loadSection: id => deps.data.fetchDocuments(id).pipe(
          map(buildExpenseDocuments),
          catchError(() => of(buildExpenseDocuments([]))),
        ),
      },
      fetchById: id => deps.data.fetchExpenseById(id).pipe(
        catchError(() => of(undefined)),
      ),
      findInList: (items, id) => items
        .map(item => item.payload as Expense | undefined)
        .find(item => item?.id?.toLowerCase() === id.toLowerCase()),
      edit: {
        buildEditSummary: context => [
          { label: 'Expense ID', value: context.entity.id ?? '-' },
          { label: 'Status', value: context.entity.statusLabel ?? context.entity.status ?? '-' },
          { label: 'Amount', value: context.entity.formattedAmount ?? '-' },
        ],
        buildEditForm: () => buildExpenseResubmitForm(),
        entityToEditValues: entity => ({ remarks: entity.remarks ?? '' }),
        save: context => {
          const patch: Partial<Expense> = {
            remarks: String(context.values['remarks'] ?? context.entity.remarks ?? ''),
            status: context.entity.status === 'SEND_BACK' ? 'SUBMITTED' : context.entity.status,
          };
          return deps.data.updateExpense(context.entity.id!, patch);
        },
      },
    },
    create: {
      kind: 'stepper',
      route: { actionParam: 'create' },
      canOpen: runtime => !!runtime.permissions['showCreateFab'],
      steps: EXPENSE_CREATE_STEPPER_STEPS,
      resolveSteps: values => resolveExpenseCreateSteps(values),
      customSteps: {
        items: { rendererKey: 'expenseLineItems' },
      },
      defaultCreateValues: () =>
        defaultExpenseCreateValues(createOptionsFromContext(deps.context)),
      buildStepDefinition: (step, _values, _runtime) =>
        buildExpenseCreateStep(
          step as ExpenseCreateStep,
          deps.context.refData,
          createOptionsFromContext(deps.context),
        ),
      createSave: (values, runtime) => {
        const rows = (runtime?.['customStepData'] as Record<string, unknown> | undefined)
          ?.['items'] as LineItemRow[] | undefined;
        return saveExpenseCreate(
          values,
          rows ?? [],
          deps.context.presetActivityId,
          deps.data,
        );
      },
    },
    actionForms: {
      editExpense: {
        kind: 'stepper',
        title: expense => (expense.status === 'SEND_BACK' ? 'Correct expense' : 'Edit Expense'),
        saveLabel: 'Save',
        preparationTasks: ['member-event-options'],
        steps: EXPENSE_CREATE_STEPPER_STEPS,
        resolveSteps: values => resolveExpenseCreateSteps(values),
        customSteps: {
          items: { rendererKey: 'expenseLineItems' },
        },
        defaultValues: entity => expenseToEditValues(entity),
        defaultCustomStepData: entity => ({
          items: expenseItemsToLineItemRows(entity.expenseItems),
        }),
        buildStepDefinition: (step, _values, ctx) =>
          step === 'details'
            ? buildExpenseEditForm(
              deps.context.refData,
              createOptionsFromContext(deps.context),
              ctx.entity,
            )
            : buildExpenseCreateStep(
              'items',
              deps.context.refData,
              createOptionsFromContext(deps.context),
            ),
        save: ctx => {
          const rows = (ctx.customStepData['items'] as LineItemRow[] | undefined) ?? [];
          const validItems = lineItemRowsToExpenseItems(rows);
          if (!validItems.length) {
            return throwError(() => new Error(
              'Add at least one expense item with a name and amount.',
            ));
          }
          const patch = createValuesToExpenseUpdate(
            ctx.values,
            validItems,
            deps.context.memberOptions,
            deps.context.presetActivityId,
          );
          return deps.data.updateExpense(ctx.entity.id!, patch);
        },
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Expense updated successfully.',
        },
      },
      sendBack: {
        kind: 'form',
        title: 'Send back for correction',
        saveLabel: 'Send back',
        defaultValues: () => ({ remarks: '' }),
        buildForm: () => buildExpenseSendBackForm(),
        validateBeforeSave: ctx => {
          const remarks = String(ctx.values['remarks'] ?? '').trim();
          return remarks ? undefined : 'Please provide a reason for send back.';
        },
        save: ctx => deps.data.sendBackExpense(
          ctx.entity.id!,
          String(ctx.values['remarks'] ?? '').trim(),
        ),
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Expense sent back for correction.',
        },
      },
      topUpWallet: {
        kind: 'form',
        title: 'Top up payer wallet',
        saveLabel: 'Confirm transfer',
        showDocumentUpload: true,
        documentTypes: EXPENSE_TOP_UP_DOCUMENT_TYPES,
        documentUploadHint: deps.documentUploadHint ?? EXPENSE_TOP_UP_DOCUMENT_HINT,
        preparationTasks: ['settlement-detail', 'funding-accounts'],
        defaultValues: entity => {
          const wallet = getExpensePayerWallet(deps.context, entity);
          return defaultExpenseTopUpValues({
            walletId: wallet?.id ?? '',
            shortfall: settlementShortfall(entity, wallet),
            expenseId: entity.id,
          });
        },
        buildForm: entity => {
          const wallet = getExpensePayerWallet(deps.context, entity);
          return buildExpenseTopUpForm(
            mapFundingAccountOptions(deps.context.fundingAccounts, wallet?.id),
            wallet?.id ?? '',
          );
        },
        validateBeforeSave: ctx => validateExpenseTopUpValues(ctx.values, ctx.documents),
        save: ctx => {
          const fromId = String(ctx.values['transferFrom'] ?? '').trim();
          const fromAccount = deps.context.fundingAccounts.find(account => account.id === fromId);
          if (!fromAccount) {
            return throwError(() => new Error('Select a valid funding account.'));
          }
          const wallet = getExpensePayerWallet(deps.context, ctx.entity);
          if (!wallet?.id) {
            return throwError(() => new Error('Payer wallet is no longer available.'));
          }
          const transferValues = {
            ...ctx.values,
            transferTo: wallet.id,
            transferReferenceType: 'ADHOC',
          };
          return saveAccountTransfer({
            accountData: deps.accounts,
            fromAccount,
            values: transferValues,
            documents: ctx.documents as readonly FileUpload[],
            isAdminTransfer: true,
          }).pipe(
            switchMap(() => {
              deps.context.payerWallets.delete(ctx.entity.id!);
              deps.context.settlementRefreshKey += 1;
              return deps.data.fetchExpenseById(ctx.entity.id!).pipe(
                catchError(() => of(ctx.entity)),
                map(expense => expense ?? ctx.entity),
              );
            }),
          );
        },
        success: {
          mode: 'updateEntity',
          reopenDetail: true,
          message: 'Wallet topped up successfully. Review balance, then reimburse.',
        },
      },
    },
    operations: {
      submitForReimbursement: expense => {
        if (!expense?.id || !isUnsubmittedExpenseStatus(expense.status)) return;
        deps.data.updateExpense(expense.id, { status: 'SUBMITTED' }).subscribe({
          next: updated => {
            deps.onExpenseUpdated?.(updated);
            deps.modal.openNotificationModal({
              title: 'Expense updated',
              description: `Expense ${updated.id} was submitted for reimbursement.`,
            }, 'notification', 'success');
          },
          error: () => deps.modal.openNotificationModal({
            title: 'Submit failed',
            description: 'Could not submit expense for reimbursement.',
          }, 'notification', 'error'),
        });
      },
      approveAndSettle: expense => {
        if (!expense?.id) return;
        const walletId = deps.context.payerWallets.get(expense.id)?.id;
        if (!walletId) {
          deps.modal.openNotificationModal({
            title: 'Wallet unavailable',
            description: 'No active wallet was found for the payer.',
          }, 'notification', 'error');
          return;
        }
        deps.modal.openNotificationModal({
          title: 'Approve and Reimburse',
          description: `Confirm reimbursement of ${expense.formattedAmount ?? expense.finalAmount} from wallet ${walletId}.`,
        }, 'confirmation', 'warning').onAccept$.subscribe(() => {
          deps.data.approveAndSettle(expense.id!, walletId).subscribe({
            next: updated => {
              deps.onExpenseUpdated?.(updated);
              deps.modal.openNotificationModal({
                title: 'Expense updated',
                description: `Expense ${updated.id} was reimbursed successfully.`,
              }, 'notification', 'success');
            },
            error: () => deps.modal.openNotificationModal({
              title: 'Reimbursement failed',
              description: 'Could not approve and reimburse this expense.',
            }, 'notification', 'error'),
          });
        });
      },
      navigateToTransaction: expense => {
        const accountId = expense.settlementAccountId
          ?? (expense.id ? deps.context.payerWallets.get(expense.id)?.id : undefined);
        if (!expense.txnNumber || !accountId) return;
        const route = buildExpenseTransactionRoute(expense, accountId);
        void deps.router.navigate(route.commands, { queryParams: route.queryParams });
      },
      navigateCreateWallet: expense => {
        if (!expense?.paidBy?.id) {
          deps.modal.openNotificationModal({
            title: 'Payer missing',
            description: 'This expense has no payer to create a wallet for.',
          }, 'notification', 'error');
          return;
        }
        const route = buildCreateWalletRoute(expense);
        void deps.router.navigate(route.commands, { queryParams: route.queryParams });
      },
    },
    meta: {
      id: 'finance-expense',
      title: 'Expense',
      pageName: deps.context.pageName,
      searchPlaceholder: 'Search by expense ID',
      filterSheetTitle: 'Expense Filters',
      emptyMessage: 'No expenses match this filter.',
      detailRouteSync: { idParam: 'expenseId', idParamAliases: ['id'] },
    },
    permissions: { resolve: () => permissions() },
    behavior: {
      canUpdateEntity: context =>
        isMineChip(context.activeChip as ExpensePrimaryChip)
        && (!!context.permissions['canUpdateEntity']
          || !!context.permissions['showCreateFab']),
    },
    preparation: {
      tasks: [
        {
          id: 'member-event-options',
          cache: 'instance',
          run: async (context: ExpenseListContext) => {
            const options = await firstValueFrom(forkJoin({
              members: deps.data.fetchMemberOptions().pipe(catchError(() => of([] as FieldOption[]))),
              events: deps.data.fetchEventOptions().pipe(catchError(() => of([] as FieldOption[]))),
            }));
            context.memberOptions = options.members;
            context.eventOptions = options.events;
            context.createOptions = createOptionsFromContext(context);
            return options;
          },
        },
        {
          id: 'settlement-detail',
          cache: {
            policy: 'byInputs',
            inputs: (context: ExpenseListContext) => {
              const expense = context.selectedExpense;
              return expense && {
                id: expense.id,
                status: expense.status,
                name: expense.name,
                finalAmount: expense.finalAmount,
                remarks: expense.remarks,
                txnNumber: expense.txnNumber,
                refreshKey: context.settlementRefreshKey,
              };
            },
          },
          run: async (context: ExpenseListContext) => {
            const selected = context.selectedExpense;
            if (!selected?.id) return {};
            const expense = await firstValueFrom(
              deps.data.fetchExpenseById(selected.id).pipe(catchError(() => of(undefined))),
            ) ?? selected;
            context.selectedExpense = expense;
            const wallet = await firstValueFrom(
              deps.data.fetchPayerWallet(expense.paidBy?.id).pipe(
                catchError(() => of(undefined)),
              ),
            );
            context.payerWallets.set(expense.id!, wallet);
            return { expense, wallet };
          },
        },
        {
          id: 'funding-accounts',
          cache: 'instance',
          run: async (context: ExpenseListContext) => {
            const page = await firstValueFrom(
              deps.accounts.fetchAccounts({
                pageIndex: 0,
                pageSize: 100,
                filter: {
                  type: ['BANK'],
                  status: ['ACTIVE'],
                  ownerType: ['ORG'],
                },
              }).pipe(catchError(() => of({ content: [] as Account[] }))),
            );
            context.fundingAccounts = page.content ?? [];
            return context.fundingAccounts;
          },
        },
      ],
      triggers: {
        init: ['member-event-options'],
        filterOpen: ['member-event-options'],
        createOpen: ['member-event-options'],
        editPrepare: ['member-event-options', 'settlement-detail'],
        operation: ['settlement-detail'],
        detail: ['settlement-detail'],
      },
    },
    actions: {
      detailFooter: [
        {
          id: 'editDraft',
          label: 'Edit',
          appearance: 'secondary',
          when: ctx => {
            const entity = ctx.entity as Expense | undefined;
            return isMineChip(ctx.activeChip as ExpensePrimaryChip)
              && isUnsubmittedExpenseStatus(entity?.status);
          },
          run: 'editExpense',
          actionFormId: 'editExpense',
        },
        {
          id: 'editSubmitted',
          label: 'Edit',
          appearance: 'secondary',
          when: ctx => {
            const entity = ctx.entity as Expense | undefined;
            return isMineChip(ctx.activeChip as ExpensePrimaryChip)
              && entity?.status === 'SUBMITTED';
          },
          run: 'enterEdit',
        },
        {
          id: 'submitForReimburse',
          label: 'Submit for reimbursement',
          appearance: 'primary',
          when: ctx => {
            const entity = ctx.entity as Expense | undefined;
            return isMineChip(ctx.activeChip as ExpensePrimaryChip)
              && isUnsubmittedExpenseStatus(entity?.status);
          },
          run: 'submitForReimbursement',
        },
        {
          id: 'viewTransaction',
          label: 'View transaction',
          appearance: 'secondary',
          when: ctx => {
            const entity = ctx.entity as Expense | undefined;
            const accountId = entity?.settlementAccountId
              ?? (entity?.id ? deps.context.payerWallets.get(entity.id)?.id : undefined);
            return entity?.status === 'SETTLED' && !!entity.txnNumber && !!accountId;
          },
          run: 'navigateToTransaction',
        },
        {
          id: 'sendBack',
          label: 'Send back',
          appearance: 'secondary',
          when: ctx => {
            const entity = ctx.entity as Expense | undefined;
            return !!ctx.permissions['canSendBack']
              && ctx.activeChip === 'pending_reimburse'
              && (entity?.status === 'SUBMITTED' || entity?.status === 'FINALIZED');
          },
          run: 'sendBack',
          actionFormId: 'sendBack',
        },
        {
          id: 'createWallet',
          label: 'Create wallet',
          appearance: 'primary',
          when: ctx => {
            const entity = ctx.entity as Expense | undefined;
            const wallet = getExpensePayerWallet(deps.context, entity);
            return canAdminSettleActions({
              permissions: ctx.permissions,
              activeChip: ctx.activeChip,
              entity,
            })
              && !!ctx.permissions['canCreateAccount']
              && !!entity?.paidBy?.id
              && resolveSettlementReadiness(entity, wallet) === 'noWallet';
          },
          run: 'navigateCreateWallet',
        },
        {
          id: 'topUpWallet',
          label: 'Top up wallet',
          appearance: 'primary',
          when: ctx => {
            const entity = ctx.entity as Expense | undefined;
            const wallet = getExpensePayerWallet(deps.context, entity);
            return canAdminSettleActions({
              permissions: ctx.permissions,
              activeChip: ctx.activeChip,
              entity,
            })
              && resolveSettlementReadiness(entity, wallet) === 'needsTopUp';
          },
          run: 'topUpWallet',
          actionFormId: 'topUpWallet',
        },
        {
          id: 'approveAndReimburse',
          label: 'Approve and Reimburse',
          appearance: 'primary',
          when: ctx => {
            const entity = ctx.entity as Expense | undefined;
            const wallet = getExpensePayerWallet(deps.context, entity);
            return canAdminSettleActions({
              permissions: ctx.permissions,
              activeChip: ctx.activeChip,
              entity,
            })
              && resolveSettlementReadiness(entity, wallet) === 'ready';
          },
          run: 'approveAndSettle',
        },
      ],
      floating: [
        {
          id: 'create',
          label: 'Add expense',
          appearance: 'fab',
          when: ctx => !!ctx.permissions['showCreateFab'],
          run: 'openCreate',
        },
      ],
    },
  };
}

/** @deprecated Prefer importing from expense.rules — kept for secured-dashboard deep link. */
export { EXPENSE_MINE_UNSETTLED_ROUTE_QUERY } from './expense.rules';

/** Kept for API data-source helpers that build filters. */
export { buildExpenseApiFilter, normalizeExpenseChip as normalizeExpenseChipId } from './expense.rules';
