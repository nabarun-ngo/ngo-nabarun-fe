import { Component, Input } from '@angular/core';
import { UserDetail } from 'src/app/core/api/models';

@Component({
  selector: 'app-profile-view',
  templateUrl: './profile-view.component.html',
  styleUrls: ['./profile-view.component.scss']
})
export class ProfileViewComponent {

  @Input({required:true,alias:'profile'})
  myProfile!:UserDetail;
isInactiveUser: any;

}
