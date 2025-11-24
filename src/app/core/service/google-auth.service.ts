import { Injectable, NgZone } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  isSignedIn: boolean=false;


  constructor(protected zone: NgZone) {}

  private initClient() {
    //const updateSigninStatus = this.updateSigninStatus.bind(this);
    // gapi.client
    //   .init(environment.gapi_config)
    //   .then(() => {
    //     this.zone.run(() => {
    //       // Listen for sign-in state changes.
    //       gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

    //       // Handle the initial sign-in state.
    //       updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    //     });
    //   });
  }

  updateSigninStatus(isSignedIn: boolean) {
    console.log('updateSigninStatus', isSignedIn);
    this.isSignedIn = isSignedIn;
  }

  signInToGoogle() {
    return gapi.auth2.getAuthInstance().signIn();
  }

  signOutToGoogle() {
    gapi.auth2.getAuthInstance().signOut();
  }

  

  private loadGapi() {
    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    window.document.body.appendChild(script);
    return new Promise<void>((resolve, reject) => {
      script.addEventListener('error', (error) => reject(error));
      script.addEventListener('load', () => resolve());
    });
  }

  async initialize() {
    console.log('Hellociation')
    await this.loadGapi();
    //gapi.load('client:auth2', this.initClient.bind(this));
  }
}
