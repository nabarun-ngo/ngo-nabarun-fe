import { Component, Input } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Observable } from 'rxjs';

export abstract class Paginator {

  protected pageNumber: number = 0;
  protected pageSize: number = 20;
  protected pageSizeOptions: number[] =[10,20,50,100];
  protected itemLengthSubs: BehaviorSubject<number> = new BehaviorSubject(0);
  protected itemLength$: Observable<number> = this.itemLengthSubs.asObservable();

  protected init(pageNumber: number,pageSize: number,pageSizeOptions: number[]){
    this.pageNumber=pageNumber;
    this.pageSize=pageSize;
    this.pageSizeOptions=pageSizeOptions;
  }
  abstract handlePageEvent($event: PageEvent):void;
}
