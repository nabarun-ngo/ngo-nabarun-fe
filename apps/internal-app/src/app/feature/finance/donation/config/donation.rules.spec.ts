import { DonationRefData } from '../../finance.const';
import {
  applyDonationProjectScope,
  buildDonationApiFilter,
  donationStatuses,
  normalizeDonationChip,
} from './donation.rules';

describe('donation rules', () => {
  const refData = {
    [DonationRefData.refDataKey.statusGroups]: {
      outstanding: ['RAISED', 'PENDING'],
      closed: ['PAID'],
      excluded: ['CANCELLED'],
    },
  };

  it('normalizes legacy and unknown route chips', () => {
    expect(normalizeDonationChip('donation_all_closed')).toBe('all_closed');
    expect(normalizeDonationChip('unknown')).toBe('mine');
  });

  it('intersects explicit statuses with the selected chip', () => {
    expect(donationStatuses(
      'all_outstanding',
      { status: ['PENDING', 'PAID'] },
      refData,
    )).toEqual(['PENDING']);
  });

  it('falls back to the chip preset when statuses do not intersect', () => {
    expect(donationStatuses(
      'all_outstanding',
      { status: ['PAID'] },
      refData,
    )).toEqual(['RAISED', 'PENDING']);
  });

  it('does not send donor filters for the mine chip', () => {
    const filter = buildDonationApiFilter('mine', {
      memberId: 'MEMBER-1',
      memberName: 'Member One',
      guestDonor: true,
      donationId: 'fallback',
    }, '  DON-1  ', refData);

    expect(filter.donationId).toBe('DON-1');
    expect(filter.donorId).toBeUndefined();
    expect(filter.donorName).toBeUndefined();
    expect(filter.isGuest).toBeUndefined();
  });

  it('applies a project scope without mutating the original criteria', () => {
    const criteria = { donationId: 'DON-1' };
    const scoped = applyDonationProjectScope(criteria, 'EVENT-1');

    expect(scoped).toEqual({
      donationId: 'DON-1',
      guestDonor: true,
      forEventId: 'EVENT-1',
    });
    expect(criteria).toEqual({ donationId: 'DON-1' });
  });
});
