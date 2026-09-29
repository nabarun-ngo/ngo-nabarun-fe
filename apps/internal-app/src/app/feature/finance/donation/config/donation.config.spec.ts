import type { AuthorizationService } from '@ssdev-toolkit/angular-auth';
import type { ModalService } from 'src/app/core/shell/service/modal.service';
import type { DonationDataSource } from '../data/donation-data.source';
import { createDonationContext } from './donation.rules';
import { createDonationListConfig } from './donation.config';

describe('donation list config', () => {
  it('keeps create deep links behind create-open preparation', () => {
    const config = createDonationListConfig({
      data: {} as DonationDataSource,
      authorization: {} as AuthorizationService,
      modal: {} as ModalService,
      context: createDonationContext({ refData: {} }),
      openDonor: () => undefined,
    });

    expect(config.meta.id).toBe('donation-list');
    expect(config.preparation?.triggers?.createOpen).toContain('donationCreateOptions');
    expect(config.preparation?.tasks?.map(task => task.id)).toContain('donationCreateOptions');
  });
});
