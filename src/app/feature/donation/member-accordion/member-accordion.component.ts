import { Component, Input } from '@angular/core';
import { MemberList } from '../donation.model';
import { UserDetail } from 'src/app/core/api/models';
import { DonationService } from '../donation.service';
import { PageEvent } from '@angular/material/paginator';
import { DonationDefaultValue } from '../donation.const';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-member-accordion',
  templateUrl: './member-accordion.component.html',
  styleUrls: ['./member-accordion.component.scss']
})
export class MemberAccordionComponent {


  @Input() members!: MemberList[];

  constructor(private donationService:DonationService){}
  defaultValue=DonationDefaultValue;

  accordionOpened(member: UserDetail) {
    this.fetchDonations(member.id!,this.defaultValue.pageNumber,this.defaultValue.pageSize);
  }

  handlePageEvent(member: UserDetail,$event: PageEvent) {
    this.fetchDonations(member.id!,$event.pageIndex,$event.pageSize);
  }
  private fetchDonations(id:string,index:number,size:number){
    this.donationService.fetchUserDonations(id,index,size).subscribe(data=>{
      this.members.filter(f=>f.member?.id == id).map(item => {
        item.donations=[];
        data.donations?.content?.forEach(don=>item.donations?.push({donation:don,action:'view',eventSubject:new Subject<any>()}))
        item.index=data.donations?.pageIndex!;
        item.size=data.donations?.pageSize!;
        item.total=data.donations?.totalSize!;
        item.donationSummary = data.summary;
        console.log(item)
        return item;
     });
    })
  }

  
}
