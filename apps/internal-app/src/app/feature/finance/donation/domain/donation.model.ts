import type { FieldOption } from '@nabarun-ngo/forms-core';
import type { Account } from '../../accounts/domain';
import type { PagedResult } from 'src/app/shared/models/paged-result.model';
import type { KeyValue } from 'src/app/shared/models/key-value.model';
import type { DonationDonorOption } from '../data/donation-data.source';

export type DonationStatus =
  | 'RAISED' | 'PAID' | 'PENDING' | 'PAYMENT_FAILED'
  | 'PAY_LATER' | 'CANCELLED' | 'UPDATE_MISTAKE';

export interface Donation {
  id: string;
  donorId: string;
  donorName: string;
  donorEmail?: string;
  donorPhone?: string;
  amount: number;
  currency: string;
  type: 'REGULAR' | 'ONETIME';
  status: DonationStatus;
  raisedOn: string;
  startDate?: string;
  endDate?: string;
  paidOn?: string;
  confirmedOn?: string;
  paymentMethod?: 'CASH' | 'NETBANKING' | 'UPI';
  paidUsingUPI?: 'GPAY' | 'PAYTM' | 'PHONEPE' | 'BHARATPAY' | 'UPI_OTH';
  transactionRef?: string;
  paidToAccount?: Account;
  paidToAccountId?: string;
  forEvent?: string;
  activityName?: string;
  isGuest?: boolean;
  confirmedBy?: { id?: string; fullName?: string };
  remarks?: string;
  cancelletionReason?: string;
  laterPaymentReason?: string;
  paymentFailureDetail?: string;
  displayName: string;
  formattedAmount: string;
  isPaid: boolean;
  isPending: boolean;
  isCancelled: boolean;
  periodDisplay?: string;
  nextStatuses?: string[];
  invoice?: {
    id: string;
    status: string;
    documentId?: string;
    issuedOn: string;
  };
}

export type PagedDonation = PagedResult<Donation>;

export interface DonationDashboardData {
  donations: PagedDonation;
  accounts: Account[];
}

export type DonationPrimaryChip =
  | 'mine'
  | 'all_outstanding'
  | 'all_closed';

export interface DonationFilterCriteria {
  [key: string]: unknown;
  guestDonor?: boolean;
  memberId?: string;
  memberName?: string;
  type?: string[];
  status?: string[];
  startDate?: string;
  endDate?: string;
  donationId?: string;
  forEventId?: string;
}

export interface DonationStatusGroups {
  outstanding: string[];
  closed: string[];
  excluded: string[];
}

export type DonationRefData = Record<
  string,
  KeyValue[] | DonationStatusGroups | undefined
>;

export interface DonationCreateOptions {
  donors: DonationDonorOption[];
  donorOptions: FieldOption[];
  typeOptionsByDonor: Record<string, FieldOption[]>;
  eventOptions: FieldOption[];
  lockProjectDonation: boolean;
}

export interface DonationListContext {
  [key: string]: unknown;
  refData: DonationRefData;
  activeChip: DonationPrimaryChip;
  presets: { forEventId?: string; projectLabel?: string };
  donors: DonationDonorOption[];
  donorOptions: FieldOption[];
  payableAccountOptions: FieldOption[];
  createOptions: DonationCreateOptions;
  entity?: Donation;
}
