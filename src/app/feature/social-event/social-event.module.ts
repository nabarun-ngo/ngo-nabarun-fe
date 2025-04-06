import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocialEventRoutingModule } from './social-event-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { SocialEventListComponent } from './social-event-list/social-event-list.component';


@NgModule({
  declarations: [SocialEventListComponent],
  imports: [
    CommonModule,
    SocialEventRoutingModule,
    SharedModule
  ]
})
export class SocialEventModule { }
