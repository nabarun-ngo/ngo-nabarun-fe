import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/core/service/shared-data.service';
import { MemberService } from '../member.service';
import { UserDetail } from 'src/app/core/api/models';

@Component({
  selector: 'app-member-profile',
  templateUrl: './member-profile.component.html',
  styleUrls: ['./member-profile.component.scss']
})
export class MemberProfileComponent implements OnInit{
  member!: UserDetail;
  isSelfProfile:boolean=false;

  constructor(    
    private sharedDataService: SharedDataService,
    private route: ActivatedRoute,
    private memberService: MemberService
  ){}



  ngOnInit(): void {
    this.isSelfProfile=this.route.snapshot.data['self_profile'] as boolean;
    this.sharedDataService.setPageName(this.isSelfProfile? 'MY PROFILE':'MEMBER PROFILE');

    if (this.route.snapshot.data['ref_data']){
      let refData=this.route.snapshot.data['ref_data'];
      this.sharedDataService.setRefData('USER',refData);
      console.log(refData)
    }

    if (this.route.snapshot.data['data']){
      this.member=this.route.snapshot.data['data'] as UserDetail;
    }
  }
}
