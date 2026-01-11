import { AbstractControl, ValidationErrors, ValidatorFn } from "@angular/forms";

/**
 * Validator to check if end time is after start time
 */
export const timeRangeValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const startTime = control.get('startTime')?.value;
    const endTime = control.get('endTime')?.value;
    const endTimeControl = control.get('endTime');

    if (startTime && endTime && endTime <= startTime) {
        const error = { timeRange: true };
        if (endTimeControl && (!endTimeControl.errors || endTimeControl.hasError('timeRange'))) {
            endTimeControl.setErrors(error);
        }
        return error;
    } else {
        if (endTimeControl && endTimeControl.hasError('timeRange')) {
            const errors = { ...endTimeControl.errors };
            delete errors['timeRange'];
            endTimeControl.setErrors(Object.keys(errors).length > 0 ? errors : null);
        }
    }
    return null;
};

