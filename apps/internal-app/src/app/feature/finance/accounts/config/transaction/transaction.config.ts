import type { ListDashboardConfig } from '@nabarun-ngo/list-dashboard-core';
import { catchError, map, of } from 'rxjs';
import type { AccountDataSource } from '../../data/account-data.source';
import type {
  AccountRefData,
  Transaction,
  TransactionListContext,
  TransactionListCriteria,
} from '../../domain';
import {
  buildTransactionFilterForm,
  buildTransactionReadonlyForm,
  transactionCriteriaToValues,
  transactionValuesToCriteria,
} from './transaction.forms';
import {
  TRANSACTION_DEFAULT_CHIP,
  TRANSACTION_LIST_ROUTE_FILTER_BINDINGS,
  buildTransactionAppliedFilters,
  cloneTransactionCriteria,
  countActiveTransactionSheetFilters,
  getDefaultTransactionCriteria,
  removeTransactionFilterById,
} from './transaction.rules';
import {
  buildTransactionDocuments,
  buildTransactionDocumentsLoading,
  buildTransactionListDetailSections,
  mapTransactionListRow,
} from './transaction.view';

export type TransactionListConfig = ListDashboardConfig<
  Transaction,
  TransactionListCriteria,
  TransactionListContext,
  TransactionListOperations
>;

export type TransactionListOperations = {
  loadAccount(
    accountId: string,
    isSelf: boolean,
  ): ReturnType<AccountDataSource['fetchAccountById']>;
  loadDocuments(
    transactionId: string,
  ): ReturnType<AccountDataSource['getTransactionDocuments']>;
};

const MOBILE_PAGE_SIZE = 12;

export function createTransactionListConfig(deps: {
  data: AccountDataSource;
  context: TransactionListContext;
}): TransactionListConfig {
  return {
    list: {
      pageSize: MOBILE_PAGE_SIZE,
      chips: [],
      defaultChip: TRANSACTION_DEFAULT_CHIP,
      isValidChip: () => true,
      route: {
        chipConfig: {
          defaultChip: TRANSACTION_DEFAULT_CHIP,
          normalize: () => TRANSACTION_DEFAULT_CHIP,
        },
        filterBindings: TRANSACTION_LIST_ROUTE_FILTER_BINDINGS,
      },
      cloneCriteria: cloneTransactionCriteria,
      getDefaultCriteriaForChip: () => getDefaultTransactionCriteria(),
      buildFilterFormDefinition: (_chip, refData) =>
        buildTransactionFilterForm(refData as AccountRefData),
      criteriaToFilterFormValues: (_chip, criteria) => transactionCriteriaToValues(criteria),
      filterFormValuesToCriteria: (_chip, values) =>
        transactionValuesToCriteria(values),
      buildAppliedFilters: (criteria, refData) =>
        buildTransactionAppliedFilters(criteria, refData as AccountRefData),
      countActiveSheetFilters: countActiveTransactionSheetFilters,
      removeFilterById: removeTransactionFilterById,
      loadPage: query => deps.data.loadTransactionListPage({
        accountId: deps.context.accountId,
        isSelf: deps.context.isSelf,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
        criteria: query.criteria as TransactionListCriteria,
        searchText: query.searchText,
      }).pipe(
        map(page => ({
          items: (page.content ?? []).map(mapTransactionListRow),
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
      ),
      mapToListRow: entity => mapTransactionListRow(entity),
    },
    detail: {
      getTitle: txn => txn.transactionRef ?? txn.txnId ?? 'Transaction',
      getEntityId: txn => txn.txnId,
      buildViewSections: txn => buildTransactionListDetailSections(txn),
      documents: {
        buildLoadingSection: buildTransactionDocumentsLoading,
        resolveEntityId: entity => entity.txnId,
        loadSection: entityId => deps.data.getTransactionDocuments(entityId).pipe(
          map(buildTransactionDocuments),
          catchError(() => of(buildTransactionDocuments([]))),
        ),
      },
      fetchById: () => of(undefined),
      findInList: (items, id) => items
        .map(item => item.payload as Transaction | undefined)
        .find(txn =>
          txn?.txnId === id
          || txn?.transactionRef === id
          || txn?.txnNumber === id,
        ),
      edit: {
        buildEditSummary: () => [],
        buildEditForm: () => buildTransactionReadonlyForm(),
        entityToEditValues: () => ({}),
        save: ctx => of(ctx.entity),
      },
    },
    operations: {
      loadAccount: (accountId, isSelf) =>
        deps.data.fetchAccountById(accountId, isSelf),
      loadDocuments: transactionId =>
        deps.data.getTransactionDocuments(transactionId),
    },
    meta: {
      id: 'finance.account-transactions',
      title: 'Transaction',
      pageName: 'Transactions',
      searchPlaceholder: 'Search by transaction ref',
      filterSheetTitle: 'Transaction Filters',
      emptyMessage: 'No transactions match this filter.',
      detailRouteSync: {
        idParam: 'transactionRef',
        idParamAliases: ['txnId'],
      },
    },
  };
}
