import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { donationDashboardResolver, donationDashboardResolverNew, donationRefDataResolver, donationRefDataResolverNew } from './donation.resolver';
import { DonationDashboardNewComponent } from './donation-dashboard-new/donation-dashboard-new.component';
import { DonationDashboardComponent } from './donation-dashboard/donation-dashboard.component';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_donation_dashboard_page.path,
    component: DonationDashboardNewComponent,
    resolve: {
      data: donationDashboardResolverNew,
      ref_data: donationRefDataResolverNew
    }
  },
  {
    path: 'legacy',
    component: DonationDashboardComponent,
    resolve: {
      data: donationDashboardResolver,
      ref_data: donationRefDataResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DonationRoutingModule { }
