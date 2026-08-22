import { inject } from '@angular/core';
import type { ResolveFn } from '@angular/router';
import { map } from 'rxjs';
import type { DonationRefData } from '../domain';
import { mapDonationRefData } from './donation-data.mapper';
import { DonationDataSource } from './donation-data.source';

export const donationRefDataResolver: ResolveFn<DonationRefData> = () =>
  inject(DonationDataSource).fetchDonationRefData().pipe(map(mapDonationRefData));
