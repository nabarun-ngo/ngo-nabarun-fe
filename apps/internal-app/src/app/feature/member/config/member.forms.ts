import type {
  FieldOption,
  FormDefinition,
  FormEngineOptions,
  FormFieldDefinition,
  FormValues,
} from '@nabarun-ngo/forms-core';
import { isPhoneValueEmpty, phoneValueForValidation } from '@nabarun-ngo/forms-core';
import { parsePhoneNumber } from 'libphonenumber-js';
import { CreateUserDto, UpdateUserProfileDto } from 'src/app/core/api/api-client/models';
import { KeyValue } from 'src/app/shared/models/key-value.model';
import { date } from 'src/app/shared/utils/utilities.service';
import type { Address, MemberListCriteria, PhoneNumber, User } from '../domain';
import {
  MEMBER_CONNECTION_KEY_LABELS,
  MEMBER_GRANTABLE_CONNECTION_KEYS,
  MEMBER_PRIMARY_CONNECTION_KEY,
  UserConstant,
} from './member.rules';

export type WhatsappPhoneTarget = '' | 'primary' | 'secondary';

const FALLBACK_PHONE_ENGINE_OPTIONS: FormEngineOptions = {
  defaultPhoneCountryCode: '+91',
  phoneCountryCodes: [{ code: '+91', label: 'India (+91)' }],
};

/** @deprecated Prefer {@link buildMemberPhoneEngineOptions} with route ref data. */
export const MEMBER_PROFILE_PHONE_ENGINE_OPTIONS: FormEngineOptions = FALLBACK_PHONE_ENGINE_OPTIONS;

function extractDialCode(item: KeyValue): string | undefined {
  const candidates = [item.description, item.value, item.displayValue, item.key];
  for (const candidate of candidates) {
    if (!candidate?.trim()) {
      continue;
    }
    const match = candidate.trim().match(/\+(\d+)/);
    if (match) {
      return `+${match[1]}`;
    }
    if (/^\d+$/.test(candidate.trim())) {
      return `+${candidate.trim()}`;
    }
  }
  return undefined;
}

/** Builds phone dial-code options from USER `phoneCodes` ref data. */
export function buildMemberPhoneEngineOptions(
  refData?: Record<string, KeyValue[]>,
): FormEngineOptions {
  const items = refData?.[UserConstant.refDataKey.phoneCodes] ?? [];
  const phoneCountryCodes = items
    .map(item => {
      const code = extractDialCode(item);
      if (!code) {
        return undefined;
      }
      return {
        code,
        label: item.displayValue ?? item.value ?? code,
      };
    })
    .filter((item): item is { code: string; label: string } => !!item);

  if (!phoneCountryCodes.length) {
    return { ...FALLBACK_PHONE_ENGINE_OPTIONS };
  }

  const preferred =
    phoneCountryCodes.find(item => item.code === '+91') ?? phoneCountryCodes[0];

  return {
    defaultPhoneCountryCode: preferred.code,
    phoneCountryCodes,
  };
}

function toFieldOptions(items: KeyValue[] | undefined): FieldOption[] {
  return (items ?? []).map(item => ({
    key: item.key,
    label: item.displayValue ?? item.label ?? item.value ?? item.key,
  }));
}

function buildGeoOptionMap(
  items: KeyValue[] | undefined,
  parentCodeOf: (item: KeyValue) => string | undefined,
): Record<string, FieldOption[]> {
  const map: Record<string, FieldOption[]> = {};
  for (const item of items ?? []) {
    const parent = parentCodeOf(item);
    if (!parent) {
      continue;
    }
    (map[parent] ??= []).push({
      key: item.key,
      label: item.displayValue ?? item.label ?? item.value ?? item.key,
    });
  }
  return map;
}

function baseField(
  partial: Pick<FormFieldDefinition, 'id' | 'key' | 'label' | 'fieldType' | 'sortOrder'> &
    Partial<FormFieldDefinition>,
): FormFieldDefinition {
  return {
    placeholder: null,
    mandatory: false,
    fieldOptions: [],
    isHidden: false,
    isEncrypted: false,
    enabled: true,
    condition: null,
    dependentOptions: null,
    validationRules: null,
    ...partial,
  };
}

// ---------------------------------------------------------------------------
// Shared label / phone / address formatting helpers
// ---------------------------------------------------------------------------

export function labelForRefKey(
  refData: Record<string, KeyValue[]>,
  key: string | undefined,
  refKey: string,
): string | undefined {
  if (!key) {
    return undefined;
  }
  return refData[refKey]?.find(item => item.key === key)?.displayValue ?? key;
}

export function formatMemberDisplayName(user: User, refData: Record<string, KeyValue[]>): string {
  const titleLabel = user.title
    ? labelForRefKey(refData, user.title, UserConstant.refDataKey.userTitles)
    : undefined;
  const parts = [titleLabel, user.firstName, user.middleName, user.lastName]
    .map(part => part?.trim())
    .filter(Boolean);
  if (parts.length) {
    return parts.join(' ');
  }
  return user.fullName?.trim() || user.email;
}

export function phoneToE164(phone?: PhoneNumber): string {
  if (!phone?.number) {
    return '';
  }
  if (phone.fullNumber?.trim()) {
    try {
      return parsePhoneNumber(phone.fullNumber.trim()).format('E.164');
    } catch {
      // fall through to code + number
    }
  }
  const code = phone.code?.replace(/\D/g, '') ?? '';
  const number = phone.number.replace(/\D/g, '');
  const raw = code ? `+${code}${number}` : number;
  try {
    return parsePhoneNumber(raw).format('E.164');
  } catch {
    return raw;
  }
}

export function formatPhoneDisplay(phone?: PhoneNumber): string | undefined {
  if (!phone?.number) {
    return undefined;
  }
  if (phone.fullNumber?.trim()) {
    return phone.fullNumber.trim();
  }
  const e164 = phoneToE164(phone);
  if (!e164) {
    return phone.number;
  }
  try {
    const parsed = parsePhoneNumber(e164);
    return parsed.formatInternational();
  } catch {
    return e164;
  }
}

function phoneDigits(phone?: PhoneNumber): string {
  return phoneToE164(phone).replace(/\D/g, '');
}

export function resolveWhatsappTarget(user: User): WhatsappPhoneTarget {
  const whatsappLink = user.socialMediaLinks?.find(link => link.linkType === 'whatsapp')?.linkValue;
  if (!whatsappLink) {
    return '';
  }
  const linkDigits = whatsappLink.replace(/\D/g, '');
  const primaryDigits = phoneDigits(user.primaryNumber);
  const secondaryDigits = phoneDigits(user.secondaryNumber);
  if (primaryDigits && linkDigits.endsWith(primaryDigits)) {
    return 'primary';
  }
  if (secondaryDigits && linkDigits.endsWith(secondaryDigits)) {
    return 'secondary';
  }
  return '';
}

export function formatPhoneWithWhatsappLabel(
  phone: PhoneNumber | undefined,
  target: WhatsappPhoneTarget,
  phoneTarget: 'primary' | 'secondary',
): string | undefined {
  const formatted = formatPhoneDisplay(phone);
  if (!formatted) {
    return undefined;
  }
  return target === phoneTarget ? `${formatted} (WhatsApp)` : formatted;
}

// ---------------------------------------------------------------------------
// Filter form (search sheet)
// ---------------------------------------------------------------------------

export function buildMemberFilterFormDefinition(refData: Record<string, KeyValue[]>): FormDefinition {
  return {
    id: 'member-filter',
    key: 'member_mobile_filter',
    label: 'Member Filters',
    description: null,
    fields: [
      baseField({
        id: 'firstName',
        key: 'firstName',
        label: 'First Name',
        placeholder: 'Enter first name',
        fieldType: 'text',
        sortOrder: 1,
      }),
      baseField({
        id: 'lastName',
        key: 'lastName',
        label: 'Last Name',
        placeholder: 'Enter last name',
        fieldType: 'text',
        sortOrder: 2,
      }),
      baseField({
        id: 'email',
        key: 'email',
        label: 'Email',
        placeholder: 'Enter email',
        fieldType: 'text',
        sortOrder: 3,
      }),
      baseField({
        id: 'phoneNumber',
        key: 'phoneNumber',
        label: 'Phone Number',
        placeholder: 'Enter phone number',
        fieldType: 'text',
        sortOrder: 4,
      }),
      baseField({
        id: 'role',
        key: 'role',
        label: 'Role',
        placeholder: 'Select role',
        fieldType: 'multiselect',
        sortOrder: 5,
        fieldOptions: toFieldOptions(refData[UserConstant.refDataKey.availableRoles]),
      }),
    ],
  };
}

export function criteriaToMemberFilterFormValues(criteria: MemberListCriteria): FormValues {
  return {
    firstName: criteria.firstName ?? '',
    lastName: criteria.lastName ?? '',
    email: criteria.email ?? '',
    phoneNumber: criteria.phoneNumber ?? '',
    role: criteria.role ?? [],
  };
}

export function memberFilterFormValuesToCriteria(values: FormValues): MemberListCriteria {
  return {
    firstName: (values['firstName'] as string) || undefined,
    lastName: (values['lastName'] as string) || undefined,
    email: (values['email'] as string) || undefined,
    phoneNumber: (values['phoneNumber'] as string) || undefined,
    role: (values['role'] as string[])?.length ? (values['role'] as string[]) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Admin detail edit (status + roles)
// ---------------------------------------------------------------------------

export interface MemberAdminOnlyFormOptions {
  /** Show the Login methods (IdP connections) field. */
  showLoginMethods?: boolean;
  /** Allow editing the Login methods field (grant/revoke). */
  loginMethodsEnabled?: boolean;
}

function loginMethodFieldOptions(): FieldOption[] {
  return MEMBER_GRANTABLE_CONNECTION_KEYS.map(key => ({
    key,
    label: MEMBER_CONNECTION_KEY_LABELS[key] ?? key,
  }));
}

export function buildMemberAdminOnlyUpdateFormDefinition(
  refData: Record<string, KeyValue[]>,
  options: MemberAdminOnlyFormOptions = {},
): FormDefinition {
  const fields: FormFieldDefinition[] = [
    baseField({
      id: 'status',
      key: 'status',
      label: 'Status',
      fieldType: 'select',
      mandatory: true,
      sortOrder: 1,
      fieldOptions: toFieldOptions(refData[UserConstant.refDataKey.userStatuses]),
    }),
    baseField({
      id: 'roles',
      key: 'roles',
      label: 'Roles',
      fieldType: 'multiselect',
      sortOrder: 2,
      fieldOptions: toFieldOptions(refData[UserConstant.refDataKey.availableRoles]),
    }),
    baseField({
      id: 'roleGroups',
      key: 'roleGroups',
      label: 'Role Groups',
      fieldType: 'multiselect',
      sortOrder: 3,
      fieldOptions: toFieldOptions(refData[UserConstant.refDataKey.availableRoleGroups]),
    }),
    baseField({
      id: 'permissions',
      key: 'permissions',
      label: 'Direct permissions',
      fieldType: 'multiselect',
      sortOrder: 4,
      fieldOptions: toFieldOptions(refData[UserConstant.refDataKey.availablePermissions]),
    }),
  ];

  if (options.showLoginMethods) {
    fields.push(
      baseField({
        id: 'loginMethods',
        key: 'loginMethods',
        label: 'Login methods',
        fieldType: 'multiselect',
        sortOrder: 5,
        enabled: options.loginMethodsEnabled ?? false,
        fieldOptions: loginMethodFieldOptions(),
      }),
    );
  }

  return {
    id: 'member-admin-status-roles',
    key: 'member_admin_status_roles',
    label: 'Update member',
    description: null,
    fields,
  };
}

export function userToAdminOnlyFormValues(user: User): FormValues {
  return {
    status: user.status,
    roles: user.roleCodes ?? user.roles?.map(role => role.roleCode) ?? [],
    roleGroups: user.roleGroupCodes ?? [],
    permissions: user.permissionCodes ?? [],
    loginMethods: user.connectionKeys ?? [],
  };
}

export function buildMemberAdminEditSummary(user: User, refData: Record<string, KeyValue[]>): { label: string; value: string }[] {
  const statusLabel = refData[UserConstant.refDataKey.userStatuses]
    ?.find(item => item.key === user.status)?.displayValue ?? user.status;
  return [
    { label: 'Member', value: formatMemberDisplayName(user, refData) },
    { label: 'Email', value: user.email },
    { label: 'Current status', value: statusLabel },
  ];
}

export interface MemberAdminUpdatePatch {
  status?: User['status'];
  roleCodes: string[];
  roleGroupCodes: string[];
  permissionCodes: string[];
  connectionKeys: string[];
}

export function adminUpdateFormValuesToPatch(values: FormValues, previous: User): MemberAdminUpdatePatch {
  const selectedConnections = (values['loginMethods'] as string[]) ?? previous.connectionKeys ?? [];
  // The primary connection can never be removed, so always keep it selected.
  const connectionKeys = selectedConnections.includes(MEMBER_PRIMARY_CONNECTION_KEY)
    ? selectedConnections
    : [MEMBER_PRIMARY_CONNECTION_KEY, ...selectedConnections];
  return {
    status: (values['status'] as User['status']) || previous.status,
    roleCodes: (values['roles'] as string[]) ?? previous.roleCodes,
    roleGroupCodes: (values['roleGroups'] as string[]) ?? previous.roleGroupCodes ?? [],
    permissionCodes: (values['permissions'] as string[]) ?? previous.permissionCodes ?? [],
    connectionKeys,
  };
}

// ---------------------------------------------------------------------------
// Self profile / complete profile stepped form
// ---------------------------------------------------------------------------

function buildAddressFormFields(
  prefix: 'p' | 's',
  refData: Record<string, KeyValue[]>,
  options: { mandatory?: boolean; sortStart?: number; hideWhenSameAsPresent?: boolean; addressKind: 'Present' | 'Permanent' },
): FormFieldDefinition[] {
  const suffix = `_${prefix}`;
  const sortStart = options.sortStart ?? 1;
  const condition = options.hideWhenSameAsPresent
    ? { dependsOnKey: 'presentParmanentSame', operator: 'equals' as const, value: false }
    : null;
  const stateOptionMap = buildGeoOptionMap(
    refData[UserConstant.refDataKey.states],
    item => item.countryCode,
  );
  const districtOptionMap = buildGeoOptionMap(
    refData[UserConstant.refDataKey.districts],
    item => item.stateCode,
  );

  return [
    baseField({
      id: `addressLine1${suffix}`,
      key: `addressLine1${suffix}`,
      label: `${options.addressKind} — Street / house name`,
      placeholder: 'Street name, house name, building, etc.',
      fieldType: 'text',
      mandatory: options.mandatory,
      sortOrder: sortStart,
      condition,
    }),
    baseField({
      id: `addressLine2${suffix}`,
      key: `addressLine2${suffix}`,
      label: 'Address line 2',
      fieldType: 'text',
      sortOrder: sortStart + 1,
      condition,
    }),
    baseField({
      id: `landmark${suffix}`,
      key: `landmark${suffix}`,
      label: 'Landmark',
      fieldType: 'text',
      sortOrder: sortStart + 2,
      condition,
    }),
    baseField({
      id: `hometown${suffix}`,
      key: `hometown${suffix}`,
      label: 'Hometown',
      fieldType: 'text',
      mandatory: options.mandatory,
      sortOrder: sortStart + 3,
      condition,
    }),
    baseField({
      id: `zipCode${suffix}`,
      key: `zipCode${suffix}`,
      label: 'Pin code',
      fieldType: 'text',
      mandatory: options.mandatory,
      sortOrder: sortStart + 4,
      condition,
    }),
    baseField({
      id: `country${suffix}`,
      key: `country${suffix}`,
      label: 'Country',
      fieldType: 'select',
      mandatory: options.mandatory,
      sortOrder: sortStart + 5,
      fieldOptions: toFieldOptions(refData[UserConstant.refDataKey.countries]),
      condition,
    }),
    baseField({
      id: `state${suffix}`,
      key: `state${suffix}`,
      label: 'State',
      fieldType: 'select',
      mandatory: options.mandatory,
      sortOrder: sortStart + 6,
      fieldOptions: [],
      dependentOptions: {
        dependsOnKey: `country${suffix}`,
        optionMap: stateOptionMap,
      },
      condition,
    }),
    baseField({
      id: `district${suffix}`,
      key: `district${suffix}`,
      label: 'District',
      fieldType: 'select',
      mandatory: options.mandatory,
      sortOrder: sortStart + 7,
      fieldOptions: [],
      dependentOptions: {
        dependsOnKey: `state${suffix}`,
        optionMap: districtOptionMap,
      },
      condition,
    }),
  ];
}

function buildPersonalProfileFields(
  refData: Record<string, KeyValue[]>,
  complete: boolean,
): FormFieldDefinition[] {
  return [
    baseField({
      id: 'title',
      key: 'title',
      label: 'Title',
      fieldType: 'select',
      mandatory: complete,
      sortOrder: 1,
      fieldOptions: toFieldOptions(refData[UserConstant.refDataKey.userTitles]),
    }),
    baseField({
      id: 'firstName',
      key: 'firstName',
      label: 'First name',
      fieldType: 'text',
      mandatory: true,
      sortOrder: 2,
    }),
    baseField({
      id: 'middleName',
      key: 'middleName',
      label: 'Middle name',
      fieldType: 'text',
      sortOrder: 3,
    }),
    baseField({
      id: 'lastName',
      key: 'lastName',
      label: 'Last name',
      fieldType: 'text',
      mandatory: true,
      sortOrder: 4,
    }),
    baseField({
      id: 'gender',
      key: 'gender',
      label: 'Gender',
      fieldType: 'select',
      mandatory: complete,
      sortOrder: 5,
      fieldOptions: toFieldOptions(refData[UserConstant.refDataKey.userGenders]),
    }),
    baseField({
      id: 'dateOfBirth',
      key: 'dateOfBirth',
      label: 'Date of birth',
      fieldType: 'date',
      mandatory: complete,
      sortOrder: 6,
    }),
    baseField({
      id: 'email',
      key: 'email',
      label: 'Email',
      fieldType: 'text',
      enabled: false,
      sortOrder: 7,
    }),
    baseField({
      id: 'phoneNumber_p',
      key: 'phoneNumber_p',
      label: 'WhatsApp number',
      fieldType: 'phone',
      mandatory: complete,
      sortOrder: 8,
    }),
    baseField({
      id: 'phoneNumber_s',
      key: 'phoneNumber_s',
      label: 'Phone number',
      fieldType: 'phone',
      sortOrder: 9,
    }),
  ];
}

function buildPresentAddressProfileFields(
  refData: Record<string, KeyValue[]>,
  complete: boolean,
): FormFieldDefinition[] {
  return [
    ...buildAddressFormFields('p', refData, { sortStart: 1, mandatory: complete, addressKind: 'Present' }),
    baseField({
      id: 'presentParmanentSame',
      key: 'presentParmanentSame',
      label: 'Present and permanent address are the same',
      fieldType: 'toggle',
      sortOrder: 9,
    }),
  ];
}

/**
 * `hideWhenSameAsPresent` only works when the `presentParmanentSame` toggle sits
 * in the same form definition — a field condition whose parent is absent hides
 * the field. Stepped forms therefore leave it off and skip the whole step via
 * {@link resolveMemberProfileEditSteps} instead.
 */
function buildPermanentAddressProfileFields(
  refData: Record<string, KeyValue[]>,
  complete: boolean,
  options: { hideWhenSameAsPresent?: boolean } = {},
): FormFieldDefinition[] {
  return buildAddressFormFields('s', refData, {
    sortStart: 1,
    mandatory: complete,
    hideWhenSameAsPresent: options.hideWhenSameAsPresent,
    addressKind: 'Permanent',
  });
}

export type MemberProfileEditStep = 'personal' | 'present_address' | 'permanent_address';

export const MEMBER_PROFILE_EDIT_STEPS: MemberProfileEditStep[] = [
  'personal',
  'present_address',
  'permanent_address',
];

export function resolveMemberProfileEditSteps(formValues: FormValues): MemberProfileEditStep[] {
  if (formValues['presentParmanentSame']) {
    return ['personal', 'present_address'];
  }
  return MEMBER_PROFILE_EDIT_STEPS;
}

export function memberProfileStepLabel(step: MemberProfileEditStep): string {
  switch (step) {
    case 'personal':
      return 'Personal';
    case 'present_address':
      return 'Present address';
    case 'permanent_address':
      return 'Permanent address';
  }
}

export function buildMemberProfileStepDefinition(
  step: MemberProfileEditStep,
  refData: Record<string, KeyValue[]>,
  options: { completeProfile?: boolean } = {},
): FormDefinition {
  const complete = !!options.completeProfile;
  const label = memberProfileStepLabel(step);
  const fields = (() => {
    switch (step) {
      case 'personal':
        return buildPersonalProfileFields(refData, complete);
      case 'present_address':
        return buildPresentAddressProfileFields(refData, complete);
      case 'permanent_address':
        return buildPermanentAddressProfileFields(refData, complete);
    }
  })();

  return {
    id: `member-profile-${step}`,
    key: `member_profile_${step}`,
    label,
    description: null,
    fields,
  };
}

export function buildMemberProfileStepsPlaceholderDefinition(
  options: { completeProfile?: boolean } = {},
): FormDefinition {
  return {
    id: 'member-profile-steps',
    key: 'member_profile_steps',
    label: options.completeProfile ? 'Complete profile' : 'Update member',
    description: null,
    fields: [],
  };
}

export function buildMemberProfileFormDefinition(
  refData: Record<string, KeyValue[]>,
  options: { completeProfile?: boolean } = {},
): FormDefinition {
  const complete = !!options.completeProfile;
  return {
    id: 'member-profile-update',
    key: 'member_profile_update',
    label: complete ? 'Complete profile' : 'Update member',
    description: null,
    fields: [
      ...buildPersonalProfileFields(refData, complete),
      ...buildPresentAddressProfileFields(refData, complete),
      ...buildPermanentAddressProfileFields(refData, complete, {
        hideWhenSameAsPresent: true,
      }),
    ],
  };
}

export function userToMemberProfileFormValues(user: User): FormValues {
  return {
    title: user.title ?? '',
    firstName: user.firstName ?? '',
    middleName: user.middleName ?? '',
    lastName: user.lastName ?? '',
    gender: user.gender ?? '',
    dateOfBirth: user.dateOfBirth ?? '',
    email: user.email ?? '',
    phoneNumber_p: phoneToE164(user.primaryNumber),
    phoneNumber_s: phoneToE164(user.secondaryNumber),
    presentParmanentSame: user.addressSame ?? false,
    addressLine1_p: user.presentAddress?.addressLine1 ?? '',
    addressLine2_p: user.presentAddress?.addressLine2 ?? '',
    landmark_p: user.presentAddress?.landmark ?? user.presentAddress?.addressLine3 ?? '',
    hometown_p: user.presentAddress?.hometown ?? '',
    zipCode_p: user.presentAddress?.zipCode ?? '',
    district_p: user.presentAddress?.district ?? '',
    state_p: user.presentAddress?.state ?? '',
    country_p: user.presentAddress?.country ?? '',
    addressLine1_s: user.permanentAddress?.addressLine1 ?? '',
    addressLine2_s: user.permanentAddress?.addressLine2 ?? '',
    landmark_s: user.permanentAddress?.landmark ?? user.permanentAddress?.addressLine3 ?? '',
    hometown_s: user.permanentAddress?.hometown ?? '',
    zipCode_s: user.permanentAddress?.zipCode ?? '',
    district_s: user.permanentAddress?.district ?? '',
    state_s: user.permanentAddress?.state ?? '',
    country_s: user.permanentAddress?.country ?? '',
  };
}

function parsePhoneField(value: unknown): { phoneCode: string; phoneNumber: string } | undefined {
  if (!value) {
    return undefined;
  }
  try {
    const parsed = parsePhoneNumber(String(value));
    return {
      phoneCode: `+${parsed.countryCallingCode}`,
      phoneNumber: parsed.nationalNumber,
    };
  } catch {
    return undefined;
  }
}

function readAddress(values: FormValues, prefix: 'p' | 's'): Address {
  const suffix = `_${prefix}`;
  return {
    addressLine1: String(values[`addressLine1${suffix}`] ?? '').trim(),
    addressLine2: String(values[`addressLine2${suffix}`] ?? '').trim() || undefined,
    landmark: String(values[`landmark${suffix}`] ?? '').trim() || undefined,
    hometown: String(values[`hometown${suffix}`] ?? '').trim(),
    zipCode: String(values[`zipCode${suffix}`] ?? '').trim(),
    district: String(values[`district${suffix}`] ?? '').trim(),
    state: String(values[`state${suffix}`] ?? '').trim(),
    country: String(values[`country${suffix}`] ?? '').trim(),
  };
}

function buildWhatsappLink(
  values: FormValues,
  phoneOptions: FormEngineOptions = FALLBACK_PHONE_ENGINE_OPTIONS,
): User['socialMediaLinks'][number] | undefined {
  const source = values['phoneNumber_p'];
  if (isPhoneValueEmpty(source, phoneOptions)) {
    return undefined;
  }
  try {
    const parsed = parsePhoneNumber(
      phoneValueForValidation(source, phoneOptions),
    );
    return {
      linkType: 'whatsapp',
      linkName: 'WhatsApp',
      linkValue: `https://wa.me/${parsed.countryCallingCode}${parsed.nationalNumber}`,
    };
  } catch {
    return undefined;
  }
}

export function memberProfileFormValuesToUpdateDto(
  values: FormValues,
  previous: User,
  refData?: Record<string, KeyValue[]>,
): UpdateUserProfileDto {
  const presentAddress = readAddress(values, 'p');
  const sameAddress = !!values['presentParmanentSame'];
  const permanentAddress = sameAddress ? presentAddress : readAddress(values, 's');
  const phoneOptions = buildMemberPhoneEngineOptions(refData);
  const whatsappLink = buildWhatsappLink(values, phoneOptions);
  const socialMediaLinks = (previous.socialMediaLinks ?? [])
    .filter(link => link.linkType !== 'whatsapp');
  if (whatsappLink) {
    socialMediaLinks.push(whatsappLink);
  }

  return {
    title: String(values['title'] ?? '').trim() || undefined,
    firstName: String(values['firstName'] ?? '').trim(),
    middleName: String(values['middleName'] ?? '').trim() || undefined,
    lastName: String(values['lastName'] ?? '').trim(),
    gender: String(values['gender'] ?? '').trim() || undefined,
    dateOfBirth: String(values['dateOfBirth'] ?? '').trim() || undefined,
    isSameAddress: sameAddress,
    primaryPhone: parsePhoneField(values['phoneNumber_p']),
    secondaryPhone: parsePhoneField(values['phoneNumber_s']),
    presentAddress,
    permanentAddress,
    socialMediaLinks: socialMediaLinks as UpdateUserProfileDto['socialMediaLinks'],
  };
}

export function applyProfileDtoToUser(user: User, dto: UpdateUserProfileDto, refData: Record<string, KeyValue[]>): User {
  const titleLabel = dto.title
    ? labelForRefKey(refData, dto.title, UserConstant.refDataKey.userTitles)
    : undefined;
  const fullName = [titleLabel, dto.firstName, dto.middleName, dto.lastName]
    .map(part => part?.trim())
    .filter(Boolean)
    .join(' ');

  return {
    ...user,
    title: dto.title ?? user.title,
    firstName: dto.firstName ?? user.firstName,
    middleName: dto.middleName ?? user.middleName,
    lastName: dto.lastName ?? user.lastName,
    fullName: fullName || user.fullName,
    gender: dto.gender ?? user.gender,
    dateOfBirth: dto.dateOfBirth ?? user.dateOfBirth,
    addressSame: dto.isSameAddress ?? user.addressSame,
    presentAddress: dto.presentAddress as Address | undefined,
    permanentAddress: dto.permanentAddress as Address | undefined,
    primaryNumber: dto.primaryPhone
      ? {
        code: dto.primaryPhone.phoneCode?.replace('+', '') ?? '',
        number: dto.primaryPhone.phoneNumber ?? '',
        fullNumber: `${dto.primaryPhone.phoneCode ?? ''} ${dto.primaryPhone.phoneNumber ?? ''}`.trim(),
      }
      : user.primaryNumber,
    secondaryNumber: dto.secondaryPhone
      ? {
        code: dto.secondaryPhone.phoneCode?.replace('+', '') ?? '',
        number: dto.secondaryPhone.phoneNumber ?? '',
        fullNumber: `${dto.secondaryPhone.phoneCode ?? ''} ${dto.secondaryPhone.phoneNumber ?? ''}`.trim(),
      }
      : user.secondaryNumber,
    socialMediaLinks: (dto.socialMediaLinks as User['socialMediaLinks']) ?? user.socialMediaLinks,
    picture: dto.picture ?? user.picture,
  };
}

export function buildAddressViewFields(
  address: Address | undefined,
  refData: Record<string, KeyValue[]>,
  prefix: string,
  addressKind: 'Present' | 'Permanent',
): Array<{ label: string; value: string }> {
  if (!address) {
    return [{ label: prefix, value: '—' }];
  }

  return [
    { label: `${addressKind} — Street / house name`, value: address.addressLine1 || '—' },
    { label: 'Address line 2', value: address.addressLine2 || '—' },
    { label: 'Landmark', value: address.landmark || address.addressLine3 || '—' },
    { label: 'Hometown', value: address.hometown || '—' },
    { label: 'Pin code', value: address.zipCode || '—' },
    {
      label: 'District',
      value: labelForRefKey(refData, address.district, UserConstant.refDataKey.districts) ?? address.district ?? '—',
    },
    {
      label: 'State',
      value: labelForRefKey(refData, address.state, UserConstant.refDataKey.states) ?? address.state ?? '—',
    },
    {
      label: 'Country',
      value: labelForRefKey(refData, address.country, UserConstant.refDataKey.countries) ?? address.country ?? '—',
    },
  ];
}

export function formatDateOfBirth(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }
  return value.includes('T') ? date(value) : value;
}

// ---------------------------------------------------------------------------
// Admin create member (POST /api/users field surface)
// ---------------------------------------------------------------------------

export function buildMemberCreateFormDefinition(
  refData: Record<string, KeyValue[]>,
): FormDefinition {
  return {
    id: 'member-create',
    key: 'member_create',
    label: 'Create member',
    description: null,
    fields: [
      baseField({
        id: 'email',
        key: 'email',
        label: 'Email',
        placeholder: 'member@example.org',
        fieldType: 'text',
        mandatory: true,
        sortOrder: 1,
      }),
      baseField({
        id: 'title',
        key: 'title',
        label: 'Title',
        fieldType: 'select',
        sortOrder: 2,
        fieldOptions: toFieldOptions(refData[UserConstant.refDataKey.userTitles]),
      }),
      baseField({
        id: 'firstName',
        key: 'firstName',
        label: 'First name',
        fieldType: 'text',
        mandatory: true,
        sortOrder: 3,
      }),
      baseField({
        id: 'middleName',
        key: 'middleName',
        label: 'Middle name',
        fieldType: 'text',
        sortOrder: 4,
      }),
      baseField({
        id: 'lastName',
        key: 'lastName',
        label: 'Last name',
        fieldType: 'text',
        mandatory: true,
        sortOrder: 5,
      }),
      baseField({
        id: 'gender',
        key: 'gender',
        label: 'Gender',
        fieldType: 'select',
        sortOrder: 6,
        fieldOptions: toFieldOptions(refData[UserConstant.refDataKey.userGenders]),
      }),
      baseField({
        id: 'dateOfBirth',
        key: 'dateOfBirth',
        label: 'Date of birth',
        fieldType: 'date',
        sortOrder: 7,
      }),
      baseField({
        id: 'about',
        key: 'about',
        label: 'About',
        fieldType: 'textarea',
        sortOrder: 8,
      }),
      baseField({
        id: 'picture',
        key: 'picture',
        label: 'Picture URL',
        placeholder: 'https://…',
        fieldType: 'text',
        sortOrder: 9,
      }),
      baseField({
        id: 'isPublic',
        key: 'isPublic',
        label: 'Public profile',
        fieldType: 'toggle',
        sortOrder: 10,
      }),
    ],
  };
}

export function defaultMemberCreateValues(): FormValues {
  return {
    email: '',
    title: '',
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    dateOfBirth: '',
    about: '',
    picture: '',
    isPublic: false,
  };
}

export function buildMemberChangePasswordFormDefinition(): FormDefinition {
  return {
    id: 'member-change-password',
    key: 'member-change-password',
    label: 'Change password',
    description: 'Confirm your current password, then continue on the secure password page.',
    fields: [
      baseField({
        id: 'currentPassword',
        key: 'currentPassword',
        label: 'Current password',
        placeholder: 'Enter your current password',
        fieldType: 'password',
        mandatory: true,
        sortOrder: 1,
      }),
    ],
  };
}

export function memberCreateFormValuesToDto(values: FormValues): CreateUserDto {
  const email = String(values['email'] ?? '').trim();
  const firstName = String(values['firstName'] ?? '').trim();
  const lastName = String(values['lastName'] ?? '').trim();
  const title = String(values['title'] ?? '').trim();
  const middleName = String(values['middleName'] ?? '').trim();
  const gender = String(values['gender'] ?? '').trim();
  const dateOfBirth = String(values['dateOfBirth'] ?? '').trim();
  const about = String(values['about'] ?? '').trim();
  const picture = String(values['picture'] ?? '').trim();

  return {
    email,
    firstName,
    lastName,
    title: title || undefined,
    middleName: middleName || undefined,
    gender: gender || undefined,
    dateOfBirth: dateOfBirth || undefined,
    about: about || undefined,
    picture: picture || undefined,
    isPublic: !!values['isPublic'],
  };
}
