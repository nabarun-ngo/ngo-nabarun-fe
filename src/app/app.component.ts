import { Component, NgZone } from '@angular/core';
import { UserIdentityService } from './core/service/user-identity.service';
import { environment } from 'src/environments/environment';
import { GoogleAuthService } from './core/service/google-auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private identityService:UserIdentityService,
    private googleService: GoogleAuthService,
   // private zone: NgZone
    ){
 
     
  }
  async ngOnInit(): Promise<void> {
    
    /**
     * Disableing logs in production
     */
    if (environment.production) {
      if(window){
        window.console.log=function(){};
      }
    }
    /**
     * Configuring oauth services
     */
    this.identityService.configure();
    await this.googleService.initialize();
    //await this.loadGapi();
    //gapi.load('client:auth2', this.initClient.bind(this));
  }


  //constructor() {}

  // initClient() {
  //   const updateSigninStatus = this.updateSigninStatus.bind(this);
  //   gapi.client
  //     .init({
  //       apiKey: 'AIzaSyDEQ5433AfdAoTOOCqjlK9K-Ep0FD8sdwg',
  //       clientId:
  //         '595475200212-gibsoge21ed013o9obcreldfpfncgops.apps.googleusercontent.com',
  //       discoveryDocs: [
  //         'https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest',
  //       ],
  //       scope: 'https://www.googleapis.com/auth/calendar.readonly',
  //       plugin_name:'nabarun_app'
        
  //     })
  //     .then(() => {
  //       this.zone.run(() => {
  //         // Listen for sign-in state changes.
  //         gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);

  //         // Handle the initial sign-in state.
  //         updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
  //       });
  //     });
  // }

  // updateSigninStatus(isSignedIn: boolean) {
  //   console.log('updateSigninStatus', isSignedIn);
  //   //this.isSignedIn = isSignedIn;
  //   if (isSignedIn) {
  //     this.listUpcomingEvents();
  //   }
  // }

  // handleAuthClick() {
  //   gapi.auth2.getAuthInstance().signIn();
  // }

  // handleSignoutClick() {
  //   gapi.auth2.getAuthInstance().signOut();
  // }

  // listUpcomingEvents() {
  //   const appendPre = this.appendPre.bind(this);
  //   gapi.client.calendar.events
  //     .list({
  //       calendarId: 'primary',
  //       timeMin: new Date().toISOString(),
  //       showDeleted: false,
  //       singleEvents: true,
  //       maxResults: 10,
  //       orderBy: 'startTime',
  //     })
  //     .then((response) => {
  //       this.zone.run(() => {
  //         const events = response.result.items!;
  //         appendPre('Upcoming events:');

  //         if (events.length > 0) {
  //           for (const event of events) {
  //             let when = event.start!.dateTime;
  //             if (!when) {
  //               when = event.start!.date;
  //             }
  //             appendPre(event.summary + ' (' + when + ')');
  //           }
  //         } else {
  //           appendPre('No upcoming events found.');
  //         }
  //       });
  //     });
  // }

  // appendPre(text: string) {
  //   //this.pre += text + '\n';
  // }

  // loadGapi() {
  //   const script = document.createElement('script');
  //   script.src = 'https://apis.google.com/js/api.js';
  //   window.document.body.appendChild(script);
  //   return new Promise<void>((resolve, reject) => {
  //     script.addEventListener('error', (error) => reject(error));
  //     script.addEventListener('load', () => resolve());
  //   });
  // }

  
}
