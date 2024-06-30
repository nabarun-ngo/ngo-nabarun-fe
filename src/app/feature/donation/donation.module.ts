import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DonationRoutingModule } from './donation-routing.module';
import { DonationDashboardComponent } from './donation-dashboard/donation-dashboard.component';
import { SharedModule } from 'src/app/shared/shared.module';
import { DonationAccordionComponent } from './donation-accordion/donation-accordion.component';
import { QRCodeModule } from 'angularx-qrcode';
import { MemberAccordionComponent } from './member-accordion/member-accordion.component';


@NgModule({
  declarations: [
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
