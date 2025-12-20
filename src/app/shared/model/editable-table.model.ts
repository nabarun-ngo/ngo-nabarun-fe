import { ValidatorFn, AsyncValidatorFn } from '@angular/forms';
import { UniversalInputModel } from './universal-input.model';

/* ---------- Column ---------- */
export interface EditableTableColumn {
    columnDef: string;
    header: string;
    editable?: boolean;
    inputModel?: UniversalInputModel;

    /** Angular field-level validators */
    validators?: ValidatorFn[];
    asyncValidators?: AsyncValidatorFn[];
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

    /** Generic row validation */
    rowValidationRules?: EditableTableRowRule[];
}
