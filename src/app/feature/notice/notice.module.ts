import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NoticeRoutingModule } from './notice-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NoticeListComponent } from './notice-list/notice-list.component';
import { NoticeCardComponent } from './notice-card/notice-card.component';


@NgModule({
  declarations: [
    NoticeListComponent,
    NoticeCardComponent,
  ],
  imports: [
    CommonModule,
    NoticeRoutingModule,
    SharedModule
  ]
})
export class NoticeModule { }
