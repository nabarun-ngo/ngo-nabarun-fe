import { Injectable } from '@angular/core';
import { delay, of } from 'rxjs';
import type { FileUpload } from 'src/app/shared/components/file-upload/file-upload.component';
import type { Account } from 'src/app/feature/finance/accounts/domain';
import type { Donation } from 'src/app/feature/finance/donation/domain';
import {
  buildDonationApiFilter,
  normalizeDonationChip,
} from 'src/app/feature/finance/donation/config/donation.rules';
import type { DonationDataSource, DonationListQuery } from 'src/app/feature/finance/donation/data/donation-data.source';
import {
  DONATION_DEMO_DONORS,
  DONATION_DEMO_FIXTURES,
  DONATION_DEMO_REF_DATA,
  DONATION_DEMO_SELF_DONOR_ID,
} from './donation-demo.fixtures';

@Injectable()
export class DonationDemoDataSource implements DonationDataSource {
  private readonly donations = [...DONATION_DEMO_FIXTURES];

  loadDonationPage(query: DonationListQuery) {
    const chip = normalizeDonationChip(query.chipId);
    const filter = buildDonationApiFilter(chip, query.criteria ?? {}, query.searchText, query.refData);
    const filtered = this.donations.filter(item =>
      (chip !== 'mine' || item.donorId === DONATION_DEMO_SELF_DONOR_ID)
      && (!filter.donationId || item.id.toLowerCase().includes(filter.donationId.toLowerCase()))
      && (!filter.status?.length || filter.status.includes(item.status))
      && (!filter.type?.length || filter.type.includes(item.type))
      && (!filter.donorId || item.donorId === filter.donorId)
      && (!filter.isGuest || item.isGuest)
      && (!filter.forEventId || item.forEvent === filter.forEventId));
    const start = query.pageIndex * query.pageSize;
    return of({
      donations: {
        content: filtered.slice(start, start + query.pageSize),
        totalSize: filtered.length,
        pageIndex: query.pageIndex,
        pageSize: query.pageSize,
      },
      accounts: [],
    }).pipe(delay(100));
  }

  fetchDonationById(id: string) {
    return of(this.donations.find(item => item.id.toLowerCase() === id.toLowerCase()));
  }
  fetchDonationDonors() {
    const content = [...DONATION_DEMO_DONORS];
    return of({ content, totalSize: content.length, pageIndex: 0, pageSize: 500 });
  }
  fetchDonationAccounts() {
    return of([{ id: 'donation-account-main', displayName: 'Main Donation Account' } as Account]);
  }
  fetchDonationDocuments() { return of([]); }
  fetchDonationRefData() { return of(DONATION_DEMO_REF_DATA); }
  fetchDonationEvents() {
    return of([{ key: 'donation-event-one', label: 'Community Drive' }]);
  }
  createDonation(value: Donation) {
    const created = { ...value, id: `DONATION-${String(this.donations.length + 1).padStart(3, '0')}` };
    this.donations.unshift(created);
    return of(created);
  }
  updateDonation(id: string, value: Partial<Donation>, _documents?: FileUpload[]) {
    const index = this.donations.findIndex(item => item.id === id);
    const updated = { ...this.donations[index], ...value, id } as Donation;
    if (index >= 0) this.donations[index] = updated;
    return of(updated);
  }
  uploadDonationDocuments() { return of([]); }
}
