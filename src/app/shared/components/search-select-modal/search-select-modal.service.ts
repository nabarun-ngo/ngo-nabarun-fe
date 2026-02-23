import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ModalService } from 'src/app/core/service/modal.service';
import { SearchEvent } from '../search-and-advanced-search-form/search-event.model';
import { SearchSelectModalComponent, SearchSelectModalConfig } from './search-select-modal.component';

/**
 * Calculates the dialog **width** automatically from the number of visible fields.
 *
 * Width mirrors the CSS grid columns used by SearchAndAdvancedSearchFormComponent:
 *   1 visible field   → 1 column  → 440 px
 *   2 visible fields  → 2 columns → 680 px
 *   3+ visible fields → 3 columns → 900 px
 *
 * Height is intentionally NOT set — MatDialog will shrink-wrap to the content
 * height automatically, which prevents any scrollbar from appearing.
 */
function autoWidth(config: SearchSelectModalConfig): number {
    const visible = config.searchFormFields.filter(f => !f.hidden).length || 1;

    // Mirrors the sm/lg CSS grid breakpoints in SearchAndAdvancedSearchFormComponent
    const cols = visible === 1 ? 1 : visible <= 2 ? 2 : 3;

    const WIDTH_BY_COLS: Record<number, number> = { 1: 440, 2: 680, 3: 900 };
    return WIDTH_BY_COLS[cols];
}

@Injectable({ providedIn: 'any' })
export class SearchSelectModalService {

    constructor(private modalService: ModalService) { }

    /**
     * Opens a `SearchSelectModalComponent` dialog and returns an Observable that:
     *
     * | Scenario | Behaviour |
     * |---|---|
     * | User closes / cancels | Observable **completes** (no emission) |
     * | User submits (no `apiCall`) | Emits `SearchEvent`, closes modal, completes |
     * | User submits (with `apiCall`) | Runs the API, emits `SearchEvent` with `{ formValue, result }`, closes modal, completes |
     * | `apiCall` errors | Does **not** emit; modal stays open so the user can retry |
     *
     * ### Usage
     * ```ts
     * this.searchSelectModalService.open(config).subscribe(event => {
     *   // handle event.value — modal is already closed at this point
     * });
     * ```
     *
     * @param config  Field definitions, title, button labels and optional API call.
     * @param dimensions  Optional dialog size overrides.
     */
    open(
        config: SearchSelectModalConfig,
        dimensions?: { height?: number; width?: number; disableClose?: boolean }
    ): Observable<SearchEvent> {
        const result$ = new Subject<SearchEvent>();
        const modal = this.modalService.openComponentDialog(
            SearchSelectModalComponent,
            config,
            {
                // Height is never set by default — MatDialog sizes to content,
                // which guarantees no scrollbar. Pass dimensions.height to override.
                height: dimensions?.height,
                width: dimensions?.width ?? autoWidth(config),
                disableClose: dimensions?.disableClose ?? true,
            }
        );

        const sub = modal.componentInstance.onSearch.subscribe((event: SearchEvent) => {
            // ── Close / Cancel ───────────────────────────────────────────────────
            if (event.reset) {
                // Component already closed the dialog; just complete the Observable.
                result$.complete();
                modal.close();
                return;
            }

            // ── No apiCall: emit and close immediately ───────────────────────────
            if (!config.apiCall) {
                result$.next(event);
                modal.close();
                result$.complete();
                return;
            }

            // ── apiCall path ─────────────────────────────────────────────────────
            // Temporarily disable the submit button while the API is in-flight.
            modal.componentInstance.setSubmitting(true);

            config
                .apiCall(event.value)
                .pipe(finalize(() => modal.componentInstance.setSubmitting(false)))
                .subscribe({
                    next: (result) => {
                        const enrichedEvent: SearchEvent = {
                            ...event,
                            value: { formValue: event.value, result },
                        };
                        result$.next(enrichedEvent);
                        modal.close();
                        result$.complete();
                    },
                    error: () => {
                        // Keep modal open so the user can retry; result$ stays alive.
                    },
                });
        });

        // Guard: if the dialog is closed externally (e.g. Escape), clean up.
        modal.afterClosed().subscribe(() => {
            sub.unsubscribe();
            if (!result$.closed) {
                result$.complete();
            }
        });

        return result$.asObservable();
    }
}
