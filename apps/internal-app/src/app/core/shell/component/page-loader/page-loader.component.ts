import { Component } from '@angular/core';

/**
 * Full-viewport spinner used only for route-scoped HTTP (resolvers / navigation).
 * Do not reuse for in-component loading — those stay local and non-blocking.
 */
@Component({
  selector: 'app-loader',
  template: `
    <div class="route-loader" role="status" aria-live="polite" aria-busy="true">
      <mat-spinner class="route-loader__spinner" diameter="48" strokeWidth="4"></mat-spinner>
    </div>
  `,
  styles: [
    `
      .route-loader {
        position: fixed;
        inset: 0;
        z-index: 2000;
        display: flex;
        align-items: center;
        justify-content: center;
        background: color-mix(in srgb, var(--surface-0, #fff) 72%, transparent);
        pointer-events: all;
      }

      .route-loader__spinner {
        --mdc-circular-progress-active-indicator-color: var(--primary-500, #f97316);
      }
    `,
  ],
  standalone: false,
})
export class PageLoaderComponent {}
