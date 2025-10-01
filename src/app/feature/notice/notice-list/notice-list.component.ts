import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { Paginator } from 'src/app/shared/utils/paginator';
import { NoticeDefaultValue } from '../notice.const';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { NoticeService } from '../notice.service';
import { NoticeDetail, PaginateNoticeDetail } from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { GoogleCalendarService } from 'src/app/core/service/google-calendar.service';
import { SearchAndAdvancedSearchModel } from 'src/app/shared/model/search-and-advanced-search.model';
import { NavigationButtonModel } from 'src/app/shared/components/generic/page-navigation-buttons/page-navigation-buttons.component';

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
  searchInputData!: SearchAndAdvancedSearchModel;
  searchValue!: string;
  navigations: NavigationButtonModel[] = [
    {
      displayName: 'Back to Dashboard',
      routerLink: AppRoute.secured_dashboard_page.url
    }
  ];
  constructor(
    private route: ActivatedRoute,
    private sharedDataService: SharedDataService,
    private noticeService: NoticeService,
  ) {
    super();
    super.init(this.defaultValue.pageNumber, this.defaultValue.pageSize, this.defaultValue.pageSizeOptions);
  }


  ngOnInit() {
    this.sharedDataService.setPageName('NOTICES');

    if (this.route.snapshot.data['ref_data']) {
      this.refData = this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('NOTICE', this.refData);
    }

    if (this.route.snapshot.data['data']) {
      this.noticeList = this.route.snapshot.data['data'] as PaginateNoticeDetail;
      this.itemLengthSubs.next(this.noticeList?.totalSize!);
      console.log(this.noticeList)
    }
    //await this.googleCalService.init()
    this.searchInputData={
      normalSearchPlaceHolder: 'Search Notice Number, Notice Title, Notice Description',
      advancedSearch: {
        searchFormFields: [
          {
            formControlName:'noticeNumber',
            inputModel:{
              tagName:'input',
              inputType:'text',
              html_id:'noticeNumber',
              labelName:'Notice Number',
              placeholder:'Enter Notice Number'
            },
          },
          {
            formControlName:'noticeTitle',
            inputModel:{
              tagName:'input',
              inputType:'text',
              html_id:'noticeTitle',
              labelName:'Notice Title',
              placeholder:'Enter Notice Title',
            },
          },
          {
            formControlName:'startDate',
            inputModel:{
              tagName:'input',
              inputType:'date',
              html_id:'startDate',
              labelName:'From Date',
              placeholder:'Enter From Date',
            },
          },
          {
            formControlName:'endDate',
            inputModel:{
              tagName:'input',
              inputType:'date',
              html_id:'endDate',
              labelName:'To Date',
              placeholder:'Enter To Date',
            },
          },
          {
            formControlName:'status',
            inputModel:{
              tagName:'select',
              inputType:'multiselect',
              html_id:'role',
              labelName:'Role',
              placeholder:'Select Role',
              selectList: [{key:'ACTIVE',displayValue:'Active'},{key:'DRAFT',displayValue:'Draft'}]
            },
          }
        ]
      }
    };
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


  onSearch($event: { advancedSearch: boolean; reset: boolean; value: any; }) {
    if($event.advancedSearch && !$event.reset ){
     // console.log($event.value)
      this.noticeService.advancedSearch({
        noticeTitle:$event.value.noticeTitle,
        noticeNumber:$event.value.noticeNumber,
        status:$event.value.status,
        startDate:$event.value.startDate,
        endDate: $event.value.endDate
      }).subscribe(data=>this.noticeList=data!)
    }
    else if($event.advancedSearch && $event.reset ){
      this.noticeService.retrieveNotices(this.pageNumber, this.pageSize).subscribe(data => {
        this.noticeList = data!;
        this.itemLengthSubs.next(data?.totalSize!);
      });
    }
    else{
      this.searchValue=$event.value as string;
    }
  }

}
