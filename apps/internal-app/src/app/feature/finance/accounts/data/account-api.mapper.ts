/**
 * Mapper functions to convert API client models to domain models
 */

import {
  AccountDetailDto,
  AccountListResponseDto,
  BankDetailDto,
  UpiDetailDto,
} from 'src/app/core/api/api-client/models';
import { mapPagedResult } from 'src/app/shared/models/paged-result.model';
import type {
  Account,
  BankDetail,
  UpiDetail,
  PagedAccounts,
} from '../domain';

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
    maturityDate: dto.maturityDate,
    maturityAmount: dto.maturityAmount,
    investmentAmount: dto.investmentAmount,
    sourceAccountId: dto.sourceAccountId,
    dematId: dto.dematId,
    interestRate: dto.interestRate,
    interestPayingTerm: dto.interestPayingTerm,
    displayName: dto.bankName
      ? `${dto.bankName}${dto.bankBranch ? ` - ${dto.bankBranch}` : ''}`
      : undefined,
    formattedAccountNumber: maskedAccountNumber,
  };
}

function mapUpiDetail(dto: UpiDetailDto | undefined): UpiDetail | undefined {
  if (!dto) return undefined;

  return {
    id: dto.id,
    upiId: dto.upiId,
    payeeName: dto.payeeName,
    mobileNumber: dto.mobileNumber,
    qrData: dto.qrData,
    label: dto.label,
    isPrimary: dto.isPrimary,
    displayName: dto.upiId || dto.payeeName || undefined,
  };
}

function mapUpiDetails(
  dtos: UpiDetailDto[] | undefined,
  legacy?: UpiDetailDto,
): UpiDetail[] | undefined {
  if (dtos?.length) {
    return dtos.map(d => mapUpiDetail(d)!).filter(Boolean);
  }
  const legacyDetail = mapUpiDetail(legacy);
  return legacyDetail ? [legacyDetail] : undefined;
}

function getAccountTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    BANK: 'Bank Account',
    INVESTMENT: 'Investment Account',
    WALLET: 'Wallet',
  };
  return labels[type] || type;
}

function getOwnerTypeLabel(ownerType?: string): string {
  if (ownerType === 'ORG') return 'Organization';
  if (ownerType === 'INDIVIDUAL') return 'Individual';
  return ownerType ?? '-';
}

function resolveCustodianUserIds(dto: AccountDetailDto): string[] | undefined {
  if (dto.custodianUserIds?.length) {
    return dto.custodianUserIds;
  }
  if (dto.custodianUserId) {
    return [dto.custodianUserId];
  }
  return undefined;
}

export function mapAccountDtoToAccount(dto: AccountDetailDto): Account {
  const accountId = dto.id || '';
  const accountName = dto.accountHolderName || dto.accountHolder || 'Unknown';
  const upiDetails = mapUpiDetails(dto.upiDetails, dto.upiDetail);

  return {
    id: dto.id,
    accountId: dto.id,
    accountHolderName: dto.accountHolderName || dto.accountHolder,
    accountHolder: dto.accountHolder,
    ownerType: dto.ownerType,
    custodianUserIds: resolveCustodianUserIds(dto),
    custodianUserId: resolveCustodianUserIds(dto)?.[0],
    accountType: dto.accountType,
    status: dto.accountStatus,
    balance: dto.balance ?? 0,
    activatedOn: dto.activatedOn,
    bankDetail: mapBankDetail(dto.bankDetail),
    upiDetails,
    upiDetail: upiDetails?.find(u => u.isPrimary) ?? upiDetails?.[0],
    displayName: `${accountId} - ${accountName}`,
    isActive: dto.accountStatus === 'ACTIVE',
    formattedBalance: `₹${(dto.balance ?? 0).toLocaleString('en-IN')}`,
    accountTypeLabel: getAccountTypeLabel(dto.accountType),
    ownerTypeLabel: getOwnerTypeLabel(dto.ownerType),
  };
}

export function mapPagedAccountDtoToPagedAccounts(dto: AccountListResponseDto): PagedAccounts {
  return mapPagedResult(dto, mapAccountDtoToAccount);
}

export function mapBankDetailToApi(banking: BankDetail): BankDetailDto {
  return {
    IFSCNumber: banking.ifscNumber,
    bankAccountHolderName: banking.accountHolderName,
    bankAccountNumber: banking.accountNumber,
    bankAccountType: banking.accountType,
    bankBranch: banking.branch,
    bankName: banking.bankName,
    maturityDate: banking.maturityDate,
    maturityAmount: banking.maturityAmount,
    investmentAmount: banking.investmentAmount,
    sourceAccountId: banking.sourceAccountId,
    dematId: banking.dematId,
    interestRate: banking.interestRate,
    interestPayingTerm: banking.interestPayingTerm,
  };
}

export function mapUpiDetailToApi(upi: UpiDetail): UpiDetailDto {
  return {
    id: upi.id,
    upiId: upi.upiId,
    payeeName: upi.payeeName,
    mobileNumber: upi.mobileNumber,
    qrData: upi.qrData,
    label: upi.label,
    isPrimary: upi.isPrimary,
  };
}
