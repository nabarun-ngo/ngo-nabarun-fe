import type { FieldCondition, FieldOption, FormFieldDefinition } from '@nabarun-ngo/forms-core';
import { baseField } from '@nabarun-ngo/forms-core';
import { IFSC_VALIDATION_RULE } from './account.ifsc';
import { requiresBankOnEdit } from './account-bank-validation';

export interface BankFieldsOptions {
  startOrder: number;
  mandatory: boolean;
  idPrefix?: string;
  condition?: FieldCondition | null;
  bankAccountTypeOptions?: FieldOption[];
  investmentTypeOptions?: FieldOption[];
  interestPayingTermOptions?: FieldOption[];
}

function fieldId(prefix: string | undefined, key: string): string {
  return prefix ? `${prefix}_${key}` : key;
}

/** Bank account fields including IFSC (create + banking update). */
export function buildBankFieldsWithIfsc(options: BankFieldsOptions): FormFieldDefinition[] {
  const { startOrder, mandatory, idPrefix, condition, bankAccountTypeOptions = [] } = options;
  return [
    baseField({
      id: fieldId(idPrefix, 'IFSCNumber'),
      key: 'IFSCNumber',
      label: 'Bank IFSC Number',
      fieldType: 'text',
      sortOrder: startOrder,
      mandatory,
      validationRules: IFSC_VALIDATION_RULE,
      condition: condition ?? null,
    }),
    baseField({
      id: fieldId(idPrefix, 'bankAccountNumber'),
      key: 'bankAccountNumber',
      label: 'Bank Account Number',
      fieldType: 'text',
      sortOrder: startOrder + 1,
      mandatory,
      condition: condition ?? null,
    }),
    baseField({
      id: fieldId(idPrefix, 'bankAccountHolderName'),
      key: 'bankAccountHolderName',
      label: 'Bank Account Holder Name',
      fieldType: 'text',
      sortOrder: startOrder + 2,
      mandatory,
      condition: condition ?? null,
    }),
    baseField({
      id: fieldId(idPrefix, 'bankAccountType'),
      key: 'bankAccountType',
      label: 'Bank Account Type',
      fieldType: 'select',
      sortOrder: startOrder + 3,
      mandatory,
      fieldOptions: bankAccountTypeOptions,
      condition: condition ?? null,
    }),
  ];
}

export interface InvestmentFieldsOptions extends BankFieldsOptions {
  /** Include maturity, demat, interest fields (banking update). */
  extended?: boolean;
  /** Include optional interest rate / paying term (create investment step). */
  includeInterest?: boolean;
  /** Create: mandatory investment amount + source bank. */
  includeFunding?: boolean;
  /** Edit: show immutable funding fields as read-only. */
  showFundingReadOnly?: boolean;
  sourceBankOptions?: FieldOption[];
}

function buildOptionalInterestFields(
  startOrder: number,
  idPrefix: string | undefined,
  condition: FieldCondition | null,
  interestPayingTermOptions: FieldOption[],
): FormFieldDefinition[] {
  return [
    baseField({
      id: fieldId(idPrefix, 'interestRate'),
      key: 'interestRate',
      label: 'Interest Rate (%)',
      fieldType: 'number',
      sortOrder: startOrder,
      condition: condition ?? null,
    }),
    baseField({
      id: fieldId(idPrefix, 'interestPayingTerm'),
      key: 'interestPayingTerm',
      label: 'Interest Paying Term',
      fieldType: 'select',
      sortOrder: startOrder + 1,
      fieldOptions: interestPayingTermOptions,
      condition: condition ?? null,
    }),
  ];
}

/** Investment / folio fields (create + banking update). */
export function buildInvestmentFields(options: InvestmentFieldsOptions): FormFieldDefinition[] {
  const {
    startOrder,
    mandatory,
    idPrefix,
    condition,
    extended = false,
    includeInterest = false,
    includeFunding = false,
    showFundingReadOnly = false,
    sourceBankOptions = [],
    investmentTypeOptions = [],
    interestPayingTermOptions = [],
  } = options;
  const fields: FormFieldDefinition[] = [
    baseField({
      id: fieldId(idPrefix, 'bankAccountNumber'),
      key: 'bankAccountNumber',
      label: 'Account / Folio Number',
      fieldType: 'text',
      sortOrder: startOrder,
      mandatory,
      condition: condition ?? null,
    }),
    baseField({
      id: fieldId(idPrefix, 'bankName'),
      key: 'bankName',
      label: 'Provider Name',
      fieldType: 'text',
      sortOrder: startOrder + 2,
      mandatory,
      condition: condition ?? null,
    }),
    baseField({
      id: fieldId(idPrefix, 'bankAccountType'),
      key: 'bankAccountType',
      label: 'Investment Type',
      fieldType: 'select',
      sortOrder: startOrder + 3,
      mandatory,
      fieldOptions: investmentTypeOptions,
      condition: condition ?? null,
    }),
  ];

  if (includeFunding) {
    fields.push(
      baseField({
        id: fieldId(idPrefix, 'investmentAmount'),
        key: 'investmentAmount',
        label: 'Investment Amount',
        fieldType: 'number',
        sortOrder: startOrder + 4,
        mandatory: true,
        condition: condition ?? null,
      }),
      baseField({
        id: fieldId(idPrefix, 'sourceAccountId'),
        key: 'sourceAccountId',
        label: 'Source Bank Account',
        fieldType: 'select',
        sortOrder: startOrder + 5,
        mandatory: true,
        fieldOptions: sourceBankOptions,
        condition: condition ?? null,
      }),
    );
  }

  if (showFundingReadOnly) {
    fields.push(
      baseField({
        id: fieldId(idPrefix, 'investmentAmount'),
        key: 'investmentAmount',
        label: 'Investment Amount',
        fieldType: 'number',
        sortOrder: startOrder + 4,
        readOnly: true,
        condition: condition ?? null,
      }),
      baseField({
        id: fieldId(idPrefix, 'sourceAccountId'),
        key: 'sourceAccountId',
        label: 'Source Bank Account',
        fieldType: 'select',
        sortOrder: startOrder + 5,
        readOnly: true,
        fieldOptions: sourceBankOptions,
        condition: condition ?? null,
      }),
    );
  }

  if (extended) {
    fields.push(
      baseField({
        id: fieldId(idPrefix, 'maturityDate'),
        key: 'maturityDate',
        label: 'Maturity Date',
        fieldType: 'date',
        sortOrder: startOrder + 6,
        condition: condition ?? null,
      }),
      baseField({
        id: fieldId(idPrefix, 'maturityAmount'),
        key: 'maturityAmount',
        label: 'Estimated Maturity Amount',
        fieldType: 'number',
        sortOrder: startOrder + 7,
        condition: condition ?? null,
      }),
      baseField({
        id: fieldId(idPrefix, 'dematId'),
        key: 'dematId',
        label: 'Demat Id',
        fieldType: 'text',
        sortOrder: startOrder + 8,
        condition: condition ?? null,
      }),
      ...buildOptionalInterestFields(
        startOrder + 9,
        idPrefix,
        condition ?? null,
        interestPayingTermOptions,
      ),
    );
  } else if (includeInterest) {
    fields.push(...buildOptionalInterestFields(
      includeFunding ? startOrder + 6 : startOrder + 4,
      idPrefix,
      condition ?? null,
      interestPayingTermOptions,
    ));
  }

  return fields;
}

/** Banking sheet fields by resolved account type. */
export function buildBankingDetailFields(
  accountType: 'BANK' | 'INVESTMENT' | 'WALLET',
  startOrder: number,
  sourceBankOptions: FieldOption[] = [],
  fieldOptions: {
    bankAccountTypeOptions?: FieldOption[];
    investmentTypeOptions?: FieldOption[];
    interestPayingTermOptions?: FieldOption[];
  } = {},
): FormFieldDefinition[] {
  const mandatory = requiresBankOnEdit(accountType);

  if (accountType === 'BANK' || accountType === 'WALLET') {
    return buildBankFieldsWithIfsc({
      startOrder,
      mandatory,
      bankAccountTypeOptions: fieldOptions.bankAccountTypeOptions,
    });
  }

  return buildInvestmentFields({
    startOrder,
    mandatory,
    extended: true,
    showFundingReadOnly: true,
    sourceBankOptions,
    investmentTypeOptions: fieldOptions.investmentTypeOptions,
    interestPayingTermOptions: fieldOptions.interestPayingTermOptions,
  });
}
