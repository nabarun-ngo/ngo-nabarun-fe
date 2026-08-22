import { baseField, isDateRangeValue, toFieldOptions } from '@nabarun-ngo/forms-core';
import type { FieldOption, FormDefinition, FormValues } from '@nabarun-ngo/forms-core';
import type { CfFormStepperStep } from '@nabarun-ngo/forms-angular';
import { firstValueFrom } from 'rxjs';
import type { UploadDocumentRequestDto } from 'src/app/core/api/api-client/models';
import type { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import { DonationRefData as DonationRefDataKeys } from '../../finance.const';
import type { DonationDataSource } from '../data/donation-data.source';
import type {
  Donation,
  DonationCreateOptions,
  DonationFilterCriteria,
  DonationPrimaryChip,
  DonationRefData,
} from '../domain';
import { donationStatuses } from './donation.rules';

export function buildDonationFilterForm(
  chip: DonationPrimaryChip,
  refData: DonationRefData,
  donorOptions: FieldOption[] = [],
): FormDefinition {
  const statusKeys = donationStatuses(chip, {}, refData);
  const statusOptions = toFieldOptions(
    (refData[DonationRefDataKeys.refDataKey.status] as any[] | undefined) ?? [],
  ).filter(option => !statusKeys || statusKeys.includes(option.key));
  const fields = [
    ...(chip === 'mine' ? [] : [baseField({
      id: 'donationMemberId', key: 'memberId', label: 'Donor Name',
      fieldType: 'autocomplete', sortOrder: 1, fieldOptions: donorOptions,
    })]),
    baseField({
      id: 'donationId', key: 'donationId', label: 'Donation Number',
      fieldType: 'text', sortOrder: 2
    }),
    baseField({
      id: 'donationType', key: 'type', label: 'Donation Type',
      fieldType: 'multiselect', sortOrder: 3,
      fieldOptions: toFieldOptions((refData[DonationRefDataKeys.refDataKey.type] as any[]) ?? [])
    }),
    baseField({
      id: 'donationStatus', key: 'status', label: 'Donation Status',
      fieldType: 'multiselect', sortOrder: 4, fieldOptions: statusOptions
    }),
    baseField({
      id: 'donationDateRange', key: 'dateRange', label: 'Date Range',
      fieldType: 'date_range', sortOrder: 5
    }),
    ...(chip === 'mine' ? [] : [baseField({
      id: 'donationGuestDonor', key: 'guestDonor', label: 'Guest Donation',
      fieldType: 'toggle', sortOrder: 6,
    })]),
  ];
  return {
    id: 'donation-filter-form',
    key: 'donation_filter_form',
    label: '',
    description: null,
    fields,
  };
}

export function donationCriteriaToValues(criteria: DonationFilterCriteria): FormValues {
  return {
    memberId: criteria.memberId ?? '',
    donationId: criteria.donationId ?? '',
    type: criteria.type ?? [],
    status: criteria.status ?? [],
    dateRange: { startDate: criteria.startDate, endDate: criteria.endDate },
    guestDonor: !!criteria.guestDonor,
  };
}

export function donationValuesToCriteria(
  chip: DonationPrimaryChip,
  values: FormValues,
  donorOptions: FieldOption[] = [],
): DonationFilterCriteria {
  const range = isDateRangeValue(values['dateRange']) ? values['dateRange'] : {};
  const memberId = chip === 'mine'
    ? undefined : String(values['memberId'] ?? '').trim() || undefined;
  return {
    memberId,
    memberName: donorOptions.find(option => option.key === memberId)?.label,
    guestDonor: chip === 'mine' ? undefined : !!values['guestDonor'],
    donationId: String(values['donationId'] ?? '').trim() || undefined,
    type: Array.isArray(values['type']) && values['type'].length
      ? values['type'] as string[] : undefined,
    status: Array.isArray(values['status']) && values['status'].length
      ? values['status'] as string[] : undefined,
    startDate: range.startDate || undefined,
    endDate: range.endDate || undefined,
  };
}

const REASON_STATUSES = ['CANCELLED', 'PAY_LATER', 'PAYMENT_FAILED', 'UPDATE_MISTAKE'] as const;
const PAYMENT_PROOF_METHODS = ['NETBANKING', 'UPI'] as const;

function statusReasonHint(values: FormValues): string | null {
  switch (values['status']) {
    case 'CANCELLED':
      return 'Reason for cancellation';
    case 'PAY_LATER':
      return 'Remarks for paying later';
    case 'PAYMENT_FAILED':
      return 'Incident details for the failed payment';
    case 'UPDATE_MISTAKE':
      return 'Reason for correcting the paid donation';
    default:
      return null;
  }
}

export function buildDonationUpdateForm(
  donation: Donation,
  refData: DonationRefData,
  accounts: FieldOption[] = [],
): FormDefinition {
  const allowUpdateMistake = donation.status === 'PAID'
    || (donation.nextStatuses ?? []).includes('UPDATE_MISTAKE');

  let statusOptions = toFieldOptions(
    (refData[DonationRefDataKeys.refDataKey.status] as any[] | undefined) ?? [],
  );
  if (donation.nextStatuses?.length) {
    statusOptions = statusOptions.filter(option => donation.nextStatuses!.includes(option.key));
  }
  if (!allowUpdateMistake) {
    statusOptions = statusOptions.filter(option => option.key !== 'UPDATE_MISTAKE');
  }

  const paymentMethodOptions = toFieldOptions(
    (refData[DonationRefDataKeys.refDataKey.paymentMethod] as any[] | undefined) ?? [],
  );
  const upiOptions = toFieldOptions(
    (refData[DonationRefDataKeys.refDataKey.upiOps] as any[] | undefined) ?? [],
  );

  return {
    id: 'donation-update-form',
    key: 'donation_update_form',
    label: '',
    description: null,
    fields: [
      baseField({
        id: 'donationUpdate_amount',
        key: 'amount',
        label: 'Donation amount',
        fieldType: 'number',
        mandatory: true,
        sortOrder: 1,
        condition: { dependsOnKey: 'status', operator: 'not_equals', value: 'PAID' },
      }),
      baseField({
        id: 'donationUpdate_status',
        key: 'status',
        label: 'Donation status',
        fieldType: 'select',
        mandatory: true,
        sortOrder: 2,
        fieldOptions: statusOptions,
      }),
      baseField({
        id: 'donationUpdate_statusReason',
        key: 'statusReason',
        label: 'Reason / Remarks',
        placeholder: 'Enter reason, remarks, or incident details',
        fieldType: 'textarea',
        mandatory: true,
        sortOrder: 3,
        condition: {
          dependsOnKey: 'status',
          operator: 'in',
          value: [...REASON_STATUSES],
        },
        hint: statusReasonHint,
      }),
      baseField({
        id: 'donationUpdate_paidOn',
        key: 'paidOn',
        label: 'Paid on',
        fieldType: 'date',
        mandatory: true,
        sortOrder: 4,
        condition: { dependsOnKey: 'status', operator: 'equals', value: 'PAID' },
        dateConstraints: { max: { kind: 'today' } },
      }),
      baseField({
        id: 'donationUpdate_paidToAccountId',
        key: 'paidToAccountId',
        label: 'Paid to account',
        fieldType: 'select',
        mandatory: true,
        sortOrder: 5,
        fieldOptions: accounts,
        condition: { dependsOnKey: 'status', operator: 'equals', value: 'PAID' },
      }),
      baseField({
        id: 'donationUpdate_paymentMethod',
        key: 'paymentMethod',
        label: 'Payment method',
        fieldType: 'select',
        mandatory: true,
        sortOrder: 6,
        fieldOptions: paymentMethodOptions,
        condition: { dependsOnKey: 'status', operator: 'equals', value: 'PAID' },
      }),
      baseField({
        id: 'donationUpdate_paidUsingUPI',
        key: 'paidUsingUPI',
        label: 'UPI name',
        fieldType: 'select',
        mandatory: true,
        sortOrder: 7,
        fieldOptions: upiOptions,
        condition: { dependsOnKey: 'paymentMethod', operator: 'equals', value: 'UPI' },
      }),
      baseField({
        id: 'donationUpdate_remarks',
        key: 'remarks',
        label: 'Remarks',
        placeholder: 'Optional remarks',
        fieldType: 'textarea',
        mandatory: false,
        sortOrder: 8,
        condition: { dependsOnKey: 'status', operator: 'equals', value: 'PAID' },
      }),
    ],
  };
}

export function donationToUpdateValues(donation: Donation): FormValues {
  return {
    amount: donation.amount,
    status: donation.status,
    paidOn: donation.paidOn ?? null,
    paidToAccountId: donation.paidToAccountId ?? null,
    paymentMethod: donation.paymentMethod ?? null,
    paidUsingUPI: donation.paidUsingUPI ?? null,
    remarks: donation.remarks ?? null,
    statusReason: donation.cancelletionReason ?? donation.laterPaymentReason
      ?? donation.paymentFailureDetail ?? null,
  };
}

export function donationUpdatePatch(values: FormValues): Partial<Donation> {
  const status = values['status'] as Donation['status'] | undefined;
  const reason = String(values['statusReason'] ?? '') || undefined;
  const patch: Partial<Donation> = { status };

  // Amount cannot be updated while marking Paid (or when Paid fields are shown).
  if (status !== 'PAID' && values['amount'] != null && values['amount'] !== '') {
    patch.amount = Number(values['amount']);
  }

  if (status === 'PAID') {
    patch.paidOn = String(values['paidOn'] ?? '') || undefined;
    patch.paidToAccountId = String(values['paidToAccountId'] ?? '') || undefined;
    patch.paymentMethod = values['paymentMethod'] as Donation['paymentMethod'];
    if (values['paymentMethod'] === 'UPI') {
      patch.paidUsingUPI = values['paidUsingUPI'] as Donation['paidUsingUPI'];
    }
    patch.remarks = String(values['remarks'] ?? '') || undefined;
  }

  if (status === 'CANCELLED') patch.cancelletionReason = reason;
  if (status === 'PAY_LATER') patch.laterPaymentReason = reason;
  if (status === 'PAYMENT_FAILED') patch.paymentFailureDetail = reason;
  if (status === 'UPDATE_MISTAKE') {
    patch.remarks = String(values['remarks'] ?? reason ?? '') || undefined;
  }
  return patch;
}

export function donationRequiresPaymentProof(
  status: unknown,
  method: unknown,
  _refData?: DonationRefData,
): boolean {
  return status === 'PAID' && !!method
    && PAYMENT_PROOF_METHODS.includes(String(method) as typeof PAYMENT_PROOF_METHODS[number]);
}

export const DONATION_PAYMENT_DOCUMENT_TYPES = ['jpg', 'jpeg', 'png', 'pdf'];
export const DONATION_PAYMENT_DOCUMENT_HINT =
  'Upload a screenshot or PDF of the donation transfer';

export type DonationCreateStep = 'donation_donor' | 'donation_details';
export const DONATION_CREATE_STEPS: CfFormStepperStep<DonationCreateStep>[] = [
  { id: 'donation_donor', label: 'Select donor', kind: 'form' },
  { id: 'donation_details', label: 'Donation details', kind: 'form' },
];

function findCreateDonor(options: DonationCreateOptions, donorId: string) {
  return options.donors.find(donor => donor.id === donorId);
}

export function buildDonationCreateStep(
  step: DonationCreateStep,
  _refData: DonationRefData,
  options: DonationCreateOptions,
): FormDefinition {
  const fields = step === 'donation_donor'
    ? [baseField({
      id: 'donationCreateDonor', key: 'donorId', label: 'Donor',
      fieldType: 'autocomplete', mandatory: true, sortOrder: 1,
      fieldOptions: options.donorOptions,
    })]
    : [
      baseField({
        id: 'donationCreateGuest', key: 'donorIsGuest', label: 'Guest',
        fieldType: 'text', isHidden: true, sortOrder: 1
      }),
      baseField({
        id: 'donationCreateType', key: 'type', label: 'Donation type',
        fieldType: 'select', mandatory: true, sortOrder: 2,
        dependentOptions: { dependsOnKey: 'donorId', optionMap: options.typeOptionsByDonor },
        hint: values => {
          const donor = findCreateDonor(options, String(values['donorId'] ?? ''));
          if (!donor) return null;
          return donor.type === 'GUEST'
            ? 'Guest donors can only create one-time donations.'
            : '';
        },
      }),
      baseField({
        id: 'donationCreateFor', key: 'donationFor', label: 'Is this donation for an event?',
        fieldType: 'select', mandatory: true, sortOrder: 3,
        fieldOptions: [{ key: 'PROJECT', label: 'Yes' }, { key: 'GENERAL', label: 'No' }],
        condition: { dependsOnKey: 'type', operator: 'equals', value: 'ONETIME' },
      }),
      baseField({
        id: 'donationCreateEvent', key: 'forEventId', label: 'Event',
        fieldType: 'select', mandatory: true, sortOrder: 4,
        fieldOptions: options.eventOptions,
        condition: { dependsOnKey: 'donationFor', operator: 'equals', value: 'PROJECT' }
      }),
      baseField({
        id: 'donationCreateAmount', key: 'amount', label: 'Donation amount',
        fieldType: 'number', mandatory: true, sortOrder: 5,
        hint: values => {
          const donor = findCreateDonor(options, String(values['donorId'] ?? ''));
          if (!donor || donor.type !== 'MEMBER' || donor.preferredAmount == null || values['type'] !== 'REGULAR') {
            return null;
          }
          return `Preferred amount: ₹ ${donor.preferredAmount.toLocaleString('en-IN')} per month`;
        },
      }),
      baseField({
        id: 'donationCreatePeriod', key: 'dateRange', label: 'Donation period',
        fieldType: 'date_range', mandatory: true, sortOrder: 6,
        condition: { dependsOnKey: 'type', operator: 'equals', value: 'REGULAR' }
      }),
    ];
  return {
    id: `donation-create-${step}`,
    key: `donation_create_${step}`,
    label: step === 'donation_donor' ? 'Select donor' : 'Donation details',
    description: null,
    fields,
  };
}

export function validateDonationCreateStep(
  step: DonationCreateStep,
  values: FormValues,
  options: DonationCreateOptions,
): string | undefined {
  const donor = findCreateDonor(options, String(values['donorId'] ?? ''));
  if (!donor) return 'Please select a donor.';
  const guest = donor.type === 'GUEST';
  values['donorIsGuest'] = guest ? 'Y' : 'N';
  if (guest) values['type'] = 'ONETIME';
  if (step === 'donation_details'
    && values['donationFor'] === 'PROJECT' && !values['forEventId']) {
    return 'Please select an event.';
  }
  return undefined;
}

export function donationCreateEntity(
  values: FormValues,
  options: DonationCreateOptions,
  presetEventId?: string,
): Donation {
  const donor = findCreateDonor(options, String(values['donorId'] ?? ''));
  if (!donor) throw new Error('Please select a donor.');
  const type = (values['type'] as Donation['type']) ?? 'ONETIME';
  const range = isDateRangeValue(values['dateRange']) ? values['dateRange'] : {};
  const amount = Number(values['amount']);
  const displayName = `${donor.fullName} (${donor.type === 'GUEST' ? 'Guest' : 'Member'})`;
  return {
    id: '',
    donorId: donor.id,
    donorName: donor.fullName,
    amount,
    currency: 'INR',
    type,
    status: 'RAISED',
    raisedOn: new Date().toISOString().slice(0, 10),
    startDate: type === 'REGULAR' ? range.startDate : undefined,
    endDate: type === 'REGULAR' ? range.endDate : undefined,
    forEvent: String(values['forEventId'] ?? presetEventId ?? '') || undefined,
    isGuest: donor.type === 'GUEST',
    displayName,
    formattedAmount: `₹ ${amount.toLocaleString('en-IN')}`,
    isPaid: false,
    isPending: true,
    isCancelled: false,
  };
}

export async function saveDonationBulk(
  data: DonationDataSource,
  donations: readonly Donation[],
  values: FormValues,
  documents: FileUpload[],
): Promise<Donation[]> {
  const patch = donationUpdatePatch(values);
  const updated: Donation[] = [];
  const mappings: UploadDocumentRequestDto['mappings'] = [];
  for (const donation of donations) {
    const result = await firstValueFrom(data.updateDonation(donation.id, patch, []));
    updated.push(result);
    mappings.push({ entityId: result.id, entityType: 'DONATION' });
    if (result.transactionRef) {
      mappings.push({ entityId: result.transactionRef, entityType: 'TRANSACTION' });
    }
  }
  if (documents.length) {
    await firstValueFrom(data.uploadDonationDocuments(documents.map(document => ({
      contentType: document.detail.contentType,
      fileBase64: document.detail.base64Content,
      fileName: document.detail.originalFileName,
      mappings,
    }))));
  }
  return updated;
}
