import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DonationRoutingModule } from './donation-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { DonationAccordionComponent } from './donation-accordion/donation-accordion.component';
import { QRCodeModule } from 'angularx-qrcode';
import { MemberAccordionComponent } from './member-accordion/member-accordion.component';
import { DonationDashboardNewComponent } from './donation-dashboard-new/donation-dashboard-new.component';
import { DonationDashboardComponent } from './donation-dashboard/donation-dashboard.component';
import { DonationPipe, MemberSearchPipe } from './donation.pipe';
import { SelfDonationTabComponent } from './donation-dashboard-new/self-donation-tab/self-donation-tab.component';
import { GuestDonationTabComponent } from './donation-dashboard-new/guest-donation-tab/guest-donation-tab.component';
import { MemberDonationTabComponent } from './donation-dashboard-new/member-donation-tab/member-donation-tab.component';


@NgModule({
  declarations: [
    DonationDashboardNewComponent,
    DonationDashboardComponent,
    DonationAccordionComponent,
    MemberAccordionComponent,
    DonationPipe,
    MemberSearchPipe,
    SelfDonationTabComponent,
    GuestDonationTabComponent,
    MemberDonationTabComponent
  ],
  imports: [
    CommonModule,
    DonationRoutingModule,
    SharedModule,
    QRCodeModule,
  ]
})
export class DonationModule { }
