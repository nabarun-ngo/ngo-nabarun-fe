/**
 * Domain models for Transaction feature
 */

import { PagedResult } from '../../../shared/model/paged-result.model';

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

  // Account references
  transferFrom?: string;
  transferTo?: string;

  // Computed properties
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

/**
 * Type alias for paged transaction results
 */
export type PagedTransactions = PagedResult<Transaction>;

