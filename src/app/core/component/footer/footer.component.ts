import { Component } from '@angular/core';
import { UserIdentityService } from '../../service/user-identity.service';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  today: number = Date.now();
  //authenticated : boolean;
  constructor(
    //private userIdentity:UserIdentityService
    ){
    //this.authenticated= this.userIdentity.isUserLoggedIn();
  }

  // year():Number{
  //   return new Date(). getFullYear();
  // }
}
