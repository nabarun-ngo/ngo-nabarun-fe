import type {
  FieldOption,
  FormDefinition,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import { baseField, toFieldOptions } from '@nabarun-ngo/forms-core';
import type { CfFormStepperStep } from '@nabarun-ngo/forms-angular';
import { EMPTY, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap } from 'rxjs/operators';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import {
  buildBankFieldsWithIfsc,
  buildBankingDetailFields,
  buildInvestmentFields,
} from './account-bank-fields';
import {
  allowsUpiOnEdit,
  hasBankFormValues,
  requiresBankOnCreate,
  requiresBankOnEdit,
  validateAccountBankValues,
} from './account-bank-validation';
import { isNonEmpty, toStringArray } from './validation.helpers';
import { AccountConstant } from '../../../finance.const';
import type {
  Account,
  AccountCreatePayload,
  AccountDetailsUpdatePayload,
  AccountListCriteria,
  AccountPrimaryChip,
  AccountRefData,
  BankDetail,
  IfscDetails,
  TransferMatrixRow,
  UpiDetail,
} from '../../domain';
import type {
  AccountDataSource,
  AccountTransferPayload,
  AccountTransferReference,
} from '../../data/account-data.source';
import { isOrgScopeChip } from './account.rules';
import {
  confirmIfscDetails,
  IFSC_NOT_FOUND_MESSAGE,
  isIfscLookupResultValid,
  isValidIfscFormat,
  needsIfscLookupOnSubmit,
  normalizeIfsc,
  resolveIfscSubmitError,
} from './account.ifsc';

export {
  allowsUpiOnEdit,
  requiresBankOnCreate,
  requiresBankOnEdit,
} from './account-bank-validation';

function refKeyValues(
  refData: AccountRefData | Record<string, KeyValue[]> | undefined,
  key: string,
): KeyValue[] {
  const value = refData?.[key];
  return Array.isArray(value) && value.every(item => item && typeof item === 'object' && 'key' in item)
    ? value as KeyValue[]
    : [];
}

function bankFieldOptionsFromRefData(refData: AccountRefData | Record<string, KeyValue[]> | undefined) {
  return {
    bankAccountTypeOptions: toFieldOptions(
      refKeyValues(refData, AccountConstant.refDataKey.bankAccountType),
    ),
    investmentTypeOptions: toFieldOptions(
      refKeyValues(refData, AccountConstant.refDataKey.investmentType),
    ),
    interestPayingTermOptions: toFieldOptions(
      refKeyValues(refData, AccountConstant.refDataKey.interestPayingTerm),
    ),
  };
}
export type AccountCreateStep = 'setup' | 'bank' | 'investment' | 'maturity' | 'upi';

export const ACCOUNT_CREATE_STEPPER_STEPS: CfFormStepperStep<AccountCreateStep>[] = [
  { id: 'setup', label: 'Account setup', kind: 'form' },
  { id: 'bank', label: 'Bank details', kind: 'form' },
  { id: 'investment', label: 'Investment details', kind: 'form' },
  { id: 'maturity', label: 'Maturity details', kind: 'form' },
  { id: 'upi', label: 'UPI IDs', kind: 'custom' },
];

export function resolveAccountCreateSteps(values: FormValues): AccountCreateStep[] {
  const accountType = String(values['accountType'] ?? '');
  if (!accountType) {
    return ['setup'];
  }
  if (accountType === 'INVESTMENT') {
    return ['setup', 'investment', 'maturity'];
  }
  if (accountType === 'WALLET' || accountType === 'BANK') {
    return ['setup', 'bank', 'upi'];
  }
  return ['setup'];
}

export interface AccountCreateFieldLocks {
  accountType?: boolean;
  ownerType?: boolean;
  accountHolder?: boolean;
}

export function accountCreateLocksFromPresets(
  presets: Record<string, unknown> = {},
): AccountCreateFieldLocks {
  const accountType = String(presets['accountType'] ?? '');
  const accountHolder = String(presets['accountHolder'] ?? '');
  const lockWalletHolder = accountType === 'WALLET' && !!accountHolder;
  return {
    accountType: lockWalletHolder || !!accountType,
    ownerType: lockWalletHolder || !!String(presets['ownerType'] ?? ''),
    accountHolder: lockWalletHolder,
  };
}

function buildSetupFields(
  refData: Record<string, KeyValue[]>,
  memberOptions: FieldOption[],
  locks: AccountCreateFieldLocks = {},
): FormFieldDefinition[] {
  const ownerTypeOptions = toFieldOptions(refData[AccountConstant.refDataKey.ownerType]);
  const accountTypeOptions = refData[AccountConstant.refDataKey.accountType] ?? [];
  return [
    baseField({
      id: 'accountType',
      key: 'accountType',
      label: 'Account Type',
      fieldType: 'select',
      sortOrder: 1,
      mandatory: true,
      enabled: !locks.accountType,
      fieldOptions: toFieldOptions(refData[AccountConstant.refDataKey.accountType]),
    }),
    baseField({
      id: 'ownerType',
      key: 'ownerType',
      label: 'Owner Type',
      fieldType: 'select',
      sortOrder: 2,
      mandatory: true,
      enabled: !locks.ownerType,
      fieldOptions: [],
      dependentOptions: {
        dependsOnKey: 'accountType',
        optionMap: buildOwnerTypeOptionMap(accountTypeOptions, ownerTypeOptions),
      },
      condition: { dependsOnKey: 'accountType', operator: 'not_equals', value: '' },
    }),
    baseField({
      id: 'accountHolder',
      key: 'accountHolder',
      label: 'Account Holder',
      fieldType: 'autocomplete',
      sortOrder: 3,
      mandatory: true,
      enabled: !locks.accountHolder,
      fieldOptions: memberOptions,
      condition: { dependsOnKey: 'ownerType', operator: 'equals', value: 'INDIVIDUAL' },
    }),
    baseField({
      id: 'custodianUserIds',
      key: 'custodianUserIds',
      label: 'Custodian',
      fieldType: 'multiselect',
      sortOrder: 4,
      fieldOptions: memberOptions,
      condition: { dependsOnKey: 'ownerType', operator: 'equals', value: 'ORG' },
    }),
    baseField({
      id: 'description',
      key: 'description',
      label: 'Description',
      fieldType: 'textarea',
      sortOrder: 5,
      condition: { dependsOnKey: 'accountType', operator: 'equals', value: 'INVESTMENT' },
      mandatory: true,
    }),
  ];
}

function buildCreateDetailStepFields(
  step: AccountCreateStep,
  values: FormValues,
  sourceBankOptions: FieldOption[] = [],
  refData: AccountRefData | Record<string, KeyValue[]> = {},
): FormFieldDefinition[] {
  const fieldOptions = bankFieldOptionsFromRefData(refData);
  if (step === 'bank' && values['accountType'] === 'BANK') {
    return buildBankFieldsWithIfsc({
      startOrder: 1,
      mandatory: true,
      idPrefix: 'BANK',
      bankAccountTypeOptions: fieldOptions.bankAccountTypeOptions,
    });
  }
  if (step === 'investment') {
    return buildInvestmentFields({
      startOrder: 1,
      mandatory: true,
      idPrefix: 'INVESTMENT',
      includeInterest: true,
      includeFunding: true,
      sourceBankOptions,
      investmentTypeOptions: fieldOptions.investmentTypeOptions,
      interestPayingTermOptions: fieldOptions.interestPayingTermOptions,
    });
  }
  if (step === 'bank' && values['accountType'] === 'WALLET') {
    return buildBankFieldsWithIfsc({
      startOrder: 1,
      mandatory: false,
      idPrefix: 'WALLET',
      bankAccountTypeOptions: fieldOptions.bankAccountTypeOptions,
    });
  }
  return [];
}

function buildMaturityStepFields(): FormFieldDefinition[] {
  return [
    baseField({
      id: 'maturityDate',
      key: 'maturityDate',
      label: 'Maturity Date',
      fieldType: 'date',
      sortOrder: 1,
      mandatory: false,
    }),
    baseField({
      id: 'maturityAmount',
      key: 'maturityAmount',
      label: 'Estimated Maturity Amount',
      fieldType: 'number',
      sortOrder: 2,
      mandatory: false,
    }),
  ];
}

export function buildAccountCreateStepDefinition(
  step: AccountCreateStep,
  refData: Record<string, KeyValue[]>,
  memberOptions: FieldOption[],
  values: FormValues,
  sourceBankOptions: FieldOption[] = [],
  locks: AccountCreateFieldLocks = {},
): FormDefinition {
  if (step === 'upi') {
    return {
      id: 'account-create-upi',
      key: 'account-create-upi',
      label: 'UPI IDs',
      description: '',
      fields: [],
    };
  }

  const fields = step === 'setup'
    ? buildSetupFields(refData, memberOptions, locks)
    : step === 'maturity'
      ? buildMaturityStepFields()
      : buildCreateDetailStepFields(step, values, sourceBankOptions, refData);

  return {
    id: `account-create-${step}`,
    key: `account-create-${step}`,
    label: step === 'setup'
      ? 'Account setup'
      : step === 'maturity'
        ? 'Maturity details'
        : step === 'investment'
          ? 'Investment details'
          : 'Bank details',
    description: '',
    fields,
  };
}

export function validateAccountCreateStep(
  step: AccountCreateStep,
  values: FormValues,
): string | undefined {
  if (step === 'setup') {
    const accountType = String(values['accountType'] ?? '');
    const ownerType = String(values['ownerType'] ?? '');
    if (accountType === 'WALLET' && ownerType === 'ORG') {
      return 'Organization is not allowed for wallet accounts.';
    }
    if (accountType === 'INVESTMENT' && !isNonEmpty(values['description'])) {
      return 'Description is required for investment accounts.';
    }
    if (ownerType === 'INDIVIDUAL' && !isNonEmpty(values['accountHolder'])) {
      return 'Account holder is required for individual accounts.';
    }
    return undefined;
  }
  if (step === 'upi') {
    return undefined;
  }
  if (step === 'maturity') {
    return validateAccountCreateMaturityValues(values);
  }
  return validateAccountCreateDetailValues(step, values);
}

function validateAccountCreateDetailValues(
  step: AccountCreateStep,
  values: FormValues,
): string | undefined {
  const accountType = String(values['accountType'] ?? '');
  if (step === 'investment' && accountType === 'INVESTMENT') {
    return validateAccountBankValues('INVESTMENT', values, {
      requireDescription: false,
      requireFunding: true,
    });
  }
  if (step === 'bank' && accountType === 'BANK') {
    return validateAccountBankValues(accountType, values, {
      requireDescription: false,
    });
  }
  if (step === 'bank' && accountType === 'WALLET') {
    return validateAccountBankValues('WALLET', values, { walletAllOrNothing: true });
  }
  return undefined;
}

function validateAccountCreateMaturityValues(values: FormValues): string | undefined {
  if (isNonEmpty(values['maturityAmount'])) {
    const amount = Number(values['maturityAmount']);
    if (!Number.isFinite(amount) || amount <= 0) {
      return 'Estimated maturity amount must be greater than zero when provided.';
    }
  }
  return undefined;
}

function buildOwnerTypeOptionMap(
  accountTypeOptions: KeyValue[],
  ownerTypeOptions: FieldOption[],
): Record<string, FieldOption[]> {
  const map: Record<string, FieldOption[]> = {};
  for (const accountType of accountTypeOptions) {
    const allowed = (accountType.description ?? '')
      .split(',')
      .map(part => part.trim())
      .filter(Boolean);
    map[accountType.key] = allowed.length
      ? ownerTypeOptions.filter(option => allowed.includes(option.key))
      : ownerTypeOptions;
  }
  return map;
}

export function validateAccountCreateValues(values: FormValues): string | undefined {
  const accountType = String(values['accountType'] ?? '');
  const ownerType = String(values['ownerType'] ?? '');

  if (accountType === 'WALLET' && ownerType === 'ORG') {
    return 'Organization is not allowed for wallet accounts.';
  }

  if (accountType === 'INVESTMENT' && !isNonEmpty(values['description'])) {
    return 'Description is required for investment accounts.';
  }

  if (ownerType === 'INDIVIDUAL' && !isNonEmpty(values['accountHolder'])) {
    return 'Account holder is required for individual accounts.';
  }

  const detailsStep: AccountCreateStep =
    accountType === 'INVESTMENT' ? 'investment' : 'bank';
  return validateAccountCreateDetailValues(detailsStep, values)
    ?? (accountType === 'INVESTMENT'
      ? validateAccountCreateMaturityValues(values)
      : undefined);
}

export function defaultAccountCreateFormValues(
  presets: Record<string, unknown> = {},
): FormValues {
  const accountType = String(presets['accountType'] ?? '');
  const ownerType = String(presets['ownerType'] ?? '')
    || (accountType === 'WALLET' ? 'INDIVIDUAL' : '');
  const accountHolder = String(presets['accountHolder'] ?? '');
  return {
    accountType,
    ownerType,
    accountHolder,
    custodianUserIds: [],
    description: '',
    bankAccountNumber: '',
    bankAccountHolderName: '',
    bankName: '',
    bankAccountType: '',
    bankBranch: '',
    IFSCNumber: '',
    maturityDate: '',
    maturityAmount: null,
    investmentAmount: null,
    sourceAccountId: '',
    interestRate: null,
    interestPayingTerm: '',
  };
}

export function defaultAccountCreateUpiRows(): UpiDetail[] {
  return [{ isPrimary: true }];
}

function mapCreateUpiRows(upiRows: readonly UpiDetail[] | undefined): UpiDetail[] | undefined {
  if (!upiRows?.length) {
    return undefined;
  }
  const mapped = upiRows
    .filter(row => row.upiId?.trim() || row.payeeName?.trim() || row.mobileNumber?.trim())
    .map((row, index) => ({
      id: row.id || `upi-${index + 1}`,
      upiId: row.upiId?.trim(),
      payeeName: row.payeeName?.trim(),
      mobileNumber: row.mobileNumber?.trim(),
      label: row.label?.trim(),
      isPrimary: row.isPrimary === true,
    }));
  return mapped.length ? mapped : undefined;
}

export function accountCreateFormValuesToPayload(
  values: FormValues,
  options: {
    ifscDetails?: IfscDetails;
    upiRows?: readonly UpiDetail[];
  } = {},
): AccountCreatePayload {
  const accountType = String(values['accountType'] ?? '') as AccountCreatePayload['accountType'];
  const ownerType = String(values['ownerType'] ?? '') as AccountCreatePayload['ownerType'];

  const payload: AccountCreatePayload = {
    accountType,
    ownerType,
    accountHolder: ownerType === 'INDIVIDUAL' ? String(values['accountHolder'] ?? '') : undefined,
    custodianUserIds: ownerType === 'ORG'
      ? toStringArray(values['custodianUserIds'])
      : undefined,
    description: String(values['description'] ?? '') || undefined,
  };

  const includeBank =
    requiresBankOnCreate(accountType)
    || (accountType === 'WALLET' && hasBankFormValues(values));

  if (includeBank) {
    const ifscDetails = options.ifscDetails;
    payload.bankDetail = {
      accountNumber: String(values['bankAccountNumber'] ?? ''),
      accountHolderName: String(values['bankAccountHolderName'] ?? '') || undefined,
      bankName: ifscDetails?.bankName ?? String(values['bankName'] ?? ''),
      accountType: String(values['bankAccountType'] ?? ''),
      branch: (ifscDetails?.branch ?? String(values['bankBranch'] ?? '')) || undefined,
      ifscNumber: (ifscDetails?.ifsc ?? String(values['IFSCNumber'] ?? '')) || undefined,
      maturityDate: accountType === 'INVESTMENT'
        ? String(values['maturityDate'] ?? '') || undefined
        : undefined,
      maturityAmount: accountType === 'INVESTMENT' && values['maturityAmount'] != null && values['maturityAmount'] !== ''
        ? Number(values['maturityAmount'])
        : undefined,
      investmentAmount: accountType === 'INVESTMENT'
        ? Number(values['investmentAmount'])
        : undefined,
      sourceAccountId: accountType === 'INVESTMENT'
        ? String(values['sourceAccountId'] ?? '') || undefined
        : undefined,
      interestRate: accountType === 'INVESTMENT' && values['interestRate'] != null && values['interestRate'] !== ''
        ? Number(values['interestRate'])
        : undefined,
      interestPayingTerm: accountType === 'INVESTMENT'
        ? String(values['interestPayingTerm'] ?? '') || undefined
        : undefined,
    };
  }

  if (allowsUpiOnEdit(accountType)) {
    payload.upiDetails = mapCreateUpiRows(options.upiRows);
  }

  return payload;
}

export function saveAccountCreate(
  values: FormValues,
  accountData: AccountDataSource,
  modalService: ModalService,
  upiRows?: readonly UpiDetail[],
): Observable<Account> {
  const accountType = String(values['accountType'] ?? '');
  const toPayload = (ifscDetails?: IfscDetails) =>
    accountCreateFormValuesToPayload(values, { ifscDetails, upiRows });

  if (needsIfscLookupOnSubmit(accountType, values)) {
    const ifsc = normalizeIfsc(values['IFSCNumber']);
    if (!isValidIfscFormat(ifsc)) {
      return throwError(() => new Error('Invalid IFSC format.'));
    }

    return accountData.lookupIfsc(ifsc).pipe(
      switchMap(details => {
        if (!isIfscLookupResultValid(details)) {
          return throwError(() => new Error(IFSC_NOT_FOUND_MESSAGE));
        }
        return confirmIfscDetails(modalService, details, { acceptButtonText: 'Create' }).pipe(
          map(confirmed => ({ confirmed, details })),
        );
      }),
      filter(({ confirmed }) => confirmed),
      switchMap(({ details }) =>
        accountData.createAccount(toPayload(details)),
      ),
      catchError(error => {
        modalService.openNotificationModal({
          title: 'Invalid IFSC code',
          description: resolveIfscSubmitError(error) ?? IFSC_NOT_FOUND_MESSAGE,
        }, 'notification', 'error');
        return EMPTY;
      }),
    );
  }

  return accountData.createAccount(toPayload());
}

export function buildAccountFilterForm(
  chipId: AccountPrimaryChip,
  refData: Record<string, KeyValue[]>,
  memberOptions: FieldOption[] = [],
): FormDefinition {
  const fields: FormFieldDefinition[] = [
    baseField({
      id: 'accountId',
      key: 'accountId',
      label: 'Account Number',
      placeholder: 'Enter account number',
      fieldType: 'text',
      sortOrder: 1,
    }),
    baseField({
      id: 'type',
      key: 'type',
      label: 'Account Type',
      fieldType: 'multiselect',
      sortOrder: 2,
      fieldOptions: toFieldOptions(refData[AccountConstant.refDataKey.accountType]),
    }),
    baseField({
      id: 'status',
      key: 'status',
      label: 'Account Status',
      fieldType: 'multiselect',
      sortOrder: 3,
      fieldOptions: toFieldOptions(refData[AccountConstant.refDataKey.accountStatus]),
    }),
  ];

  if (isOrgScopeChip(chipId)) {
    fields.push(
      baseField({
        id: 'ownerType',
        key: 'ownerType',
        label: 'Owner Type',
        fieldType: 'multiselect',
        sortOrder: 4,
        fieldOptions: toFieldOptions(refData[AccountConstant.refDataKey.ownerType]),
      }),
      baseField({
        id: 'accountHolderId',
        key: 'accountHolderId',
        label: 'Account Owner',
        fieldType: 'autocomplete',
        sortOrder: 5,
        fieldOptions: memberOptions,
      }),
    );
  }

  return {
    id: 'account-filter',
    key: 'account-filter',
    label: 'Account Filters',
    description: '',
    fields,
  };
}

export function accountCriteriaToValues(criteria: AccountListCriteria): FormValues {
  return {
    accountId: criteria.accountId ?? '',
    type: (criteria.type ?? []) as string[],
    ownerType: (criteria.ownerType ?? []) as string[],
    status: (criteria.status ?? []) as string[],
    accountHolderId: criteria.accountHolderId ?? '',
  };
}

export function accountValuesToCriteria(
  values: FormValues,
  criteria: AccountListCriteria,
  memberOptions: FieldOption[] = [],
): AccountListCriteria {
  const accountId = values['accountId'];
  const type = values['type'];
  const ownerType = values['ownerType'];
  const status = values['status'];
  const accountHolderId = values['accountHolderId'];

  const holderKey = typeof accountHolderId === 'string' ? accountHolderId.trim() : '';
  const holderOption = memberOptions.find(o => o.key === holderKey);

  return {
    ...criteria,
    accountId: typeof accountId === 'string' && accountId.trim() ? accountId.trim() : undefined,
    type: Array.isArray(type) && type.length ? type as AccountListCriteria['type'] : undefined,
    ownerType: Array.isArray(ownerType) && ownerType.length
      ? ownerType.filter((value): value is string => !!value) as AccountListCriteria['ownerType']
      : undefined,
    status: Array.isArray(status) && status.length
      ? status as AccountListCriteria['status']
      : undefined,
    accountHolderId: holderKey || undefined,
    accountHolderName: holderOption?.label,
  };
}

export function buildAccountUpdateForm(refData: Record<string, KeyValue[]>): FormDefinition {
  return {
    id: 'account-update',
    key: 'account-update',
    label: 'Update account',
    description: '',
    fields: [
      baseField({
        id: 'status',
        key: 'status',
        label: 'Account Status',
        fieldType: 'select',
        sortOrder: 1,
        mandatory: true,
        fieldOptions: toFieldOptions(refData[AccountConstant.refDataKey.accountStatus]),
      }),
    ],
  };
}

export function accountToUpdateValues(account: Account): FormValues {
  return {
    status: account.status,
  };
}

export type AccountTransferReferenceType = AccountTransferReference;

const FALLBACK_TRANSFER_REFERENCE_OPTIONS: FieldOption[] = [
  { key: 'ADHOC', label: 'General' },
  { key: 'ADVANCE_EV', label: 'Advance for Event' },
];

const TRANSFER_REFERENCE_SELECTED_CONDITION = {
  dependsOnKey: 'transferReferenceType',
  operator: 'in' as const,
  value: ['ADHOC', 'ADVANCE_EV'],
};

export function isAccountTransferReferenceType(
  value: unknown,
): value is AccountTransferReferenceType {
  return value === 'ADHOC' || value === 'ADVANCE_EV';
}

export function transferReferenceOptionsForAccount(
  fromAccount: Pick<Account, 'accountType'>,
  refData?: AccountRefData | Record<string, unknown>,
): FieldOption[] {
  const labels = toFieldOptions(
    refKeyValues(refData as AccountRefData | undefined, AccountConstant.refDataKey.transferReferenceType),
  );
  const matrix = refData?.[AccountConstant.refDataKey.transferMatrix];
  const rows = Array.isArray(matrix) ? matrix as TransferMatrixRow[] : [];
  const allowedRefs = [...new Set(
    rows
      .filter(row => row.fromAccountType === fromAccount.accountType)
      .map(row => row.reference),
  )];

  if (!allowedRefs.length) {
    return [];
  }

  const labeled = (labels.length ? labels : FALLBACK_TRANSFER_REFERENCE_OPTIONS)
    .filter(option => allowedRefs.includes(option.key));
  return labeled.length
    ? labeled
    : allowedRefs.map(key => ({ key, label: key }));
}

export function mapPayableAccountsToTransferOptions(
  accounts: readonly Account[],
  fromAccountId: string,
): FieldOption[] {
  return accounts
    .filter(account =>
      account.id !== fromAccountId
      && account.accountType !== 'INVESTMENT',
    )
    .map(account => ({
      key: account.id,
      label: `${account.id} · ${account.accountTypeLabel ?? account.accountType}`,
    }));
}

export function fetchTransferPayableAccountOptions(
  accountData: AccountDataSource,
  transferReference: AccountTransferReferenceType,
  fromAccountId: string,
): Observable<FieldOption[]> {
  return accountData.fetchPayableAccounts({
    reference: transferReference,
    fromAccountId,
  }).pipe(
    map(accounts => mapPayableAccountsToTransferOptions(accounts, fromAccountId)),
  );
}

export function buildAccountTransferFormDefinition(
  accountOptions: FieldOption[] = [],
  referenceOptions: FieldOption[] = FALLBACK_TRANSFER_REFERENCE_OPTIONS,
): FormDefinition {
  const allowedReferenceKeys = referenceOptions.map(option => option.key);
  const fields: FormFieldDefinition[] = [
    baseField({
      id: 'transferReferenceType',
      key: 'transferReferenceType',
      label: 'Transfer Reference',
      fieldType: 'select',
      sortOrder: 1,
      mandatory: true,
      fieldOptions: referenceOptions,
    }),
    baseField({
      id: 'transferTo',
      key: 'transferTo',
      label: 'Transfer To Account',
      fieldType: 'select',
      sortOrder: 2,
      mandatory: true,
      fieldOptions: accountOptions,
      condition: {
        dependsOnKey: 'transferReferenceType',
        operator: 'in',
        value: allowedReferenceKeys.length ? allowedReferenceKeys : ['ADHOC', 'ADVANCE_EV'],
      },
    }),
    baseField({
      id: 'amount',
      key: 'amount',
      label: 'Transfer Amount',
      fieldType: 'number',
      sortOrder: 3,
      mandatory: true,
      condition: {
        dependsOnKey: 'transferReferenceType',
        operator: 'in',
        value: allowedReferenceKeys.length ? allowedReferenceKeys : ['ADHOC', 'ADVANCE_EV'],
      },
    }),
    baseField({
      id: 'transferDate',
      key: 'transferDate',
      label: 'Transfer Date',
      fieldType: 'date',
      sortOrder: 4,
      mandatory: true,
    }),
    baseField({
      id: 'description',
      key: 'description',
      label: 'Transfer Description',
      fieldType: 'textarea',
      sortOrder: 5,
      mandatory: true,
    }),
  ];

  return {
    id: 'account-transfer',
    key: 'account-transfer',
    label: 'Record amount transfer',
    description: 'This action only records the already transferred amount.',
    fields,
  };
}

export function defaultAccountTransferFormValues(): FormValues {
  const today = new Date().toISOString().split('T')[0];
  return {
    transferTo: '',
    amount: null,
    transferDate: today,
    description: '',
    transferReferenceType: '',
  };
}

export function transferFormValuesToPayload(values: FormValues): AccountTransferPayload {
  const reference = values['transferReferenceType'];
  if (!isAccountTransferReferenceType(reference)) {
    throw new Error('Transfer reference is required');
  }
  return {
    transferTo: String(values['transferTo'] ?? ''),
    amount: Number(values['amount'] ?? 0),
    description: String(values['description'] ?? '').trim(),
    transferDate: String(values['transferDate'] ?? ''),
    reference,
  };
}

export interface AccountTransferFormState {
  accountOptions: FieldOption[];
  referenceOptions: FieldOption[];
  initialValues: FormValues;
  formDefinition: FormDefinition;
}

export function prepareAccountTransferState(
  fromAccount: Account,
  refData?: AccountRefData,
): Observable<AccountTransferFormState> {
  const referenceOptions = transferReferenceOptionsForAccount(fromAccount, refData);
  const initialValues = defaultAccountTransferFormValues();
  return of({
    accountOptions: [] as FieldOption[],
    referenceOptions,
    initialValues,
    formDefinition: buildAccountTransferFormDefinition([], referenceOptions),
  });
}

export function saveAccountTransfer(deps: {
  accountData: AccountDataSource;
  fromAccount: Account;
  values: FormValues;
  documents: readonly FileUpload[];
  isAdminTransfer: boolean;
}): Observable<string> {
  return deps.accountData.performTransfer(
    deps.fromAccount,
    transferFormValuesToPayload(deps.values),
    [...deps.documents],
    deps.isAdminTransfer,
  );
}

export const ACCOUNT_TRANSFER_DOCUMENT_TYPES = ['jpg', 'jpeg', 'png', 'pdf'];
export const ACCOUNT_TRANSFER_DOCUMENT_HINT = 'Upload at least one transfer proof document.';

export type AccountBankingStep = 'details' | 'upi';

export const ACCOUNT_BANKING_STEPPER_STEPS: CfFormStepperStep<AccountBankingStep>[] = [
  { id: 'details', label: 'Account details', kind: 'form' },
  { id: 'upi', label: 'UPI IDs', kind: 'custom' },
];

export function resolveAccountBankingSteps(account: Pick<Account, 'accountType'>): AccountBankingStep[] {
  if (allowsUpiOnEdit(account.accountType)) {
    return ['details', 'upi'];
  }
  return ['details'];
}

export function buildAccountBankingStepDefinition(
  step: AccountBankingStep,
  account: Account,
  sourceBankOptions: FieldOption[] = [],
  refData: AccountRefData | Record<string, KeyValue[]> = {},
): FormDefinition {
  if (step === 'upi') {
    return {
      id: 'account-banking-upi',
      key: 'account-banking-upi',
      label: 'UPI IDs',
      description: '',
      fields: [],
    };
  }
  return buildAccountBankingFormDefinition(account, sourceBankOptions, refData);
}

export function validateAccountBankingStep(
  step: AccountBankingStep,
  account: Account,
  values: FormValues,
): string | undefined {
  if (step !== 'details') {
    return undefined;
  }
  return validateBankingFormValues(account, values);
}

export function validateBankingFormValues(
  account: Pick<Account, 'accountType'>,
  values: FormValues,
): string | undefined {
  const type = account.accountType;
  if (type === 'BANK' || type === 'INVESTMENT' || type === 'WALLET') {
    return validateAccountBankValues(type, values, {
      requireDescription: type === 'INVESTMENT',
      walletAllOrNothing: true,
    });
  }
  return undefined;
}

export function buildAccountBankingFormDefinition(
  account: Account,
  sourceBankOptions: FieldOption[] = [],
  refData: AccountRefData | Record<string, KeyValue[]> = {},
): FormDefinition {
  const fields: FormFieldDefinition[] = [];
  const type = account.accountType;
  const fundingOptions = resolveSourceBankOptionsForEdit(account, sourceBankOptions);

  if (type === 'BANK' || type === 'INVESTMENT' || type === 'WALLET') {
    fields.push(...buildBankingDetailFields(
      type,
      1,
      fundingOptions,
      bankFieldOptionsFromRefData(refData),
    ));
  }

  if (type === 'INVESTMENT') {
    fields.unshift(
      baseField({
        id: 'description',
        key: 'description',
        label: 'Description',
        fieldType: 'textarea',
        sortOrder: 0,
        mandatory: true,
      }),
    );
  }

  return {
    id: 'account-banking',
    key: 'account-banking',
    label: type === 'INVESTMENT' ? 'Update investment details' : 'Update account details',
    description: '',
    fields,
  };
}

export function accountToBankingFormValues(account: Account): FormValues {
  return {
    /** Carried for stepper `resolveSteps` (not shown on the form). */
    accountType: account.accountType,
    description: account.description ?? '',
    bankAccountNumber: account.bankDetail?.accountNumber ?? '',
    bankAccountHolderName: resolveBankAccountHolderNameForEdit(account),
    bankName: account.bankDetail?.bankName ?? '',
    bankAccountType: account.bankDetail?.accountType ?? '',
    bankBranch: account.bankDetail?.branch ?? '',
    IFSCNumber: account.bankDetail?.ifscNumber ?? '',
    maturityDate: account.bankDetail?.maturityDate ?? '',
    maturityAmount: account.bankDetail?.maturityAmount ?? null,
    investmentAmount: account.bankDetail?.investmentAmount ?? null,
    sourceAccountId: account.bankDetail?.sourceAccountId ?? '',
    dematId: account.bankDetail?.dematId ?? '',
    interestRate: account.bankDetail?.interestRate ?? null,
    interestPayingTerm: account.bankDetail?.interestPayingTerm ?? '',
  };
}

/**
 * Seed bank holder for edit forms.
 * For wallets without bank details, leave blank — falling back to
 * `account.accountHolderName` would trip wallet all-or-nothing validation
 * even when the user has not started entering bank fields.
 */
function resolveBankAccountHolderNameForEdit(account: Account): string {
  if (account.bankDetail) {
    return account.bankDetail.accountHolderName ?? account.accountHolderName ?? '';
  }
  if (account.accountType === 'WALLET') {
    return '';
  }
  return account.accountHolderName ?? '';
}

/** Ensure the linked source bank remains selectable/labelable on edit even if funding options are empty. */
function resolveSourceBankOptionsForEdit(
  account: Account,
  sourceBankOptions: FieldOption[],
): FieldOption[] {
  const sourceId = account.bankDetail?.sourceAccountId?.trim();
  if (!sourceId) {
    return sourceBankOptions;
  }
  if (sourceBankOptions.some(option => option.key === sourceId)) {
    return sourceBankOptions;
  }
  return [{ key: sourceId, label: sourceId }, ...sourceBankOptions];
}

/** Resolves banking stepper steps from form values (uses seeded `accountType`). */
export function resolveAccountBankingStepsFromValues(values: FormValues): AccountBankingStep[] {
  const accountType = values['accountType'];
  if (accountType === 'WALLET' || accountType === 'BANK' || accountType === 'INVESTMENT') {
    return resolveAccountBankingSteps({ accountType });
  }
  return ['details'];
}

export function accountToUpiEditorRows(account: Account): UpiDetail[] {
  return account.upiDetails?.length
    ? account.upiDetails.map(row => ({ ...row }))
    : account.upiDetail
      ? [{ ...account.upiDetail, isPrimary: true }]
      : [{ isPrimary: true }];
}

export function bankingFormValuesToDomain(
  account: Account,
  values: FormValues,
  upiRows: UpiDetail[],
  ifscDetails?: IfscDetails,
): AccountDetailsUpdatePayload {
  const payload: AccountDetailsUpdatePayload = {};
  if (account.accountType === 'INVESTMENT') {
    payload.description = String(values['description'] ?? '').trim();
  }

  const includeBank =
    requiresBankOnEdit(account.accountType)
    || (account.accountType === 'WALLET' && hasBankFormValues(values));

  if (includeBank) {
    payload.bankDetail = {
      accountNumber: String(values['bankAccountNumber'] ?? ''),
      accountHolderName: String(values['bankAccountHolderName'] ?? ''),
      bankName: ifscDetails?.bankName ?? String(values['bankName'] ?? ''),
      accountType: String(values['bankAccountType'] ?? ''),
      branch: ifscDetails?.branch ?? String(values['bankBranch'] ?? ''),
      ifscNumber: (ifscDetails?.ifsc ?? String(values['IFSCNumber'] ?? '')) || undefined,
      maturityDate: String(values['maturityDate'] ?? '') || undefined,
      maturityAmount: values['maturityAmount'] != null && values['maturityAmount'] !== ''
        ? Number(values['maturityAmount'])
        : undefined,
      investmentAmount: account.bankDetail?.investmentAmount,
      sourceAccountId: account.bankDetail?.sourceAccountId,
      dematId: String(values['dematId'] ?? '') || undefined,
      interestRate: values['interestRate'] != null ? Number(values['interestRate']) : undefined,
      interestPayingTerm: String(values['interestPayingTerm'] ?? '') || undefined,
    } satisfies BankDetail;
  }

  if (allowsUpiOnEdit(account.accountType)) {
    payload.upiDetails = upiRows
      .filter(row => row.upiId?.trim() || row.payeeName?.trim() || row.mobileNumber?.trim())
      .map((row, index) => ({
        id: row.id || `upi-${index + 1}`,
        upiId: row.upiId?.trim(),
        payeeName: row.payeeName?.trim(),
        mobileNumber: row.mobileNumber?.trim(),
        label: row.label?.trim(),
        isPrimary: row.isPrimary === true,
      }));
  }

  return payload;
}

export interface AccountBankingFormState {
  initialValues: FormValues;
  upiRows: UpiDetail[];
  formDefinition: FormDefinition;
}

export function prepareAccountBankingState(account: Account): AccountBankingFormState {
  const initialValues = accountToBankingFormValues(account);
  return {
    initialValues,
    upiRows: accountToUpiEditorRows(account),
    formDefinition: buildAccountBankingFormDefinition(account),
  };
}

export function saveAccountBanking(deps: {
  account: Account;
  values: FormValues;
  upiRows: UpiDetail[];
  accountData: AccountDataSource;
  modal: ModalService;
  isSelf: boolean;
}): Observable<Account> {
  const validationError = validateBankingFormValues(deps.account, deps.values);
  if (validationError) {
    return throwError(() => new Error(validationError));
  }

  if (needsIfscLookupOnSubmit(deps.account.accountType, deps.values)) {
    const ifsc = normalizeIfsc(deps.values['IFSCNumber']);
    if (!isValidIfscFormat(ifsc)) {
      return throwError(() => new Error('Invalid IFSC format.'));
    }

    return deps.accountData.lookupIfsc(ifsc).pipe(
      switchMap(details => {
        if (!isIfscLookupResultValid(details)) {
          return throwError(() => new Error(IFSC_NOT_FOUND_MESSAGE));
        }
        return confirmIfscDetails(deps.modal, details, { acceptButtonText: 'Save' }).pipe(
          map(confirmed => ({ confirmed, details })),
        );
      }),
      filter(({ confirmed }) => confirmed),
      switchMap(({ details }) =>
        deps.accountData.updateAccountDetails(
          deps.account.id,
          bankingFormValuesToDomain(deps.account, deps.values, deps.upiRows, details),
          { isSelf: deps.isSelf },
        ),
      ),
      catchError(error => {
        deps.modal.openNotificationModal({
          title: 'Invalid IFSC code',
          description: resolveIfscSubmitError(error) ?? IFSC_NOT_FOUND_MESSAGE,
        }, 'notification', 'error');
        return EMPTY;
      }),
    );
  }

  return deps.accountData.updateAccountDetails(
    deps.account.id,
    bankingFormValuesToDomain(deps.account, deps.values, deps.upiRows),
    { isSelf: deps.isSelf },
  );
}

