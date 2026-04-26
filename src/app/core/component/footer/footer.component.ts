import { Component } from '@angular/core';
import { UserIdentityService } from '../../service/user-identity.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  today: number = Date.now();
  env: string = environment.name;
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
