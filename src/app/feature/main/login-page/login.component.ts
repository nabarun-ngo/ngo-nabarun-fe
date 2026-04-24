import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { SharedDataService } from '../../../core/service/shared-data.service';
import { takeWhile } from 'rxjs';
import { Location } from '@angular/common';
import { Capacitor } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { DomSanitizer } from '@angular/platform-browser';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  isAuthenticated: boolean = false;
  isCodeError: boolean = false;
  codeErrorDescription!: string;
  env = environment.name;
  deferredPrompt: BeforeInstallPromptEvent | null = null;
  showInstallButton: boolean = false;
  isAndroid: boolean = false;
  playStoreUrl = `https://play.google.com/store/apps/details?id=${environment.mobile_auth_config.appId}`;
  constructor(
    private identityService: UserIdentityService,
    private location: Location,
    private sharedDataService: SharedDataService,
  ) {

  }
  ngAfterViewInit(): void {
    let el = document.getElementById('resetpassword');
    ////console.log(el)
    el?.addEventListener('click', (e: Event) => {
      let stateData = this.location.getState() as { state: string };
      ////console.log(stateData)
      //window.location.href = environment.auth_config.issuer+'u/reset-password/request/Username-Password-Authentication?state='+stateData.state
    })
  }
  ngOnInit(): void {

    //this.sharedDataService.setAuthenticated(await this.identityService.isUserLoggedIn());
    let stateData = this.location.getState() as { isError: boolean; description: string }
    ////console.log('state data',stateData)
    if (stateData && stateData.isError) {
      this.isCodeError = true;
      this.codeErrorDescription = stateData.description;
    }

    if (Capacitor.isNativePlatform()) {
      return;
    }

    this.isAndroid = /Android/i.test(window.navigator.userAgent);

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e as BeforeInstallPromptEvent;
      this.showInstallButton = true;
    });
  }

  async installPWA() {
    if (!this.deferredPrompt) return;
    this.deferredPrompt.prompt();
    const { outcome } = await this.deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      this.showInstallButton = false;
    }
    this.deferredPrompt = null;
  }

  loginWithPassword() {
    let stateData = this.location.getState() as { redirect_to: string };
    let redirect_to = stateData && stateData.redirect_to ? stateData.redirect_to : undefined;

    if (this.isCodeError) {
      this.identityService.loginWith('password', 'login', redirect_to);
    } else {
      this.identityService.loginWith('password', undefined, redirect_to);
    }
  }

  loginWithoutPassword() {
    let stateData = this.location.getState() as { redirect_to: string };
    let redirect_to = stateData && stateData.redirect_to ? stateData.redirect_to : undefined;
    if (this.isCodeError) {
      this.identityService.loginWith('email', 'login', redirect_to);
    } else {
      this.identityService.loginWith('email', undefined, redirect_to);
    }
  }
}
