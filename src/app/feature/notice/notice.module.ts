import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NoticeRoutingModule } from './notice-routing.module';
import { SharedModule } from 'src/app/shared/shared.module';
import { NoticeListComponent } from './notice-list/notice-list.component';
import { NoticeCreateOrUpdateComponent } from './notice-create-or-update/notice-create-or-update.component';


@NgModule({
  declarations: [
    NoticeListComponent,
    NoticeCreateOrUpdateComponent
  ],
  imports: [
    CommonModule,
    NoticeRoutingModule,
    SharedModule
  ]
})
export class NoticeModule { }
