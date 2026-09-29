import type { DonationCreateOptions } from '../domain';
import {
  donationCreateEntity,
  donationRequiresPaymentProof,
  donationUpdatePatch,
  donationValuesToCriteria,
  validateDonationCreateStep,
} from './donation.forms';

describe('donation forms', () => {
  const options: DonationCreateOptions = {
    donors: [
      { id: 'MEMBER-1', fullName: 'Member One', status: 'ACTIVE', type: 'MEMBER' },
      { id: 'GUEST-1', fullName: 'Guest One', status: 'ACTIVE', type: 'GUEST' },
    ],
    donorOptions: [],
    typeOptionsByDonor: {},
    eventOptions: [],
    lockProjectDonation: false,
  };

  it('drops donor criteria for the mine chip', () => {
    const criteria = donationValuesToCriteria('mine', {
      memberId: 'MEMBER-1',
      guestDonor: true,
      donationId: ' DON-1 ',
    });

    expect(criteria.memberId).toBeUndefined();
    expect(criteria.guestDonor).toBeUndefined();
    expect(criteria.donationId).toBe('DON-1');
  });

  it('omits amount while marking a donation paid', () => {
    const patch = donationUpdatePatch({
      status: 'PAID',
      amount: 500,
      paidOn: '2026-09-26',
      paidToAccountId: 'ACCOUNT-1',
      paymentMethod: 'UPI',
      paidUsingUPI: 'GPAY',
    });

    expect(patch.amount).toBeUndefined();
    expect(patch.paymentMethod).toBe('UPI');
    expect(patch.paidUsingUPI).toBe('GPAY');
  });

  it('requires proof only for electronic paid donations', () => {
    expect(donationRequiresPaymentProof('PAID', 'UPI')).toBeTrue();
    expect(donationRequiresPaymentProof('PAID', 'NETBANKING')).toBeTrue();
    expect(donationRequiresPaymentProof('PAID', 'CASH')).toBeFalse();
    expect(donationRequiresPaymentProof('PENDING', 'UPI')).toBeFalse();
  });

  it('forces guest donors to one-time donations', () => {
    const values = { donorId: 'GUEST-1', type: 'REGULAR' };

    expect(validateDonationCreateStep('donation_donor', values, options)).toBeUndefined();
    expect(values.type).toBe('ONETIME');
    expect(values['donorIsGuest' as keyof typeof values]).toBe('Y');
  });

  it('requires an event for project donations', () => {
    expect(validateDonationCreateStep('donation_details', {
      donorId: 'MEMBER-1',
      donationFor: 'PROJECT',
    }, options)).toBe('Please select an event.');
  });

  it('creates regular donations with their selected period', () => {
    const donation = donationCreateEntity({
      donorId: 'MEMBER-1',
      type: 'REGULAR',
      amount: 1200,
      dateRange: { startDate: '2026-01-01', endDate: '2026-12-31' },
    }, options);

    expect(donation.startDate).toBe('2026-01-01');
    expect(donation.endDate).toBe('2026-12-31');
    expect(donation.formattedAmount).toContain('1,200');
  });
});
