import { Component, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  template: 'app-base-paginator',
})
export abstract class Paginator {

  protected get pageNumber(): number {
    return this.paginationConfig.pageNumber;
  }
  protected get pageSize(): number {
    return this.paginationConfig.pageSize;
  }
  protected get pageSizeOptions(): number[] {
    return this.paginationConfig.pageSizeOptions;
  }
  protected set pageEvent($event: PageEvent) {
    this.paginationConfig.pageNumber = $event.pageIndex;
    this.paginationConfig.pageSize = $event.pageSize;
    this.totalItemLength = $event.length;
  }

  protected set totalItemLength(totalSize: number) {
    this.itemLengthSubs.next(totalSize);
  }

  private itemLengthSubs: BehaviorSubject<number> = new BehaviorSubject(0);
  protected itemLength$: Observable<number> = this.itemLengthSubs.asObservable();
  protected abstract get paginationConfig(): { pageNumber: number, pageSize: number, pageSizeOptions: number[] };


  abstract handlePageEvent($event: PageEvent): void;
}
