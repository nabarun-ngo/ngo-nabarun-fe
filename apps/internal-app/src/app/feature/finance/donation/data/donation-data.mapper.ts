import type { DonationDto, DonationRefDataDto } from 'src/app/core/api/api-client/models';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import { mapAccountDtoToAccount } from '../../accounts/data/account-api.mapper';
import { DonationRefData as DonationRefDataKeys } from '../../finance.const';
import type {
  Donation,
  DonationRefData,
} from '../domain';

export function mapDonationDto(dto: DonationDto): Donation {
  const amount = dto.amount ?? 0;
  const currency = dto.currency || '₹';
  const donorName = dto.donorName || 'Unknown';
  const paidToAccount = dto.paidToAccount
    ? mapAccountDtoToAccount(dto.paidToAccount)
    : undefined;
  const invoice = (dto as DonationDto & {
    invoice?: { id: string; status: string; documentId?: string; issuedOn: string };
  }).invoice;
  return {
    id: dto.id,
    donorId: dto.donorId,
    donorName,
    donorEmail: dto.donorEmail,
    donorPhone: dto.donorNumber,
    amount,
    currency,
    type: dto.type,
    status: dto.status,
    raisedOn: dto.raisedOn,
    startDate: dto.startDate,
    endDate: dto.endDate,
    paidOn: dto.paidOn,
    confirmedOn: dto.confirmedOn,
    paymentMethod: dto.paymentMethod,
    paidUsingUPI: dto.paidUsingUPI,
    transactionRef: dto.transactionRef,
    paidToAccount,
    paidToAccountId: paidToAccount?.id,
    forEvent: dto.forEvent,
    activityName: dto.activityName,
    isGuest: dto.isGuest,
    confirmedBy: dto.confirmedBy
      ? { id: dto.confirmedBy.id, fullName: dto.confirmedBy.fullName }
      : undefined,
    remarks: dto.remarks,
    cancelletionReason: dto.cancelletionReason,
    laterPaymentReason: dto.laterPaymentReason,
    paymentFailureDetail: dto.paymentFailureDetail,
    displayName: `${donorName} ${dto.isGuest ? '(Guest)' : ''}`,
    formattedAmount: `${currency} ${amount.toLocaleString('en-IN')}`,
    isPaid: dto.status === 'PAID',
    isPending: dto.status === 'PENDING' || dto.status === 'RAISED',
    isCancelled: dto.status === 'CANCELLED',
    nextStatuses: dto.nextStatuses,
    invoice: invoice
      ? {
          id: invoice.id,
          status: invoice.status,
          documentId: invoice.documentId,
          issuedOn: invoice.issuedOn,
        }
      : undefined,
  };
}

const items = (value: any[] | undefined): KeyValue[] =>
  (value ?? []).filter(item => item.key).map(item => ({
    key: item.key,
    displayValue: item.displayValue ?? item.value ?? item.key,
  }));

export function mapDonationRefData(dto?: DonationRefDataDto): DonationRefData {
  if (!dto) return {};
  const result: DonationRefData = {
    [DonationRefDataKeys.refDataKey.status]: items(dto.donationStatuses),
    [DonationRefDataKeys.refDataKey.type]: items(dto.donationTypes),
    [DonationRefDataKeys.refDataKey.paymentMethod]: items(dto.paymentMethods),
    [DonationRefDataKeys.refDataKey.upiOps]: items(dto.upiOptions),
  };
  if (dto.donationStatusGroups) {
    result[DonationRefDataKeys.refDataKey.statusGroups] = {
      outstanding: [...(dto.donationStatusGroups.outstanding ?? [])],
      closed: [...(dto.donationStatusGroups.closed ?? [])],
      excluded: [...(dto.donationStatusGroups.excluded ?? [])],
    };
  }
  return result;
}
