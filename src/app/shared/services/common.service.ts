import { Injectable } from '@angular/core';
import { deleteToken, getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { SpinnerVisibilityService } from 'ng-http-loader';
import { filter, map, Observable, shareReplay, Subject, tap } from 'rxjs';
import { DonationStatus, DonationType, ImportantLinks, KeyValue, RefDataType, RequestType } from 'src/app/core/api/models';
import { CommonControllerService, UserControllerService } from 'src/app/core/api/services';
import { UserIdentityService } from 'src/app/core/service/user-identity.service';
import { environment } from 'src/environments/environment';
import { runInThisContext } from 'vm';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
  
  cachedObservable!: Observable<{
    [key: string]: KeyValue[];
  }>;

  constructor(
    private commonController: CommonControllerService,
    private messageing: Messaging,
    private userDetail: UserIdentityService
  ) { }

  getRefData(names?: RefDataType[], options?: {
    donationStatus?: DonationStatus,
    donationType?: DonationType,
    countryCode?:string,
    stateCode?:string,
    workflowType?:RequestType
  }) {
    if (options) {
      return this.commonController.getReferenceData({
        names: names!,
        currentDonationStatus: options.donationStatus,
        donationType: options.donationType,
        countryCode: options.countryCode,
        stateCode:options.stateCode,
        workflowType:options.workflowType
      }).pipe(map(m => m.responsePayload));
    }
    if (!this.cachedObservable) {
      this.cachedObservable = this.commonController.getReferenceData().pipe(
        map(m => m.responsePayload!),
        shareReplay(1) // Share the response with all subscribers
      );
    }
    return this.cachedObservable;

  }




  private notificationSub = new Subject<{ [key: string]: string; }>();
  liveNotifications$ = this.notificationSub.asObservable();
  // sound = new Howl({
  //   src: ['/assets/microsoft_teams.mp3']
  // });



  requestPermission() {
    Notification.requestPermission().then(
      (notificationPermissions: NotificationPermission) => {
        if (notificationPermissions === "granted") {
          console.log("Granted");
          this.sendToken();
          onMessage(this.messageing, (message) => {
            this.notificationSub.next(message.data!);
            //console.log("1",message.data);
            //this.sound.play();
          });
          new BroadcastChannel('notification_data').onmessage = (item) => {
            this.notificationSub.next(item.data);
            //console.log("2",item.data);
            //this.sound.play();
          };
        }
        else if (notificationPermissions === "denied") {
          console.log("Denied");
        }
      });
  }

  sendToken() {
    navigator.serviceWorker
      //.getRegistration()
      .register(environment.production ? "./firebase-messaging-sw-prod.js" : "./firebase-messaging-sw.js", {
        type: "module",
      })
      .then((serviceWorkerRegistration) => {

        getToken(this.messageing, {
          vapidKey: environment.firebase_vapidKey,
          serviceWorkerRegistration: serviceWorkerRegistration,
        }).then(async (token) => {
          console.log('fcm token', token);
          this.commonController.manageNotification({ action: 'SAVE_TOKEN_AND_GET_COUNTS', body: { 'token': token, 'profile_id': (await this.userDetail.getUser()).profile_id } }).subscribe(s => {

          })
        });
      });
  }


  deleteToken() {
    deleteToken(this.messageing);
  }

  fetchNotification() {
    return this.commonController.getNotification({ pageIndex: 0, pageSize: 5 }).pipe(map(m => m.responsePayload))
  }

  getUsefulLink(){
  return this.commonController.getUsefulLinks().pipe(map(m => m.responsePayload));
  }

}
