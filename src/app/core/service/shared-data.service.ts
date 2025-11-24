import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KeyValue as KeyValue2 } from '../api/models';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {

  constructor() { }
  private pageNameSource = new BehaviorSubject("Welcome");
  pageName = this.pageNameSource.asObservable();

  //private isAuthenticatedSource = new BehaviorSubject(false);
  //isAuthenticated = this.isAuthenticatedSource.asObservable();

  private refDataMap: Map<string, {
    [key: string]:  KeyValue2[] ;
  }> = new Map();

  setPageName(param: string) { this.pageNameSource.next(param) }
  //setAuthenticated(param: boolean) { this.isAuthenticatedSource.next(param) }

  setRefData(name: string, data: {
    [key: string]: KeyValue2[];
  }) { this.refDataMap.set(name, data) }
  getRefData(name: string) { return this.refDataMap.get(name) }

  private searchValueSource = new BehaviorSubject('');
  searchValue = this.searchValueSource.asObservable();
  setSearchValue(value: string) { this.searchValueSource.next(value) }

}
