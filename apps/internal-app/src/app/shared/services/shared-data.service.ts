import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KeyValue } from 'src/app/shared/models/key-value.model';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor() { }
  private pageNameSource = new BehaviorSubject("Welcome");
  readonly pageName = this.pageNameSource.asObservable();

  private refDataMap: Map<string, {
    [key: string]: KeyValue[];
  }> = new Map();

  setPageName(param: string) { this.pageNameSource.next(param) }

  setRefData(name: string, data: {
    [key: string]: KeyValue[];
  }) { this.refDataMap.set(name, data) }

  private notificationRefreshSource = new BehaviorSubject(false);
  readonly notificationRefresh = this.notificationRefreshSource.asObservable();
  setNotificationRefresh(value: boolean) { this.notificationRefreshSource.next(value) }

}
