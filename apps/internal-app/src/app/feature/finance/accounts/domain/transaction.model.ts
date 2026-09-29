import type { PagedResult } from 'src/app/shared/models/paged-result.model';

export interface Transaction {
  txnId: string;
  txnNumber?: string;
  transactionRef: string;
  txnDate: string;
  txnType: 'IN' | 'OUT';
  txnStatus: 'SUCCESS' | 'REVERSED';
  txnAmount: number;
  txnDescription: string;
  txnParticulars?: string;
  accTxnType?: string;
  txnRefId?: string;
  txnRefType?: 'DONATION' | 'NONE' | 'EXPENSE' | 'EARNING' | 'TXN_REVERSE';
  accBalance?: number;
  comment?: string;
  transferFrom?: string;
  transferTo?: string;
  displayName: string;
  formattedAmount: string;
  formattedDate: string;
  formattedBalance: string;
  typeLabel: string;
  statusLabel: string;
  isSuccess: boolean;
  isTransfer: boolean;
  isIncoming: boolean;
  isOutgoing: boolean;
}

export type PagedTransactions = PagedResult<Transaction>;

export interface TransactionListCriteria {
  [key: string]: unknown;
  txnId?: string;
  txnType?: string[];
  txnStatus?: string[];
  transactionRef?: string;
  startDate?: string;
  endDate?: string;
}

export interface TransactionListContext {
  [key: string]: unknown;
  accountId: string;
  isSelf: boolean;
}

export type TransactionApiFilter = {
  transactionRef?: string;
  txnType?: string | string[];
  txnStatus?: string | string[];
  txnId?: string;
  startDate?: string;
  endDate?: string;
};

export function createTransactionListContext(options: {
  accountId: string;
  isSelf: boolean;
}): TransactionListContext {
  return {
    accountId: options.accountId,
    isSelf: options.isSelf,
  };
}
