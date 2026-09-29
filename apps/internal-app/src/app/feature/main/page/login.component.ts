import { AfterViewInit, Component, DestroyRef, Inject, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { IUserIdentityService } from 'src/app/core/auth/tokens/user-identity.token';
import { PwaInstallService } from 'src/app/core/pwa/pwa-install.service';
import { SharedDataService } from '../../../shared/services/shared-data.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    standalone: false
})
export class LoginComponent implements OnInit, AfterViewInit {
  isAuthenticated: boolean = false;
  isCodeError: boolean = false;
  codeErrorDescription!: string;
  env = environment.name;
  showInstallButton: boolean = false;
  showManualInstallSteps: boolean = false;

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    @Inject(IUserIdentityService) private identityService: IUserIdentityService,
    private location: Location,
    private sharedDataService: SharedDataService,
    private pwaInstall: PwaInstallService,
  ) {

  }

  get needsManualInstall(): boolean {
    return this.pwaInstall.requiresManualSteps;
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

    this.pwaInstall.installable$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((installable) => {
        this.showInstallButton = installable;
        if (!installable) {
          this.showManualInstallSteps = false;
        }
      });
  }

  async installPWA() {
    const outcome = await this.pwaInstall.promptInstall();
    this.showManualInstallSteps = outcome === 'manual' ? !this.showManualInstallSteps : false;
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
