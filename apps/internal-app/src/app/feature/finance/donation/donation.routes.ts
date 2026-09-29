import type { Route } from '@angular/router';
import { provideDonorInfrastructure } from '../donors/data/donor.providers';
import { provideDonationInfrastructure } from './data/donation.providers';
import { donationRefDataResolver } from './data/donation.resolver';

export function donationDashboardRoute(path: string): Route {
  return {
    path,
    loadComponent: () => import('./page/donation-dashboard.component')
      .then(module => module.DonationDashboardComponent),
    providers: [
      ...provideDonationInfrastructure(),
      ...provideDonorInfrastructure(),
    ],
    resolve: {
      ref_data: donationRefDataResolver,
    },
  };
}
