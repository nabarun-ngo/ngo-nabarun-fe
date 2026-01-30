import { ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { UniversalInputModel } from './universal-input.model';

/* ---------- Column ---------- */
export interface EditableTableColumn {
    columnDef: string;
    hideField?: boolean;
    header: string;
    editable?: boolean;
    inputModel?: UniversalInputModel;

    /** Angular field-level validators */
    validators?: ValidatorFn[];
    asyncValidators?: AsyncValidatorFn[];

    /** show display value */
    show_display_value?: boolean;
    ref_data_section?: string;

    /** Hide this column when the table is in edit mode (show_form = true) */
    hideInEditMode?: boolean;
}

/* ---------- Row-level validation rule ---------- */
export interface EditableTableRowRule {
    errorKey: string;
    message: string;

    /** return TRUE when row is INVALID */
    validate: (rowValue: any) => boolean;

    /** optional condition */
    when?: (rowValue: any) => boolean;
}

/* ---------- Table config ---------- */
export interface EditableTableConfig {
    columns: EditableTableColumn[];
    formArrayName: string;

    allowAddRow?: boolean;
    allowDeleteRow?: boolean;
    allowDeleteAll?: boolean;

    /** Generic row validation */
    rowValidationRules?: EditableTableRowRule[];

    /** Max height for the table body (e.g. '400px'). If set, the table will scroll internally. */
    maxHeight?: string;
}
