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
  
}


