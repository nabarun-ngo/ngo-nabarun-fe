import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { NoticeListComponent } from './notice-list/notice-list.component';
import { noticeCreateResolver, noticeRefDataResolver, noticeResolver, noticeUpdateResolver } from './notice.resolver';
import { NoticeCreateOrUpdateComponent } from './notice-create-or-update/notice-create-or-update.component';

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
  {
    path: route_data.secured_notice_create_page.path,
    component: NoticeCreateOrUpdateComponent,
    resolve:{
      data:noticeCreateResolver,
      ref_data:noticeRefDataResolver
    }
  },
  {
    path: route_data.secured_notice_update_page.path,
    component: NoticeCreateOrUpdateComponent,
    resolve:{
      data:noticeUpdateResolver,
      ref_data:noticeRefDataResolver
    }
  },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NoticeRoutingModule { }
