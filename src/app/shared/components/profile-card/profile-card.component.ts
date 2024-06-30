import { Component, Input } from '@angular/core';
import { UserDetail } from 'src/app/core/api/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {

  route_data =AppRoute; 

  @Input({required:true})
  profile!:UserDetail

}
