/**
 * Account domain models (core entity + list-dashboard types).
 */

import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { PagedResult } from 'src/app/shared/models/paged-result.model';

export type AccountType = 'BANK' | 'INVESTMENT' | 'WALLET';
export type AccountOwnerType = 'ORG' | 'INDIVIDUAL';

export type InterestPayingTerm =
  | 'MONTHLY'
  | 'QUARTERLY'
  | 'HALF_YEARLY'
  | 'YEARLY'
  | 'AT_MATURITY'
  | 'OTHER';

export interface Account {
  id: string;
  accountId?: string;
  accountHolderName?: string;
  accountHolder?: string;
  ownerType?: AccountOwnerType;
  custodianUserIds?: string[];
  /** @deprecated Use custodianUserIds */
  custodianUserId?: string;
  accountType: AccountType;
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'CLOSED';
  balance: number;
  activatedOn?: string;
  description?: string;
  bankDetail?: BankDetail;
  /** @deprecated Use upiDetails */
  upiDetail?: UpiDetail;
  upiDetails?: UpiDetail[];
  displayName: string;
  isActive: boolean;
  formattedBalance: string;
  accountTypeLabel: string;
  ownerTypeLabel?: string;
}

export interface BankDetail {
  ifscNumber?: string;
  accountHolderName?: string;
  accountNumber?: string;
  accountType?: string;
  branch?: string;
  bankName?: string;
  maturityDate?: string;
  maturityAmount?: number;
  investmentAmount?: number;
  sourceAccountId?: string;
  dematId?: string;
  interestRate?: number;
  interestPayingTerm?: InterestPayingTerm | string;
  displayName?: string;
  formattedAccountNumber?: string;
}

export interface UpiDetail {
  id?: string;
  upiId?: string;
  payeeName?: string;
  mobileNumber?: string;
  qrData?: string;
  label?: string;
  isPrimary?: boolean;
  displayName?: string;
}

export interface IfscDetails {
  ifsc: string;
  bankName: string;
  branch: string;
}

export type PagedAccounts = PagedResult<Account>;

export interface AccountCreatePayload {
  accountType: AccountType;
  ownerType: AccountOwnerType;
  accountHolder?: string;
  custodianUserIds?: string[];
  description?: string;
  bankDetail?: BankDetail;
  upiDetails?: UpiDetail[];
}

export interface AccountDetailsUpdatePayload {
  description?: string;
  bankDetail?: BankDetail;
  upiDetails?: UpiDetail[];
}

export type AccountPrimaryChip = 'mine' | 'active' | 'closed';

export interface AccountListCriteria {
  [key: string]: unknown;
  accountId?: string;
  type?: Account['accountType'][];
  ownerType?: Account['ownerType'][];
  status?: Account['status'][];
  accountHolderId?: string;
  accountHolderName?: string;
}

export interface AccountListContext {
  [key: string]: unknown;
  memberOptions: FieldOption[];
  sourceBankOptions: FieldOption[];
}

export interface AccountStatusGroups {
  outstanding: string[];
  closed: string[];
  excluded: string[];
}

export interface TransferMatrixRow {
  fromAccountType: string;
  reference: string;
  toAccountTypes: string[];
}

export type AccountRefData = Record<
  string,
  KeyValue[] | AccountStatusGroups | TransferMatrixRow[] | undefined
>;

export function createAccountListContext(): AccountListContext {
  return { memberOptions: [], sourceBankOptions: [] };
}
