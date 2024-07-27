import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DonationRoutingModule } from './donation-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { DonationAccordionComponent } from './donation-accordion/donation-accordion.component';
import { QRCodeModule } from 'angularx-qrcode';
import { MemberAccordionComponent } from './member-accordion/member-accordion.component';
import { DonationDashboardNewComponent } from './donation-dashboard-new/donation-dashboard-new.component';
import { DonationDashboardComponent } from './donation-dashboard/donation-dashboard.component';


@NgModule({
  declarations: [
    DonationDashboardNewComponent,
    DonationDashboardComponent,
    DonationAccordionComponent,
    MemberAccordionComponent,
  ],
  imports: [
    CommonModule,
    DonationRoutingModule,
    SharedModule,
    QRCodeModule,
  ]
})
export class DonationModule { }
