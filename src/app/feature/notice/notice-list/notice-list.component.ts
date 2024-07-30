import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Paginator } from 'src/app/core/component/paginator';
import { NoticeDefaultValue } from '../notice.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { NoticeService } from '../notice.service';
import { NoticeDetail, PaginateNoticeDetail } from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { GoogleCalendarService } from 'src/app/core/service/google-calendar.service';

@Component({
  selector: 'app-notice-list',
  templateUrl: './notice-list.component.html',
  styleUrls: ['./notice-list.component.scss']
})
export class NoticeListComponent extends Paginator implements OnInit {
  isCreateNotice: boolean = false;
  defaultValue = NoticeDefaultValue;
  noticeList!: PaginateNoticeDetail;
  // noticeListDetail!: {edit:boolean,notice:NoticeDetail}[];

  app_routes = AppRoute;
  refData: any;
  canUpdateNotice: any;
  isInactiveUser: any;

  constructor(
    private route: ActivatedRoute,
    private sharedDataService: SharedDataService,
    private noticeService: NoticeService,
    private googleCalService: GoogleCalendarService,
  ) {
    super();
    super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions);
  }


  ngOnInit() {
    this.sharedDataService.setPageName('NOTICES');

    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('NOTICE', this.refData);
      console.log(this.refData)
    }

    if (this.route.snapshot.data['data']) {
      this.noticeList = this.route.snapshot.data['data'] as PaginateNoticeDetail;
      this.itemLengthSubs.next(this.noticeList?.totalSize!);
      console.log(this.noticeList)
    }
    //await this.googleCalService.init()
  }


  override handlePageEvent($event: PageEvent): void {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.noticeService.retrieveNotices(this.pageNumber, this.pageSize).subscribe(data => {
      this.noticeList = data!;
      this.itemLengthSubs.next(data?.totalSize!);
    });
  }


  createNotice($event: { id?: string; formValue?: any; cancel?: boolean }) {
    console.log($event)
    if ($event.cancel) {
      this.isCreateNotice = false;
    } else {
      this.noticeService.createNotice($event.formValue).subscribe(data=>{
        console.log(data)
        this.isCreateNotice=false;
        this.noticeService.retrieveNotices(this.pageNumber, this.pageSize).subscribe(data => {
          this.noticeList = data!;
          this.itemLengthSubs.next(data?.totalSize!);
        });
      });
    }
  }
  editNotice($event: { id?: string; formValue?: any; cancel?: boolean }) {
    console.log($event)
    if ($event.id) {
      this.isCreateNotice = false;
    } 
  }

}
