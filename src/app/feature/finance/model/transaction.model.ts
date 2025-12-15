/**
 * Domain models for Transaction feature
 */

import { Account } from './account.model';
import { PagedResult } from '../../../shared/model/paged-result.model';

export interface Transaction {
  txnId: string;
  txnNumber?: string;
  txnDate: string;
  txnType: 'IN' | 'OUT' | 'TRANSFER';
  txnStatus: 'SUCCESS' | 'FAILURE' | 'REVERT';
  txnAmount: number;
  txnDescription: string;
  txnParticulars?: string;
  txnRefId?: string;
  txnRefType?: 'DONATION' | 'NONE' | 'EXPENSE' | 'EARNING';
  accBalance?: number;
  comment?: string;

  // Account references
  account?: Account;
  transferFrom?: Account;
  transferTo?: Account;

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

