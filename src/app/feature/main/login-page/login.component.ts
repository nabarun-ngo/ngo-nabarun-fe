import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SharedDataService } from '../../../core/service/shared-data.service';
import { takeWhile } from 'rxjs';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit,AfterViewInit {
  isAuthenticated: boolean = false;
  isCodeError: boolean = false;
  codeErrorDescription!: string;
  env=environment.name;
  constructor(
    private identityService: UserIdentityService,
    private location: Location,
    private sharedDataService: SharedDataService,
  ) {
  
  }
  ngAfterViewInit(): void {
    let el = document.getElementById('resetpassword');
    console.log(el)
    el?.addEventListener('click',(e:Event)=>{
      let stateData=this.location.getState() as {state:string};
      console.log(stateData)
      window.location.href = environment.auth_config.issuer+'u/reset-password/request/Username-Password-Authentication?state='+stateData.state
    })
  }
  ngOnInit(): void {

    this.sharedDataService.setAuthenticated(this.identityService.isUserLoggedIn());
    let stateData=this.location.getState() as {isError:boolean;description:string}
    console.log(stateData)
    if(stateData && stateData.isError){
      this.isCodeError = true;
      this.codeErrorDescription = stateData.description;
    }

   
  }

  loginWithPassword() {
    if (this.isCodeError) {
      this.identityService.loginWith('password', 'login');
    } else {
      this.identityService.loginWith('password');
    }
  }

  loginWithoutPassword() {
    if (this.isCodeError) {
      this.identityService.loginWith('email', 'login');
    } else {
      this.identityService.loginWith('email');
    }
  }
}
