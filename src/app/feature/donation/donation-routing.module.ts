import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { donationDashboardResolver, donationRefDataResolver } from './donation.resolver';
import { DonationDashboardComponent } from './donation-dashboard/donation-dashboard.component';
import { DonationDashboardComponentOld } from './donation-dashboard-old/donation-dashboard.component';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_donation_dashboard_page.path,
    component: DonationDashboardComponentOld,
    resolve:{
      data:donationDashboardResolver,
      ref_data:donationRefDataResolver
    }
  },
  {
    path: 'test',
    component: DonationDashboardComponent,
    resolve:{
      data:donationDashboardResolver,
      ref_data:donationRefDataResolver
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DonationRoutingModule { }
