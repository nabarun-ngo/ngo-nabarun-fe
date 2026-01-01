/**
 * Mapper functions to convert API client models to domain models
 */

import {
  DonationDto,
  PagedResultDonationDto,
  DonationSummaryDto,
  AccountDetailDto
} from 'src/app/core/api-client/models';
import { Donation, DonationSummary, PagedDonations } from './donation.model';
import { mapPagedResult } from '../../../shared/model/paged-result.model';
import { mapAccountDtoToAccount } from './account.mapper';
import { date } from 'src/app/core/service/utilities.service';
import { Account } from './account.model';

/**
 * Get donation type label
 */
function getDonationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    'REGULAR': 'Regular',
    'ONETIME': 'One-time'
  };
  return labels[type] || type;
}

/**
 * Get donation status label
 */
function getDonationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    'RAISED': 'Raised',
    'PAID': 'Paid',
    'PENDING': 'Pending',
    'PAYMENT_FAILED': 'Payment Failed',
    'PAY_LATER': 'Pay Later',
    'CANCELLED': 'Cancelled',
    'UPDATE_MISTAKE': 'Update Mistake'
  };
  return labels[status] || status;
}

/**
 * Format donation period display
 */
function formatDonationPeriod(startDate?: string, endDate?: string, type?: string): string | undefined {
  if (type === 'ONETIME') {
    return undefined;
  }
  if (startDate && endDate) {
    return `${date(startDate)} - ${date(endDate)}`;
  }
  if (startDate) {
    return `From ${date(startDate)}`;
  }
  return undefined;
}

/**
 * Map API DonationDto to domain Donation
 */
export function mapDonationDtoToDonation(dto: DonationDto): Donation {
  const amount = dto.amount ?? 0;
  const currency = dto.currency || '₹';
  const donorName = dto.donorName || 'Unknown';

  // Map paidToAccount if present
  let paidToAccount: Account | undefined;
  if (dto.paidToAccount) {
    paidToAccount = mapAccountDtoToAccount(dto.paidToAccount);
  }

  return {
    id: dto.id,
    donorId: dto.donorId,
    donorName: donorName,
    donorEmail: dto.donorEmail,
    donorPhone: dto.donorNumber,
    amount: amount,
    currency: currency,
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
    paidToAccount: paidToAccount,
    forEvent: dto.forEvent,
    isGuest: dto.isGuest,
    isPaymentNotified: dto.isPaymentNotified,
    confirmedBy: dto.confirmedBy,
    remarks: dto.remarks,
    cancelletionReason: dto.cancelletionReason,
    laterPaymentReason: dto.laterPaymentReason,
    paymentFailureDetail: dto.paymentFailureDetail,

    // Computed properties
    displayName: `${dto.id} - ${donorName} (${currency} ${amount})`,
    formattedAmount: `${currency} ${amount.toLocaleString('en-IN')}`,
    isPaid: dto.status === 'PAID',
    isPending: dto.status === 'PENDING' || dto.status === 'RAISED',
    isCancelled: dto.status === 'CANCELLED',
    periodDisplay: formatDonationPeriod(dto.startDate, dto.endDate, dto.type),
    nextStatuses: dto.nextStatuses,
    paidToAccountId: paidToAccount?.id
  };
}

/**
 * Map API PagedResultDonationDto to domain PagedDonations
 */
export function mapPagedDonationDtoToPagedDonations(dto: PagedResultDonationDto): PagedDonations {
  return mapPagedResult(dto, mapDonationDtoToDonation);
}

/**
 * Map API DonationSummaryDto to domain DonationSummary
 */
export function mapDonationSummaryDtoToDonationSummary(dto: DonationSummaryDto): DonationSummary {
  const outstandingAmount = dto.outstandingAmount ?? 0;

  return {
    hasOutstanding: dto.hasOutstanding ?? false,
    outstandingAmount: outstandingAmount,
    outstandingMonths: dto.outstandingMonths ?? [],

    // Computed properties
    formattedOutstandingAmount: `₹${outstandingAmount.toLocaleString('en-IN')}`
  };
}

