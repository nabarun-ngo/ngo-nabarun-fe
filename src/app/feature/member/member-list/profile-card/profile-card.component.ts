import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { RoleDto, UserDto } from 'src/app/core/api-client/models';
import { AppRoute } from 'src/app/core/constant/app-routing.const';
import { KeyValue } from '../../../../shared/model/key-value.model';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.scss']
})
export class ProfileCardComponent {

  constructor(private router: Router) { }
  route_data = AppRoute;

  @Input({ required: true })
  profile!: UserDto

  @Input()
  permissions!: { canUpdateUser: boolean; }

  @Input()
  options?: {
    showEmail: boolean,
    hideRole: boolean,
    hideViewBtn: boolean,
    addnlBtns: KeyValue[]
  }

  @Output()
  onAddnlBtnClick: EventEmitter<{ buttonId: string, profile?: UserDto }> = new EventEmitter();


  view() {
    this.router.navigate([this.route_data.secured_member_profile_page.url, btoa(this.profile.id!)]);
  }

  roleString(roles: RoleDto[]) {
    return roles.map(r => r.roleName).join(', ')
  }

}

