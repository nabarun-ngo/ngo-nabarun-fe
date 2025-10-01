import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { KeyValue, UserDetail } from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {

  constructor(private router: Router) { }
  route_data =AppRoute; 

  @Input({required:true})
  profile!:UserDetail

  @Input()
  options!:{
    showEmail:boolean,
    hideRole:boolean,
    hideViewBtn:boolean,
    addnlBtns:KeyValue[]
  }

  @Output()
  onAddnlBtnClick:EventEmitter<{buttonId:string,profile?:UserDetail}> = new EventEmitter();


  view() {
    this.router.navigate([this.route_data.secured_member_profile_page.url,btoa(this.profile.id!)]);
}

}
