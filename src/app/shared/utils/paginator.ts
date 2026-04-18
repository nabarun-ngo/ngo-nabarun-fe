import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  template: 'app-base-paginator',
})
export abstract class Paginator {

  private _pageEvent: PageEvent | undefined;

  public get pageNumber(): number {
    return this.paginationConfig.pageNumber;
  }
  public get pageSize(): number {
    return this.paginationConfig.pageSize;
  }
  public get pageSizeOptions(): number[] {
    return this.paginationConfig.pageSizeOptions;
  }
  public get pageEvent(): PageEvent | undefined {
    return this._pageEvent;
  }
  public set pageEvent($event: PageEvent | undefined) {
    this._pageEvent = $event;
    if ($event) {
      this.paginationConfig.pageNumber = $event.pageIndex;
      this.paginationConfig.pageSize = $event.pageSize;
      this.totalItemLength = $event.length;
    }
  }

  public set totalItemLength(totalSize: number) {
    this.itemLengthSubs.next(totalSize);
  }

  private itemLengthSubs: BehaviorSubject<number> = new BehaviorSubject(0);
  public itemLength$: Observable<number> = this.itemLengthSubs.asObservable();
  protected abstract get paginationConfig(): { pageNumber: number, pageSize: number, pageSizeOptions: number[] };


  abstract handlePageEvent($event: PageEvent): void;
}
