import {
  Component, Input, forwardRef, HostBinding
} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR
} from '@angular/forms';
import { COUNTRY_CODES } from './phone-number-data';

@Component({
  selector: 'app-phone-number',
  templateUrl: './app-phone-number.component.html',
  styleUrls: ['./app-phone-number.component.scss'],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => AppPhoneNumberComponent),
    multi: true
  }]
})
export class AppPhoneNumberComponent implements ControlValueAccessor {

  @Input() appearance: 'fill' | 'outline'  = 'outline';
  @Input() placeholder = 'Phone number';

  countries = COUNTRY_CODES;
  selectedCountry = this.countries[0];
  phone = '';
  disabled = false;

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: string): void {
    if (!value) return;
    const found = this.countries.find(c => value.startsWith(c.dialCode));
    if (found) {
      this.selectedCountry = found;
      this.phone = value.replace(found.dialCode, '');
    }
  }

  registerOnChange(fn: any): void { this.onChange = fn; }
  registerOnTouched(fn: any): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }

  updateValue() {
    const full = `${this.selectedCountry.dialCode}${this.phone}`;
    this.onChange(full);
  }
}
