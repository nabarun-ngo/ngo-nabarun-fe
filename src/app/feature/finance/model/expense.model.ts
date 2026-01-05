/**
 * Domain models for Expense feature
 */

import { Account } from './account.model';
import { PagedResult } from '../../../shared/model/paged-result.model';

export interface ExpenseItem {
  itemName: string;
  description?: string;
  amount: number;

  // Computed properties
  formattedAmount: string;
}

export interface Expense {
  id?: string;
  name?: string;
  description?: string;
  expenseDate?: string;
  expenseRefId?: string;
  expenseRefType?: 'OTHER' | 'EVENT' | 'ADHOC' | 'OPERATIONAL' | 'ADMINISTRATIVE';
  finalAmount?: number;
  status?: 'DRAFT' | 'SUBMITTED' | 'FINALIZED' | 'SETTLED' | 'REJECTED';
  expenseItems?: ExpenseItem[];
  settlementAccount?: Account;
  txnNumber?: string;
  remarks?: string;
  isDeligated?: boolean;
  settlementAccountId?: string;

  // User references
  createdBy?: {
    id?: string;
    fullName?: string;
    email?: string;
  };
  paidBy?: {
    id?: string;
    fullName?: string;
    email?: string;
  };
  finalizedBy?: {
    id?: string;
    fullName?: string;
    email?: string;
  };
  settledBy?: {
    id?: string;
    fullName?: string;
    email?: string;
  };
  rejectedBy?: {
    id?: string;
    fullName?: string;
    email?: string;
  };

  // Dates
  createdOn?: string;
  finalizedOn?: string;
  settledOn?: string;
  rejectedOn?: string;

  // Computed properties
  displayName?: string;
  formattedAmount?: string;
  formattedDate?: string;
  statusLabel?: string;
  isSettled?: boolean;
  isFinalized?: boolean;
  canEdit?: boolean;

  //
  payerId?: string;
}

/**
 * Type alias for paged expense results
 */
export type PagedExpenses = PagedResult<Expense>;

