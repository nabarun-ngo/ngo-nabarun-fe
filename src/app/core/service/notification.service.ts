import { Injectable } from '@angular/core';
import { Messaging, deleteToken, getToken, onMessage } from '@angular/fire/messaging';
import { BehaviorSubject, Observable, Subject, Subscriber, map, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommonControllerService } from '../api/services';
import { AppNotification } from '../model/notification.model';
import { Howl, Howler } from 'howler';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSub = new Subject<{ [key: string]: string; }>();
  liveNotifications$ = this.notificationSub.asObservable();
  sound = new Howl({
    src: ['/assets/microsoft_teams.mp3']
  });

  constructor(
    private messageing: Messaging,
    private commonController: CommonControllerService,
  ) {

  }

  requestPermission() {
    Notification.requestPermission().then(
      (notificationPermissions: NotificationPermission) => {
        if (notificationPermissions === "granted") {
          console.log("Granted");
          this.sendToken();
          onMessage(this.messageing, (message) => {
            this.notificationSub.next(message.data!); console.log("1");
            this.sound.play();
          });
          new BroadcastChannel('notification_data').onmessage = (item) => {
            this.notificationSub.next(item.data); console.log("2");
            this.sound.play();
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


