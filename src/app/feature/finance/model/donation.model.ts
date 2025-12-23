/**
 * Domain models for Donation feature
 * These models are used by components and are decoupled from API client models
 */

import { PagedResult } from '../../../shared/model/paged-result.model';
import { Account } from './account.model';
import { UserDto } from 'src/app/core/api-client/models';

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  type: 'REGULAR' | 'ONETIME';
  status: 'RAISED' | 'PAID' | 'PENDING' | 'PAYMENT_FAILED' | 'PAY_LATER' | 'CANCELLED' | 'UPDATE_MISTAKE';

  // Dates
  raisedOn: string;
  startDate?: string;
  endDate?: string;
  paidOn?: string;
  confirmedOn?: string;

  // Payment details
  paymentMethod?: 'CASH' | 'NETBANKING' | 'UPI';
  paidUsingUPI?: 'GPAY' | 'PAYTM' | 'PHONEPE' | 'BHARATPAY' | 'UPI_OTH';
  transactionRef?: string;
  paidToAccount?: Account;
  paidToAccountId?: string;

  // Additional fields
  forEvent?: string;
  isGuest?: boolean;
  isPaymentNotified?: boolean;
  confirmedBy?: UserDto;
  remarks?: string;
  cancelletionReason?: string;
  laterPaymentReason?: string;
  paymentFailureDetail?: string;

  // Computed properties for UI
  displayName: string;
  formattedAmount: string;
  isPaid: boolean;
  isPending: boolean;
  isCancelled: boolean;
  periodDisplay?: string;
  nextStatuses?: string[];
}

export interface DonationSummary {
  hasOutstanding: boolean;
  outstandingAmount: number;
  outstandingMonths: string[];

  // Computed properties
  formattedOutstandingAmount: string;
}

/**
 * Type alias for paged donation results
 */
export type PagedDonations = PagedResult<Donation>;

export interface DonationDashboardData {
  donations: PagedDonations;
  summary: DonationSummary;
  accounts: Account[];
}

