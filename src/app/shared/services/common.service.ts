import { Injectable } from '@angular/core';
import { deleteToken, getToken, Messaging, onMessage } from '@angular/fire/messaging';
import { map, Subject } from 'rxjs';
import { DonationStatus, DonationType } from 'src/app/core/api/models';
import { CommonControllerService, UserControllerService } from 'src/app/core/api/services';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CommonService {

  constructor(
  private commonController:CommonControllerService,
  private messageing: Messaging,
) { }

  getRefData(options:{names?:any[],donationStatus?:DonationStatus,donationType?:DonationType}){
    return this.commonController.getReferenceData({
      names:options.names!,
      currentDonationStatus:options.donationStatus,
      donationType:options.donationType
    }).pipe(map(m=>m.responsePayload));
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
            this.notificationSub.next(message.data!); console.log("1");
            //this.sound.play();
          });
          new BroadcastChannel('notification_data').onmessage = (item) => {
            this.notificationSub.next(item.data); console.log("2");
            //this.sound.play();
          };
        }
        else if (notificationPermissions === "denied") {
          console.log("Denied");
        }
      });
  }

  sendToken() {
    navigator.serviceWorker.getRegistration()
      // .register("./firebase-messaging-sw.js", {
      //   type: "module",
      // })
      .then((serviceWorkerRegistration) => {
        getToken(this.messageing, {
          vapidKey: environment.firebase_vapidKey,
          serviceWorkerRegistration: serviceWorkerRegistration,
        }).then((token) => {
          console.log('my fcm token', token);
          this.commonController.manageNotification({ action: 'SAVE_TOKEN', body: { 'token': token } }).subscribe()
        });
      });
  }


  deleteToken() {
    deleteToken(this.messageing);
  }

  fetchNotification() {
    return this.commonController.getNotification({ pageIndex: 0, pageSize: 10 }).pipe(map(m => m.responsePayload))
  }

 

}