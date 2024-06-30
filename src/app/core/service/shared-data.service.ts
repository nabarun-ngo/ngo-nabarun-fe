import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KeyValue } from '../api/models';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor() { }
  private pageNameSource = new BehaviorSubject("Welcome");
  pageName = this.pageNameSource.asObservable();

  private isAuthenticatedSource = new BehaviorSubject(false);
  isAuthenticated = this.isAuthenticatedSource.asObservable();

  private refDataMap: Map<string, {
    [key: string]: KeyValue[];
  }> = new Map();

  setPageName(param: string) { this.pageNameSource.next(param) }
  setAuthenticated(param: boolean) { this.isAuthenticatedSource.next(param) }

  setRefData(name: string, data: {
    [key: string]: KeyValue[];
  }) { this.refDataMap.set(name, data) }
  getRefData(name: string) { return this.refDataMap.get(name) }
}
