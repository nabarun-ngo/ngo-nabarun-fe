import { Component, Input } from '@angular/core';
import { getErrorMessage, injectNgControl } from 'src/app/core/service/form.service';
import { KeyValue } from 'src/app/shared/model/key-value.model';
import { inputType, UniversalInputModel } from 'src/app/shared/model/universal-input.model';


@Component({
  selector: 'app-universal-input,[app-universal-input]',
  templateUrl: './universal-input.component.html',
  styleUrls: ['./universal-input.component.scss']
})
export class UniversalInputComponent {

  protected errorMessage = getErrorMessage
  protected ngControl = injectNgControl();

  autocompleteList!: KeyValue[];
  inputModel!: UniversalInputModel;

  @Input({ required: true, alias: 'inputModel' })
  set model(_model: UniversalInputModel) {
    //////console.log(_model)
    this.inputModel = _model;
    if (_model.autocomplete) {
      // ////console.log(_model.selectList)
      // this.autocompleteList = _model.selectList!;
      //////console.log(this.autocompleteList)
    }
  }

  specialInputTypes: inputType[] = ['date', 'editor', 'html', 'radio', 'time', 'phone', 'check']



  displayFn(id: string): string {
    if (this.inputModel && this.inputModel.selectList) {
      return this.inputModel.selectList.find(f => f.key == id)?.displayValue!;
    }
    return '';
  }

  onDialCodeSelect(code: string) {
    const number = this.ngControl.control?.value || '';

    if (this.inputModel.props?.['separateDialCode'] === false) {
      // prefix phone number with code inside the input
      if (!number.startsWith(code)) {
        this.ngControl.control?.setValue(`${code} ${number.replace(/^\+\d+\s*/, '')}`);
      }
    }
  }

  selectAll(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (!this.inputModel.selectList || this.inputModel.selectList.length === 0) {
      return;
    }

    const isAllSelected = this.isAllSelected();
    const allKeys = this.inputModel.selectList.map(opt => opt.key);

    if (isAllSelected) {
      // Deselect all
      this.ngControl.control?.setValue([]);
    } else {
      // Select all
      this.ngControl.control?.setValue(allKeys);
    }

    // Remove 'all' from the value if it somehow got added
    setTimeout(() => {
      const value = this.ngControl.control?.value;
      if (Array.isArray(value) && value.includes('all')) {
        const filtered = value.filter(v => v !== 'all');
        this.ngControl.control?.setValue(filtered);
      }
    }, 0);
  }

  isAllSelected(): boolean {
    if (!this.inputModel?.selectList || this.inputModel.selectList.length === 0) {
      return false;
    }

    const currentValue = this.ngControl?.control?.value;
    if (!Array.isArray(currentValue)) {
      return false;
    }

    const selectedKeysCount = currentValue.filter(v => v !== 'all').length;
    return selectedKeysCount === this.inputModel.selectList.length;
  }

  /**
   * Get the boolean value for the checkbox based on the form control value
   * If custom checkbox values are defined, convert them to boolean
   */
  getCheckboxValue(): boolean {
    const value = this.ngControl?.control?.value;
    if (!this.inputModel?.checkboxValues) {
      // Default behavior: treat value as boolean
      return !!value;
    }
    // Custom values: check if value matches the 'checked' value
    // Also handle truthy/falsy values that might not exactly match
    if (value === this.inputModel.checkboxValues.checked) {
      return true;
    }
    if (value === this.inputModel.checkboxValues.unchecked) {
      return false;
    }
    // If value doesn't match either custom value, treat as truthy/falsy
    // This handles cases where the value might be boolean, null, undefined, etc.
    return !!value;
  }
  /**
   * Handle checkbox change event and convert boolean to custom value if needed
   */
  onCheckboxChange(checked: boolean): void {
    if (!this.inputModel?.checkboxValues) {
      // Default behavior: set boolean value
      this.ngControl?.control?.setValue(checked);
      return;
    }
    // Custom values: convert boolean to custom value
    const newValue = checked
      ? this.inputModel.checkboxValues.checked
      : this.inputModel.checkboxValues.unchecked;
    this.ngControl?.control?.setValue(newValue);
  }


}
