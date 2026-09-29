import { Injectable } from '@angular/core';
import {
  NavigationCancel,
  NavigationEnd,
  NavigationError,
  NavigationStart,
  Router,
} from '@angular/router';
import { BehaviorSubject, Observable, of, timer } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';

/**
 * Tracks HttpClient traffic that runs while a route transition is in flight
 * (guards / resolvers / lazy-load side effects). Component-level requests after
 * NavigationEnd are ignored so they never block the UI with a full-page spinner.
 */
@Injectable({ providedIn: 'root' })
export class RouteHttpBusyService {
  private navigating = false;
  private pending = 0;
  private readonly rawBusy$ = new BehaviorSubject(false);

  /**
   * True only when navigation is active and at least one tracked HTTP call is open.
   * Short flashes are suppressed (~120ms) so fast routes do not flicker.
   */
  readonly busy$: Observable<boolean> = this.rawBusy$.pipe(
    switchMap(busy => (busy ? timer(120).pipe(map(() => true)) : of(false))),
    distinctUntilChanged(),
  );

  constructor(router: Router) {
    router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.navigating = true;
        this.emit();
        return;
      }
      if (
        event instanceof NavigationEnd ||
        event instanceof NavigationCancel ||
        event instanceof NavigationError
      ) {
        this.navigating = false;
        this.pending = 0;
        this.emit();
      }
    });
  }

  /** @returns whether this request is counted toward the route spinner */
  beginRequest(): boolean {
    if (!this.navigating) {
      return false;
    }
    this.pending += 1;
    this.emit();
    return true;
  }

  endRequest(tracked: boolean): void {
    if (!tracked) {
      return;
    }
    this.pending = Math.max(0, this.pending - 1);
    this.emit();
  }

  private emit(): void {
    this.rawBusy$.next(this.navigating && this.pending > 0);
  }
}
