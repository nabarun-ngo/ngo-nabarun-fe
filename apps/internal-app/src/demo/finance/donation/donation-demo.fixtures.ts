import type { Donation } from 'src/app/feature/finance/donation/domain';

export const DONATION_DEMO_SELF_DONOR_ID = 'donor-1';

export const DONATION_DEMO_DONORS = [
  { id: 'donor-1', fullName: 'Priya Sharma', status: 'ACTIVE', type: 'MEMBER' as const, preferredAmount: 1000 },
  { id: 'donor-2', fullName: 'Rahul Mehta', status: 'ACTIVE', type: 'MEMBER' as const, preferredAmount: 1500 },
  { id: 'donor-3', fullName: 'Ananya Iyer', status: 'ACTIVE', type: 'MEMBER' as const, preferredAmount: 2000 },
  { id: 'donor-4', fullName: 'Vikram Singh', status: 'ACTIVE', type: 'MEMBER' as const, preferredAmount: 2500 },
  { id: 'donor-5', fullName: 'Kavita Desai', status: 'ACTIVE', type: 'MEMBER' as const, preferredAmount: 500 },
  { id: 'donor-6', fullName: 'Arjun Patel', status: 'ACTIVE', type: 'MEMBER' as const, preferredAmount: 3000 },
  { id: 'donor-7', fullName: 'Meera Nair', status: 'PAUSED', type: 'MEMBER' as const, preferredAmount: 1000 },
  { id: 'donor-8', fullName: 'Sanjay Gupta', status: 'ACTIVE', type: 'MEMBER' as const, preferredAmount: 750 },
  { id: 'donor-9', fullName: 'Deepa Reddy', status: 'ACTIVE', type: 'MEMBER' as const, preferredAmount: 1200 },
  { id: 'donor-10', fullName: 'Karan Malhotra', status: 'ACTIVE', type: 'MEMBER' as const, preferredAmount: 5000 },
  { id: 'donor-11', fullName: 'Neha Kapoor', status: 'WAIVED', type: 'MEMBER' as const, preferredAmount: 1000 },
  { id: 'donor-12', fullName: 'Rohit Choudhary', status: 'ACTIVE', type: 'MEMBER' as const, preferredAmount: 800 },
  { id: 'guest-1', fullName: 'Asha Verma', status: 'ACTIVE', type: 'GUEST' as const },
  { id: 'guest-2', fullName: 'Imran Khan', status: 'ACTIVE', type: 'GUEST' as const },
  { id: 'guest-3', fullName: 'Lakshmi Pillai', status: 'ACTIVE', type: 'GUEST' as const },
  { id: 'guest-4', fullName: 'Farhan Ali', status: 'ACTIVE', type: 'GUEST' as const },
  { id: 'guest-5', fullName: 'Sunita Bose', status: 'ACTIVE', type: 'GUEST' as const },
  { id: 'guest-6', fullName: 'Manish Tiwari', status: 'PAUSED', type: 'GUEST' as const },
  { id: 'guest-7', fullName: 'Rekha Menon', status: 'ACTIVE', type: 'GUEST' as const },
  { id: 'guest-8', fullName: 'Aditi Joshi', status: 'ACTIVE', type: 'GUEST' as const },
];

const OUTSTANDING_STATUSES = ['RAISED', 'PENDING', 'PAY_LATER'] as const;
const OUTSTANDING_AMOUNTS = [500, 750, 1000, 1500, 2000, 2500, 5000];

const OUTSTANDING_DONATIONS: Donation[] = Array.from({ length: 50 }, (_, index) => {
  const sequence = index + 1;
  const donor = DONATION_DEMO_DONORS[index % DONATION_DEMO_DONORS.length];
  const amount = OUTSTANDING_AMOUNTS[index % OUTSTANDING_AMOUNTS.length];
  const status = OUTSTANDING_STATUSES[index % OUTSTANDING_STATUSES.length];
  const raisedOn = new Date(Date.UTC(2026, 7, 1 - index))
    .toISOString()
    .slice(0, 10);

  return {
    id: `DONATION-${String(sequence).padStart(3, '0')}`,
    donorId: donor.id,
    donorName: donor.fullName,
    amount,
    currency: '₹',
    type: index % 4 === 3 ? 'ONETIME' : 'REGULAR',
    status,
    raisedOn,
    startDate: raisedOn,
    displayName: donor.fullName,
    formattedAmount: `₹ ${amount.toLocaleString('en-IN')}`,
    isGuest: donor.type === 'GUEST',
    isPaid: false,
    isPending: true,
    isCancelled: false,
    nextStatuses: status === 'PAY_LATER'
      ? ['PAID', 'CANCELLED', 'PAYMENT_FAILED']
      : ['PENDING', 'PAID', 'PAY_LATER', 'CANCELLED', 'PAYMENT_FAILED'],
  };
});

export const DONATION_DEMO_FIXTURES: Donation[] = [
  ...OUTSTANDING_DONATIONS,
  {
    id: 'DONATION-051',
    donorId: 'guest-1',
    donorName: 'Asha Verma',
    amount: 5000,
    currency: '₹',
    type: 'ONETIME',
    status: 'PAID',
    raisedOn: '2026-07-20',
    paidOn: '2026-07-21',
    paymentMethod: 'UPI',
    paidToAccountId: 'donation-account-main',
    displayName: 'Asha Verma',
    formattedAmount: '₹ 5,000',
    isGuest: true,
    isPaid: true,
    isPending: false,
    isCancelled: false,
    nextStatuses: ['UPDATE_MISTAKE'],
  },
];

export const DONATION_DEMO_REF_DATA: any = {
  donationStatuses: [
    { key: 'RAISED', displayValue: 'Raised' },
    { key: 'PENDING', displayValue: 'Pending' },
    { key: 'PAY_LATER', displayValue: 'Pay later' },
    { key: 'PAID', displayValue: 'Paid' },
    { key: 'PAYMENT_FAILED', displayValue: 'Payment failed' },
    { key: 'CANCELLED', displayValue: 'Cancelled' },
    { key: 'UPDATE_MISTAKE', displayValue: 'Update mistake' },
  ],
  donationTypes: [
    { key: 'REGULAR', displayValue: 'Regular' },
    { key: 'ONETIME', displayValue: 'One time' },
  ],
  paymentMethods: [
    { key: 'CASH', displayValue: 'Cash' },
    { key: 'NETBANKING', displayValue: 'Net banking' },
    { key: 'UPI', displayValue: 'UPI' },
  ],
  upiOptions: [
    { key: 'GPAY', displayValue: 'Google Pay' },
    { key: 'PAYTM', displayValue: 'Paytm' },
    { key: 'PHONEPE', displayValue: 'PhonePe' },
    { key: 'BHARATPAY', displayValue: 'BharatPe' },
    { key: 'UPI_OTH', displayValue: 'Other UPI' },
  ],
  donationStatusGroups: {
    outstanding: ['RAISED', 'PENDING', 'PAY_LATER'],
    closed: ['PAID'],
    excluded: ['CANCELLED', 'PAYMENT_FAILED', 'UPDATE_MISTAKE'],
  },
};
