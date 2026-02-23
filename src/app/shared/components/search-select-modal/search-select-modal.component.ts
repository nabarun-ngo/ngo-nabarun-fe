import {
    Component,
    EventEmitter,
    Inject,
    Output,
} from '@angular/core';
import { ValidatorFn } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { UniversalInputModel } from '../../model/universal-input.model';
import { SearchAndAdvancedSearchModel } from '../../model/search-and-advanced-search.model';
import { SearchEvent } from '../search-and-advanced-search-form/search-event.model';

// ─── Public types ─────────────────────────────────────────────────────────────

/** A single form field definition supplied by the caller. */
export interface SearchSelectField {
    /** Reactive form control name */
    formControlName: string;
    /** Model passed to <app-universal-input> — supports select, autocomplete, text, … */
    inputModel: UniversalInputModel;
    /** Optional Angular validators */
    validations?: ValidatorFn[];
    /** Hide the field from the rendered form */
    hidden?: boolean;
}

/**
 * Configuration for the modal.
 * Pass this as `data` when calling `SearchSelectModalService.open(config)`.
 *
 * @example
 * ```ts
 * // Simple — no API call
 * const config: SearchSelectModalConfig = {
 *   title: 'Select Member',
 *   buttonText: { search: 'Select', close: 'Close' },
 *   searchFormFields: [{
 *     formControlName: 'userId',
 *     inputModel: {
 *       html_id: 'user_search', tagName: 'input', inputType: 'text',
 *       autocomplete: true, placeholder: 'Pick a member', selectList: memberList
 *     },
 *     validations: [Validators.required]
 *   }]
 * };
 * this.searchSelectModalService.open(config).subscribe(event => {
 *   // event.value.userId
 * });
 *
 * // With API call — modal auto-closes on success
 * const config: SearchSelectModalConfig = {
 *   ...base,
 *   apiCall: (v) => this.myService.assign(v.userId)
 * };
 * this.searchSelectModalService.open(config).subscribe(event => {
 *   // event.value = { formValue, result }
 * });
 * ```
 */
export interface SearchSelectModalConfig {
    /** Dialog / form title */
    title?: string;
    /** Button labels */
    buttonText?: { search?: string; close?: string };
    /** Hide the Close/Cancel button */
    hideCloseButton?: boolean;
    /** Form field definitions */
    searchFormFields: SearchSelectField[];
    /**
     * Optional API call executed by `SearchSelectModalService` after form submission.
     * - Success → modal closes, Observable emits `{ formValue, result }`.
     * - Error   → modal stays open so the user can retry.
     */
    apiCall?: (formValue: any) => Observable<any>;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Dialog content component.
 * Do NOT open this directly — use `SearchSelectModalService.open()` instead.
 *
 * Responsibilities:
 * - Converts `SearchSelectModalConfig` → `SearchAndAdvancedSearchModel`
 * - Delegates all rendering to `<app-search-and-advanced-search-form>`
 * - Re-emits `onSearch` events upward to the service
 * - Exposes `setSubmitting()` so the service can disable the button during an API call
 */
@Component({
    selector: 'app-search-select-modal',
    templateUrl: './search-select-modal.component.html',
    styleUrls: ['./search-select-modal.component.scss'],
})
export class SearchSelectModalComponent {

    /** Proxied up to SearchSelectModalService which decides what to do next. */
    @Output() onSearch = new EventEmitter<SearchEvent>();

    protected searchModel: SearchAndAdvancedSearchModel;

    constructor(@Inject(MAT_DIALOG_DATA) config: SearchSelectModalConfig) {
        this.searchModel = this.toSearchModel(config);
    }

    // ─── Called by the service (not the template) ──────────────────────────────

    /**
     * Disables / re-enables the Search button while an API call is in-flight.
     * Called by `SearchSelectModalService`.
     */
    setSubmitting(inFlight: boolean): void {
        this.searchModel = { ...this.searchModel, disableAdvancedSearchBtn: inFlight };
    }

    // ─── Template binding ──────────────────────────────────────────────────────

    /** Forwards every event from the inner form straight to the service. */
    protected handleSearch(event: SearchEvent): void {
        this.onSearch.emit(event);
    }

    // ─── Private ──────────────────────────────────────────────────────────────

    private toSearchModel(cfg: SearchSelectModalConfig): SearchAndAdvancedSearchModel {
        return {
            normalSearchPlaceHolder: '',
            showOnlyAdvancedSearch: true,
            advancedSearch: {
                title: cfg.title,
                buttonText: {
                    search: cfg.buttonText?.search ?? 'Select',
                    close: cfg.buttonText?.close ?? 'Close',
                },
                hideCloseButton: cfg.hideCloseButton,
                searchFormFields: cfg.searchFormFields.map(f => ({
                    formControlName: f.formControlName,
                    inputModel: f.inputModel,
                    validations: f.validations,
                    hidden: f.hidden,
                })),
            },
        };
    }
}
