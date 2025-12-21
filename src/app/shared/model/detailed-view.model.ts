import { FormGroup, ValidatorFn } from "@angular/forms";
import { UniversalInputModel, inputType } from "./universal-input.model";
import { AccordionList } from "./accordion-list.model";
import { Accordion } from "../utils/accordion";
import { EventEmitter } from "@angular/core";
import { FileUpload } from "../components/generic/file-upload/file-upload.component";
import { BehaviorSubject } from "rxjs";
import { AlertData } from "./alert.model";
import { Doc } from "./document.model";
import { EditableTableConfig } from "./editable-table.model";


/* ──────────────────────────────────────────────────────────────
 * Alerts
 * ────────────────────────────────────────────────────────────── */

/**
 * Read-only alert descriptor.
 * UI visibility is controlled externally.
 */
export interface AlertList {
    readonly data: AlertData;
    readonly hide_alert?: boolean;
}

/* ──────────────────────────────────────────────────────────────
 * Detailed View (Accordion Section)
 * ────────────────────────────────────────────────────────────── */

/**
 * Represents a single accordion section.
 * May optionally contain a nested accordion.
 */
export interface DetailedView<NumType = any> {

    /* ───────────── Identity & Type ───────────── */

    readonly section_html_id?: string;
    readonly section_name: string;

    /**
     * Section rendering strategy.
     * - accordion_list → nested Accordion
     */
    readonly section_type:
    | 'key_value'
    | 'doc_list'
    | 'custom'
    | 'accordion_list'
    | 'editable_table';

    /* ───────────── Visibility & Mode ───────────── */

    /** Runtime UI flag (mutable by Accordion base class) */
    hide_section?: boolean;

    /** Runtime UI flag (edit/create mode) */
    show_form?: boolean;

    /* ───────────── Content & Forms ───────────── */

    /**
     * Section fields.
     * Read-only structure, but fields themselves may be mutated.
     */
    readonly content?: DetailedViewField[];

    /**
     * Section-level form group.
     * Always present once section is rendered.
     */
    readonly section_form: FormGroup;

    /* ───────────── Documents ───────────── */

    readonly documentHeader?: string;
    readonly documents?: Doc[];

    /**
     * Document upload state.
     * docList is initialized lazily at runtime.
     */
    doc?: {
        readonly docChange: EventEmitter<FileUpload[]>;
        docList?: BehaviorSubject<FileUpload[]>;
    };

    /* ───────────── Nested Accordion ───────────── */

    /**
     * Optional nested accordion.
     * Exists only when section_type === 'accordion_list'.
     */
    accordion?: {

        /** Optional parent identifier (informational) */
        readonly parentId?: string;

        /** Whether create button is shown */
        readonly createBtn?: boolean;

        /**
         * Nested accordion instance.
         * IMPORTANT:
         * - Owns its own lifecycle
         * - Must NOT mutate parent state directly
         */
        readonly object: Accordion<NumType>;

        /** Event when nested accordion row opens */
        readonly accordionOpened: EventEmitter<{ rowIndex: number }>;

        /** Event when nested accordion button is clicked */
        readonly buttonClick: EventEmitter<{
            buttonId: string;
            rowIndex: number;
        }>;
    };

    /**
     * Optional embedded accordion list (legacy support).
     * Prefer `accordion.object` for nested usage.
     */
    accordionList?: AccordionList;

    /* ───────────── Alerts ───────────── */

    readonly section_alerts?: readonly AlertList[];
    readonly form_alerts?: readonly AlertList[];


    /* ───────────── Table ───────────── */
    /**
     * Optional editable table.
     * Exists only when section_type === 'editable_table'.
     */
    editableTable?: EditableTableConfig;

}

/* ──────────────────────────────────────────────────────────────
 * Section Field
 * ────────────────────────────────────────────────────────────── */

/**
 * Single field within a DetailedView section.
 */
export interface DetailedViewField {

    readonly field_html_id?: string;
    readonly field_name?: string;

    /** Raw value */
    field_value: string;

    /** Display value (formatted) */
    field_display_value?: string;

    field_value_splitter?: string;

    /** Runtime UI flags */
    hide_field?: boolean;
    editable?: boolean;

    /* ───────────── Form Binding ───────────── */

    form_control_name?: string;
    form_input?: UniversalInputModel;
    form_input_validation?: ValidatorFn[];

    /* ───────────── Display Helpers ───────────── */

    show_display_value?: boolean;
    ref_data_section?: string;
}
