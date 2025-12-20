/**
 * Domain models for Account feature
 * These models are used by components and are decoupled from API client models
 */

import { PagedResult } from '../../../shared/model/paged-result.model';

export interface Account {
  id: string;
  accountId?: string;
  accountHolderName?: string;
  accountHolder?: string;
  accountType: 'PRINCIPAL' | 'GENERAL' | 'DONATION' | 'PUBLIC_DONATION' | 'WALLET';
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'CLOSED';
  balance: number;
  activatedOn?: string;
  bankDetail?: BankDetail;
  upiDetail?: UpiDetail;
  openingBalance?: number;
  // Computed properties for UI
  displayName: string;
  isActive: boolean;
  formattedBalance: string;
  accountTypeLabel: string;
}

export interface BankDetail {
  ifscNumber?: string;
  accountHolderName?: string;
  accountNumber?: string;
  accountType?: string;
  branch?: string;
  bankName?: string;

  // Computed properties
  displayName?: string;
  formattedAccountNumber?: string;
}

export interface UpiDetail {
  upiId?: string;
  payeeName?: string;
  mobileNumber?: string;
  qrData?: string;

  // Computed properties
  displayName?: string;
}

/**
 * Type alias for paged account results
 */
export type PagedAccounts = PagedResult<Account>;

