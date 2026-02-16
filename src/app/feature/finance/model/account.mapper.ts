/**
 * Mapper functions to convert API client models to domain models
 */

import {
  AccountDetailDto,
  PagedResultAccountDetailDto,
  BankDetailDto,
  UpiDetailDto
} from 'src/app/core/api-client/models';
import { Account, BankDetail, UpiDetail, PagedAccounts } from './account.model';
import { mapPagedResult } from '../../../shared/model/paged-result.model';

/**
 * Map API BankDetailDto to domain BankDetail
 */
function mapBankDetail(dto: BankDetailDto | undefined): BankDetail | undefined {
  if (!dto) return undefined;

  const accountNumber = dto.bankAccountNumber;
  const maskedAccountNumber = accountNumber
    ? `${accountNumber.slice(0, 4)}****${accountNumber.slice(-4)}`
    : undefined;

  return {
    ifscNumber: dto.IFSCNumber,
    accountHolderName: dto.bankAccountHolderName,
    accountNumber: dto.bankAccountNumber,
    accountType: dto.bankAccountType,
    branch: dto.bankBranch,
    bankName: dto.bankName,
    displayName: dto.bankName ? `${dto.bankName}${dto.bankBranch ? ` - ${dto.bankBranch}` : ''}` : undefined,
    formattedAccountNumber: maskedAccountNumber
  };
}

/**
 * Map API UpiDetailDto to domain UpiDetail
 */
function mapUpiDetail(dto: UpiDetailDto | undefined): UpiDetail | undefined {
  if (!dto) return undefined;

  return {
    upiId: dto.upiId,
    payeeName: dto.payeeName,
    mobileNumber: dto.mobileNumber,
    qrData: dto.qrData,
    displayName: dto.upiId || dto.payeeName || undefined
  };
}

/**
 * Get account type label
 */
function getAccountTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'PRINCIPAL': 'Principal',
    'GENERAL': 'General',
    'DONATION': 'Donation',
    'PUBLIC_DONATION': 'Public Donation'
  };
  return labels[type] || type;
}

/**
 * Map API AccountDetailDto to domain Account
 */
export function mapAccountDtoToAccount(dto: AccountDetailDto): Account {
  const accountId = dto.id || '';
  const accountName = dto.accountHolderName || dto.accountHolder || 'Unknown';

  return {
    id: dto.id,
    accountId: dto.id, // Using id as accountId if not provided separately
    accountHolderName: dto.accountHolderName || dto.accountHolder,
    accountType: dto.accountType,
    status: dto.accountStatus,
    // balance: balance,
    activatedOn: dto.activatedOn,
    bankDetail: mapBankDetail(dto.bankDetail),
    upiDetail: mapUpiDetail(dto.upiDetail),

    // Computed properties
    displayName: `${accountId} - ${accountName}`,
    isActive: dto.accountStatus === 'ACTIVE',
    formattedBalance: `₹ 0`,
    accountTypeLabel: getAccountTypeLabel(dto.accountType)
  };
}

/**
 * Map API PagedResultAccountDetailDto to domain PagedAccounts
 */
export function mapPagedAccountDtoToPagedAccounts(dto: PagedResultAccountDetailDto): PagedAccounts {
  return mapPagedResult(dto, mapAccountDtoToAccount);
}

