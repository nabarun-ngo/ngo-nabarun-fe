import { Injectable, OnDestroy } from '@angular/core';
import { fromEvent, merge, Observable, Subject, timer } from 'rxjs';
import { map, startWith, switchMap, takeUntil } from 'rxjs/operators';

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'wheel'];

@Injectable({ providedIn: 'root' })
export class IdleTimeoutService implements OnDestroy {
  private readonly destroy$ = new Subject<void>();

  /**
   * Emits true once the user has been inactive for `timeoutInSeconds`.
   * The countdown restarts on any user interaction.
   */
  startWatching(timeoutInSeconds: number): Observable<boolean> {
    const activity$ = merge(
      ...ACTIVITY_EVENTS.map(eventName => fromEvent(document, eventName, { passive: true }))
    );

    return activity$.pipe(
      startWith(null),
      switchMap(() => timer(timeoutInSeconds * 1000).pipe(map(() => true))),
      takeUntil(this.destroy$)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
