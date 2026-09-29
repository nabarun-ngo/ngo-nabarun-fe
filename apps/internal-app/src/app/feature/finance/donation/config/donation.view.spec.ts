import { DonationRefData } from '../../finance.const';
import type { Donation } from '../domain';
import { mapDonationListRow } from './donation.view';

describe('donation list view', () => {
  const baseDonation: Donation = {
    id: 'DON-1',
    donorId: 'DONOR-1',
    donorName: 'Donor One',
    amount: 1000,
    currency: 'INR',
    type: 'ONETIME',
    status: 'RAISED',
    raisedOn: '2026-09-26',
    displayName: 'Donor One',
    formattedAmount: '₹ 1,000',
    isPaid: false,
    isPending: true,
    isCancelled: false,
  };
  const refData = {
    [DonationRefData.refDataKey.statusGroups]: {
      outstanding: ['RAISED'],
      closed: ['PAID'],
      excluded: ['CANCELLED'],
    },
    [DonationRefData.refDataKey.status]: [
      { key: 'RAISED', displayValue: 'Raised' },
      { key: 'PAID', displayValue: 'Paid' },
    ],
    [DonationRefData.refDataKey.type]: [
      { key: 'ONETIME', displayValue: 'One-time' },
    ],
  };

  it('marks outstanding donations with a warning badge', () => {
    const row = mapDonationListRow(baseDonation, refData);

    expect(row.badge).toEqual({ label: 'Raised', tone: 'warning' });
    expect(row.subtitleParts?.[1]).toEqual({
      text: 'Donor One',
      linkId: 'donation_donor',
    });
  });

  it('marks closed donations with a success badge', () => {
    const row = mapDonationListRow({
      ...baseDonation,
      status: 'PAID',
      isPaid: true,
      isPending: false,
    }, refData);

    expect(row.badge?.tone).toBe('success');
  });

  it('uses the guest icon tone for guest donations', () => {
    const row = mapDonationListRow({
      ...baseDonation,
      isGuest: true,
    }, refData);

    expect(row.iconTone).toBe('indigo');
  });
});
