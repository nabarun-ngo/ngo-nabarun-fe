import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { EditableTableRowRule } from '../model/editable-table.model';

export function buildRowValidator(
    rules: EditableTableRowRule[] = []
): ValidatorFn {

    return (control: AbstractControl): ValidationErrors | null => {
        if (!rules.length) return null;

        const value = control.value;
        const errors: ValidationErrors = {};

        rules.forEach(rule => {
            const applicable = rule.when ? rule.when(value) : true;

            if (applicable && rule.validate(value)) {
                errors[rule.errorKey] = rule.message;
            }
        });

        return Object.keys(errors).length ? errors : null;
    };
}
