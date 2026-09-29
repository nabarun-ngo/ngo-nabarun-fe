import { BreakpointObserver } from '@angular/cdk/layout';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

/** Viewports at or below this width get the fixed mobile bottom nav. */
const MOBILE_BOTTOM_NAV_QUERY = '(max-width: 767px)';

@Component({
    selector: 'app-secured-layout',
    templateUrl: './secured-layout.component.html',
    styleUrls: [],
    standalone: false
})
export class SecuredLayoutComponent implements OnInit, OnDestroy {
  /** Sticky bottom tab bar — mobile only; desktop uses header navigation. */
  showMobileBottomNav = false;

  private readonly destroy$ = new Subject<void>();

  constructor(private breakpoints: BreakpointObserver) {}

  ngOnInit(): void {
    this.breakpoints
      .observe(MOBILE_BOTTOM_NAV_QUERY)
      .pipe(takeUntil(this.destroy$))
      .subscribe(state => {
        this.showMobileBottomNav = state.matches;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
