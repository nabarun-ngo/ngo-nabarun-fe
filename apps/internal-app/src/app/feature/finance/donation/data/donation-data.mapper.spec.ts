import type { DonationDto, DonationRefDataDto } from 'src/app/core/api/api-client/models';
import { DonationRefData } from '../../finance.const';
import { mapDonationDto, mapDonationRefData } from './donation-data.mapper';

describe('donation data mapper', () => {
  it('derives display and state fields from the API DTO', () => {
    const donation = mapDonationDto({
      id: 'DON-1',
      donorId: 'DONOR-1',
      donorName: '',
      amount: 1000,
      currency: '',
      type: 'ONETIME',
      status: 'PENDING',
      raisedOn: '2026-09-26',
      nextStatuses: ['PAID'],
    } satisfies DonationDto);

    expect(donation.donorName).toBe('Unknown');
    expect(donation.currency).toBe('₹');
    expect(donation.formattedAmount).toBe('₹ 1,000');
    expect(donation.isPending).toBeTrue();
    expect(donation.isPaid).toBeFalse();
  });

  it('maps invoice details when present', () => {
    const donation = mapDonationDto({
      id: 'DON-2',
      donorId: 'DONOR-2',
      donorName: 'Donor Two',
      amount: 500,
      currency: 'INR',
      type: 'ONETIME',
      status: 'PAID',
      raisedOn: '2026-09-26',
      nextStatuses: [],
      invoice: {
        id: 'INV-1',
        entityId: 'DON-2',
        status: 'ISSUED',
        issuedOn: '2026-09-26',
      },
    } satisfies DonationDto);

    expect(donation.invoice).toEqual({
      id: 'INV-1',
      status: 'ISSUED',
      documentId: undefined,
      issuedOn: '2026-09-26',
    });
  });

  it('copies status groups so callers cannot mutate the DTO', () => {
    const dto = {
      donationStatusGroups: {
        outstanding: ['RAISED'],
        closed: ['PAID'],
        excluded: ['CANCELLED'],
      },
    } as DonationRefDataDto;
    const mapped = mapDonationRefData(dto);
    const groups = mapped[DonationRefData.refDataKey.statusGroups] as {
      outstanding: string[];
      closed: string[];
      excluded: string[];
    };

    groups.outstanding.push('PENDING');
    expect(dto.donationStatusGroups?.outstanding).toEqual(['RAISED']);
  });
});
