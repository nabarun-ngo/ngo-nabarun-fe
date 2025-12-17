import { ElementRef, inject } from "@angular/core";
import { AbstractControl, ControlValueAccessor, FormControlDirective, FormControlName, FormGroup, NgControl, NgModel, ValidationErrors, ValidatorFn } from "@angular/forms";
import { debounceTime, fromEvent, Observable, OperatorFunction, pairwise, startWith, take } from "rxjs";
import { compareObjects, isEmpty } from "./utilities.service";

class NoopValueAccessor implements ControlValueAccessor {
  writeValue() { }
  registerOnChange() { }
  registerOnTouched() { }
}

export function injectNgControl() {
  const ngControl = inject(NgControl, { self: true, optional: true });

  if (!ngControl) throw new Error('No control found');

  if (
    ngControl instanceof FormControlDirective ||
    ngControl instanceof FormControlName ||
    ngControl instanceof NgModel
  ) {
    ngControl.valueAccessor = new NoopValueAccessor();
    ////console.log(ngControl)
    return ngControl;
  }

  throw new Error(`No control found`);
}


export function setValidator(control: AbstractControl, validators: ValidatorFn | ValidatorFn[] | null) {
  if (validators && validators.length != 0) {
    control.setValidators(validators);
  } else {
    control.clearValidators();
  }
  control.updateValueAndValidity();
}
/**
   * Here we are filtering only the eent when the previous value has been changed to a new value,
   * value changes returns changes that has happened earlier as well which we dont want, 
   * In that case we will end up with multiple duplicate calls
   */
export function filterFormChange(form_value: any) {
  return function <T>(source: Observable<T>): Observable<T> {
    return new Observable(subscriber => {
      source.pipe(startWith(form_value), pairwise()).subscribe({
        next(value) {
          if (value !== undefined && value !== null && value.length > 1 && value[1] !== value[0]) {
            let object = compareObjects(value[1], value[0]);
            if (!isEmpty(object)) {
              subscriber.next(object);
            }
          }
        },
        error(error) {
          subscriber.error(error);
        },
        complete() {
          subscriber.complete();
        }
      })
    });
  }
}


export function getErrorMessage(arg0: ValidationErrors | null, fieldName?: string) {
  if (!arg0) {
    return;
  }
  ////console.log(arg0)
  if (arg0 && arg0['required']) {
    return (fieldName ? fieldName : 'This field') + ' is required.';
  }
  else if (arg0 && arg0['nullValidator']) {
    return (fieldName ? fieldName : 'This field') + ' must not be null.';
  }
  else if (arg0 && arg0['requiredTrue']) {
    return (fieldName ? fieldName : 'This field') + ' should be true.';
  }
  else if (arg0 && arg0['email']) {
    return (fieldName ? fieldName : 'This field') + ' contains invalid email.';
  }
  else if (arg0 && arg0['min']) {
    return (fieldName ? fieldName : 'This field') + ' should be minimum ' + arg0['min'].min + '.';
  }
  else if (arg0 && arg0['max']) {
    return (fieldName ? fieldName : 'This field') + ' should be maximum ' + arg0['max'].max + '.';
  }
  else if (arg0 && arg0['maxLength']) {
    return (fieldName ? fieldName : 'This field') + ' should be minimum ' + arg0['maxLength'].max + '.';
  }
  else if (arg0 && arg0['validatePhoneNumber']) {
    return (fieldName ? fieldName : 'This field') + ' contains invalid phone number.';
  }
  else if (arg0 && arg0['confirmedValidator']) {
    return (fieldName ? fieldName : 'This field') + ' should match with Password.';
  }


  // Validators.max
  // Validators.maxLength
  // Validators.min
  // Validators.minLength
  // Validators.nullValidator
  // Validators.requiredTrue
  return;
}

export interface BooleanFn {
  (): boolean;
}
export function conditionalValidator(predicate: BooleanFn,
  validator: ValidatorFn,
  errorNamespace?: string): ValidatorFn {
  return (formControl => {
    if (!formControl.parent) {
      return null;
    }
    let error = null;
    if (predicate()) {
      error = validator(formControl);
      //Changeing this 28/09/2021
      ////console.log('formControl',validator,predicate())
    }
    if (errorNamespace && error) {
      const customError: any = {};
      customError[errorNamespace] = error;
      error = customError
    }
    return error;
  })
}


export function scrollToFirstInvalidControl(el: HTMLElement) {
  const firstInvalidControl: HTMLElement = el.querySelector(
    ".ng-invalid"
  )!;

  window.scroll({
    top: getTopOffset(firstInvalidControl),
    left: 0,
    behavior: "smooth"
  });

  fromEvent(window, "scroll")
    .pipe(
      debounceTime(100),
      take(1)
    )
    .subscribe(() => firstInvalidControl.focus());
}

function getTopOffset(controlEl: HTMLElement): number {
  const labelOffset = 50;
  return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
}


export function matchFieldsValidator(controlName: string, matchingControlName: string): ValidatorFn {
  return (abstractControl: AbstractControl) => {
    const control = abstractControl.get(controlName);
    const matchingControl = abstractControl.get(matchingControlName);

    if (matchingControl!.errors && !matchingControl!.errors?.['confirmedValidator']) {
      return null;
    }

    if (control!.value !== matchingControl!.value) {
      const error = { confirmedValidator: 'Passwords do not match.' };
      matchingControl!.setErrors(error);
      return error;
    } else {
      matchingControl!.setErrors(null);
      return null;
    }
  }

}