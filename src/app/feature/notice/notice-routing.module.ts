import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NoticeListComponent } from './notice-list/notice-list.component';
import { noticeCreateResolver, noticeRefDataResolver, noticeResolver, noticeUpdateResolver } from './notice.resolver';

const route_data = AppRoute;

const routes: Routes = [
  {
    path: route_data.secured_notice_notices_page.path,
    component: NoticeListComponent,
    resolve:{
      data:noticeResolver,
      ref_data:noticeRefDataResolver
    }
  },
  
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NoticeRoutingModule { }
