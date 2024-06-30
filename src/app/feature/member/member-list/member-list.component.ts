import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MemberService } from '../member.service';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { PaginateUserDetail } from 'src/app/core/api/models';
import { MemberDefaultValue } from '../member.const';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Observable } from 'rxjs';
import { Paginator } from 'src/app/core/component/paginator';

@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.scss']
})
export class MemberListComponent extends Paginator implements OnInit{
  memberList!: PaginateUserDetail;

  constructor(    
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private memberService: MemberService
  ){
    super();
    super.init(MemberDefaultValue.pageNumber, MemberDefaultValue.pageSize,MemberDefaultValue.pageSizeOptions)
  }



  ngOnInit(): void {
    this.sharedDataService.setPageName('MEMBERS');

    if (this.route.snapshot.data['ref_data']){
      let refData=this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('USER',refData);
      console.log(refData)
    }

    if (this.route.snapshot.data['data']){
      this.memberList=this.route.snapshot.data['data'] as PaginateUserDetail;
      this.itemLengthSubs.next(this.memberList?.totalSize!);
      console.log(this.memberList)
    }
  }

  handlePageEvent($event: PageEvent) {
    this.pageNumber = $event.pageIndex;
    this.pageSize = $event.pageSize;
    this.memberService.fetchMembers(this.pageNumber, this.pageSize).subscribe(data=>{
      this.memberList=data!;
      this.itemLengthSubs.next(data?.totalSize!);
    });
    
  }

}
