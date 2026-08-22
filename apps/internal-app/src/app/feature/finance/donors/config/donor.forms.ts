import type {
  FieldOption,
  FormDefinition,
  FormEngineOptions,
  FormValues,
} from '@nabarun-ngo/forms-core';
import { baseField, isPhoneValueEmpty, phoneValueForValidation, toFieldOptions } from '@nabarun-ngo/forms-core';
import { KeyValue } from 'src/app/shared/models/key-value.model';
import { DonorRefData } from '../../finance.const';
import type {
  Donor,
  DonorGuestCreateRequest,
  DonorGuestUpdatePatch,
  DonorListCriteria,
  DonorMemberUpdatePatch,
  DonorPrimaryChip,
  DonorStatus,
} from '../domain';

const FALLBACK_DONOR_STATUS_OPTIONS: FieldOption[] = [
  { key: 'ACTIVE', label: 'Active' },
  { key: 'PAUSED', label: 'Paused' },
  { key: 'WAIVED', label: 'Waived' },
  { key: 'DELETED', label: 'Deleted' },
];

const FALLBACK_STATUSES_REQUIRING_END_DATE: DonorStatus[] = ['PAUSED', 'WAIVED'];

const GUEST_DONOR_EMAIL_VALIDATION = {
  pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
  regexErrMsg: 'Enter a valid email address',
} as const;

export const GUEST_DONOR_PHONE_ENGINE_OPTIONS: FormEngineOptions = {
  defaultPhoneCountryCode: '+91',
  phoneCountryCodes: [{ code: '+91', label: 'India (+91)' }],
};

function donorStatusOptions(refData: Record<string, KeyValue[] | string[] | undefined>): FieldOption[] {
  const fromRef = toFieldOptions(refData[DonorRefData.refDataKey.status] as KeyValue[] | undefined);
  return fromRef.length ? fromRef : FALLBACK_DONOR_STATUS_OPTIONS;
}

function statusesRequiringEndDate(
  refData: Record<string, KeyValue[] | string[] | undefined>,
): DonorStatus[] {
  const value = refData[DonorRefData.refDataKey.statusesRequiringEndDate];
  if (Array.isArray(value) && value.length && typeof value[0] === 'string') {
    return value as DonorStatus[];
  }
  return FALLBACK_STATUSES_REQUIRING_END_DATE;
}

export function donorStatusLabel(
  status: DonorStatus,
  refData: Record<string, KeyValue[] | string[] | undefined>,
): string {
  return (refData[DonorRefData.refDataKey.status] as KeyValue[] | undefined)
    ?.find(item => item.key === status)?.displayValue
    ?? status;
}

export function buildDonorFilterForm(
  _chipId: DonorPrimaryChip,
  refData: Record<string, KeyValue[] | string[] | undefined> = {},
): FormDefinition {
  return {
    id: 'donor-filter',
    key: 'donor_filter',
    label: '',
    description: null,
    fields: [
      baseField({
        id: 'status',
        key: 'status',
        label: 'Status',
        placeholder: 'Select status',
        fieldType: 'select',
        sortOrder: 1,
        fieldOptions: donorStatusOptions(refData),
      }),
    ],
  };
}

export function donorCriteriaToValues(criteria: DonorListCriteria): FormValues {
  return { status: criteria.status ?? '' };
}

export function donorValuesToCriteria(
  values: FormValues,
  criteria: DonorListCriteria,
): DonorListCriteria {
  const status = String(values['status'] ?? '').trim();
  return {
    ...criteria,
    status: status ? status as DonorStatus : undefined,
  };
}

function formatPhoneForForm(donor: Donor): string | undefined {
  if (!donor.phoneNumber) return undefined;
  const code = donor.phoneCode ?? '+91';
  return `${code}${donor.phoneNumber}`;
}

function parsePhoneFromForm(value: unknown): { phoneCode?: string; phoneNumber?: string } {
  if (isPhoneValueEmpty(value, GUEST_DONOR_PHONE_ENGINE_OPTIONS)) {
    return {};
  }
  const normalized = phoneValueForValidation(value, GUEST_DONOR_PHONE_ENGINE_OPTIONS) ?? '';
  if (normalized.startsWith('+91')) {
    return { phoneCode: '+91', phoneNumber: normalized.slice(3) };
  }
  return { phoneNumber: normalized.replace(/^\+\d+/, '') };
}

export function buildDonorGuestUpdateForm(): FormDefinition {
  return {
    id: 'donor-guest-update',
    key: 'donor_guest_update',
    label: '',
    description: null,
    fields: [
      baseField({
        id: 'fullName',
        key: 'fullName',
        label: 'Full name',
        placeholder: 'Enter donor name',
        fieldType: 'text',
        sortOrder: 1,
        mandatory: true,
      }),
      baseField({
        id: 'email',
        key: 'email',
        label: 'Email',
        placeholder: 'Enter email (optional)',
        fieldType: 'email',
        sortOrder: 2,
        validationRules: GUEST_DONOR_EMAIL_VALIDATION,
      }),
      baseField({
        id: 'phone',
        key: 'phone',
        label: 'Phone number',
        placeholder: 'Enter mobile number',
        fieldType: 'phone',
        sortOrder: 3,
        validationRules: {
          pattern: '^\\+91[6-9]\\d{9}$',
          regexErrMsg: 'Enter a valid 10-digit Indian mobile number',
        },
      }),
    ],
  };
}

export function buildDonorGuestCreateForm(): FormDefinition {
  return buildDonorGuestUpdateForm();
}

export function defaultDonorGuestCreateValues(): FormValues {
  return { fullName: '', email: '', phone: '' };
}

export function donorToGuestUpdateValues(donor: Donor): FormValues {
  return {
    fullName: donor.fullName ?? '',
    email: donor.email ?? '',
    phone: formatPhoneForForm(donor) ?? '',
  };
}

export function guestUpdateValuesToPatch(values: FormValues): DonorGuestUpdatePatch {
  const fullName = String(values['fullName'] ?? '').trim();
  const email = String(values['email'] ?? '').trim();
  return {
    fullName: fullName || undefined,
    email: email || undefined,
    ...parsePhoneFromForm(values['phone']),
  };
}

export function guestCreateValuesToRequest(values: FormValues): DonorGuestCreateRequest {
  const patch = guestUpdateValuesToPatch(values);
  return {
    fullName: patch.fullName ?? '',
    email: patch.email,
    phoneCode: patch.phoneCode,
    phoneNumber: patch.phoneNumber,
  };
}

export function buildDonorGuestEditSummary(
  donor: Donor,
  refData: Record<string, KeyValue[] | string[] | undefined> = {},
): { label: string; value: string }[] {
  return [
    { label: 'Donor ID', value: donor.id },
    { label: 'Type', value: 'Guest' },
    { label: 'Status', value: donorStatusLabel(donor.status, refData) },
  ];
}

function memberStatusOptions(
  refData: Record<string, KeyValue[] | string[] | undefined>,
): FieldOption[] {
  const fromRef = toFieldOptions(
    refData[DonorRefData.refDataKey.memberEditableStatus] as KeyValue[] | undefined,
  );
  if (fromRef.length) return fromRef;
  return toFieldOptions(refData[DonorRefData.refDataKey.status] as KeyValue[] | undefined);
}

function memberStatusLabel(
  status: DonorStatus,
  refData: Record<string, KeyValue[] | string[] | undefined>,
): string {
  return (refData[DonorRefData.refDataKey.status] as KeyValue[] | undefined)
    ?.find(item => item.key === status)?.displayValue
    ?? status;
}

function toFormDate(value?: string): string {
  if (!value) return '';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value.slice(0, 10);
  return parsed.toISOString().slice(0, 10);
}

function toApiDateTime(value: unknown): string | undefined {
  const raw = String(value ?? '').trim();
  if (!raw) return undefined;
  const parsed = new Date(raw.includes('T') ? raw : `${raw}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

export function buildDonorMemberUpdateForm(
  refData: Record<string, KeyValue[] | string[] | undefined>,
): FormDefinition {
  const endDateStatuses = statusesRequiringEndDate(refData);
  return {
    id: 'donor-member-update',
    key: 'donor_member_update',
    label: '',
    description: null,
    fields: [
      baseField({
        id: 'status',
        key: 'status',
        label: 'Status',
        placeholder: 'Select status',
        fieldType: 'select',
        sortOrder: 1,
        mandatory: true,
        fieldOptions: memberStatusOptions(refData),
      }),
      baseField({
        id: 'preferredAmount',
        key: 'preferredAmount',
        label: 'Preferred amount',
        placeholder: 'Enter monthly amount',
        fieldType: 'number',
        sortOrder: 2,
        mandatory: true,
      }),
      baseField({
        id: 'statusEndDate',
        key: 'statusEndDate',
        label: 'Status end date',
        placeholder: 'Select end date',
        fieldType: 'date',
        sortOrder: 3,
        mandatory: true,
        condition: {
          dependsOnKey: 'status',
          operator: 'in',
          value: endDateStatuses,
        },
      }),
    ],
  };
}

export function donorToMemberUpdateValues(donor: Donor): FormValues {
  return {
    status: donor.status,
    preferredAmount: donor.preferredAmount ?? null,
    statusEndDate: toFormDate(donor.statusEndDate),
  };
}

export function memberUpdateValuesToPatch(
  values: FormValues,
  refData: Record<string, KeyValue[] | string[] | undefined> = {},
): DonorMemberUpdatePatch {
  const status = String(values['status'] ?? '').trim() as DonorStatus;
  const preferredAmount = Number(values['preferredAmount']);
  const patch: DonorMemberUpdatePatch = {
    status: status || undefined,
    preferredAmount: Number.isFinite(preferredAmount) ? preferredAmount : undefined,
  };
  if (statusesRequiringEndDate(refData).includes(status)) {
    patch.statusEndDate = toApiDateTime(values['statusEndDate']);
  }
  return patch;
}

export function buildDonorMemberEditSummary(
  donor: Donor,
  refData: Record<string, KeyValue[] | string[] | undefined>,
): { label: string; value: string }[] {
  return [
    { label: 'Donor ID', value: donor.id },
    { label: 'Type', value: 'Member' },
    { label: 'Name', value: donor.fullName ?? '-' },
    { label: 'Current status', value: memberStatusLabel(donor.status, refData) },
  ];
}

export function validateDonorMemberUpdate(
  values: FormValues,
  refData: Record<string, KeyValue[] | string[] | undefined> = {},
): string | undefined {
  const status = String(values['status'] ?? '').trim() as DonorStatus;
  const preferredAmount = Number(values['preferredAmount']);
  if (!status) return 'Please select a status.';
  if (!Number.isFinite(preferredAmount) || preferredAmount < 1) {
    return 'Preferred amount must be at least 1.';
  }
  if (statusesRequiringEndDate(refData).includes(status)
    && !String(values['statusEndDate'] ?? '').trim()) {
    return 'Status end date is required for the selected status.';
  }
  return undefined;
}

export function isMemberDonor(donor: Donor): boolean {
  return donor.type === 'MEMBER';
}
