import type { FormValues } from '@nabarun-ngo/forms-core';
import { isNonEmpty } from './validation.helpers';

export type AccountBankValidationType = 'BANK' | 'INVESTMENT' | 'WALLET';

const BANK_FORM_VALUE_KEYS = [
  'bankAccountNumber',
  'bankAccountHolderName',
  'bankName',
  'bankAccountType',
  'bankBranch',
  'IFSCNumber',
  'maturityDate',
  'maturityAmount',
  'investmentAmount',
  'sourceAccountId',
  'dematId',
  'interestRate',
  'interestPayingTerm',
] as const;

export function allowsUpiOnEdit(accountType: string | undefined): boolean {
  return accountType === 'BANK' || accountType === 'WALLET';
}

export function requiresBankOnEdit(accountType: string | undefined): boolean {
  return accountType === 'BANK' || accountType === 'INVESTMENT';
}

export function requiresBankOnCreate(accountType: string | undefined): boolean {
  return accountType === 'BANK' || accountType === 'INVESTMENT';
}

export function hasBankFormValues(values: FormValues): boolean {
  return BANK_FORM_VALUE_KEYS.some(key => {
    const value = values[key];
    return value != null && String(value).trim() !== '';
  });
}

export function validateAccountBankValues(
  accountType: AccountBankValidationType,
  values: FormValues,
  options: {
    requireDescription?: boolean;
    walletAllOrNothing?: boolean;
    requireFunding?: boolean;
  } = {},
): string | undefined {
  if (accountType === 'WALLET') {
    if (options.walletAllOrNothing === false) {
      return undefined;
    }
    if (!hasBankFormValues(values)) {
      return undefined;
    }
    return validateBankCoreFields(values);
  }

  if (accountType === 'BANK') {
    return validateBankCoreFields(values);
  }

  if (accountType === 'INVESTMENT') {
    if (options.requireDescription && !isNonEmpty(values['description'])) {
      return 'Description is required for investment accounts.';
    }
    if (!isNonEmpty(values['bankAccountNumber'])) return 'Account or folio number is required.';
    if (!isNonEmpty(values['bankName'])) return 'Provider name is required.';
    if (!isNonEmpty(values['bankAccountType'])) return 'Investment type is required.';
    if (options.requireFunding) {
      const amount = Number(values['investmentAmount']);
      if (!Number.isFinite(amount) || amount <= 0) {
        return 'Investment amount must be greater than zero.';
      }
      if (!isNonEmpty(values['sourceAccountId'])) {
        return 'Source bank account is required.';
      }
    }
    if (isNonEmpty(values['maturityAmount'])) {
      const estimated = Number(values['maturityAmount']);
      if (!Number.isFinite(estimated) || estimated <= 0) {
        return 'Estimated maturity amount must be greater than zero when provided.';
      }
    }
  }

  return undefined;
}

function validateBankCoreFields(values: FormValues): string | undefined {
  if (!isNonEmpty(values['bankAccountNumber'])) return 'Bank account number is required.';
  if (!isNonEmpty(values['bankAccountHolderName'])) return 'Bank account holder name is required.';
  if (!isNonEmpty(values['bankAccountType'])) return 'Bank account type is required.';
  if (!isNonEmpty(values['IFSCNumber'])) return 'IFSC is required for bank accounts.';
  return undefined;
}
