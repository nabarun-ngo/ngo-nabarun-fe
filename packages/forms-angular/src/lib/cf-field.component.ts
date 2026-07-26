import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import type { CustomFieldValueParsed, FormEngineOptions } from '@nabarun-ngo/forms-core';
import type { ResolvedField } from '@nabarun-ngo/forms-core';
import {
  formatPhoneFieldValue,
  parsePhoneFieldValue,
  resolvePhoneCountryCodeOptions,
} from '@nabarun-ngo/forms-core';

@Component({
  selector: 'cf-field',
  standalone: true,
  imports: [FormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatCheckboxModule],
  styleUrl: './cf-field.component.scss',
  template: `
    @if (visible) {
      @switch (field.definition.fieldType) {
        @case ('boolean') {
          <div
            class="cf-boolean-field"
            [class]="classNames?.field"
            [attr.data-cf-field]="field.definition.key"
            [attr.data-cf-type]="field.definition.fieldType"
          >
            <mat-checkbox
              [id]="fieldId"
              [ngModel]="boolValue"
              (ngModelChange)="valueChange.emit($event)"
            >
              {{ field.definition.label }}
              @if (field.effectiveMandatory) {
                <span class="cf-required-mark" aria-hidden="true"> *</span>
              }
            </mat-checkbox>
            @if (error) {
              <div class="mat-mdc-form-field-error" role="alert">{{ error }}</div>
            }
          </div>
        }
        @case ('phone') {
          <mat-form-field
            appearance="outline"
            class="cf-field cf-phone-field"
            [class]="classNames?.field"
            [attr.data-cf-field]="field.definition.key"
            [attr.data-cf-type]="field.definition.fieldType"
            subscriptSizing="dynamic"
          >
            <mat-label>{{ field.definition.label }}</mat-label>
            @if (phoneCountryOptions.length > 1) {
              <mat-select
                matPrefix
                class="cf-phone-country-select"
                [ngModel]="phoneParsed.countryCode"
                (ngModelChange)="onPhoneCountryCodeChange($event)"
                aria-label="Country code"
              >
                @for (opt of phoneCountryOptions; track opt.code) {
                  <mat-option [value]="opt.code">{{ opt.label ?? opt.code }}</mat-option>
                }
              </mat-select>
            } @else {
              <span matTextPrefix class="cf-phone-prefix">{{ phoneParsed.countryCode }}</span>
            }
            <input
              matInput
              type="tel"
              inputmode="tel"
              autocomplete="tel-national"
              [id]="fieldId"
              [name]="field.definition.key"
              [ngModel]="phoneParsed.nationalNumber"
              (ngModelChange)="onPhoneNationalNgModel($event)"
              placeholder="Phone number"
            />
            @if (error) {
              <mat-error>{{ error }}</mat-error>
            }
          </mat-form-field>
        }
        @case ('textarea') {
          <mat-form-field
            appearance="outline"
            class="cf-field"
            [class]="classNames?.field"
            [attr.data-cf-field]="field.definition.key"
            [attr.data-cf-type]="field.definition.fieldType"
            subscriptSizing="dynamic"
          >
            <mat-label>{{ field.definition.label }}</mat-label>
            <textarea
              matInput
              [id]="fieldId"
              [name]="field.definition.key"
              rows="4"
              [ngModel]="textValue"
              (ngModelChange)="onTextNgModelChange($event)"
            ></textarea>
            @if (error) {
              <mat-error>{{ error }}</mat-error>
            }
          </mat-form-field>
        }
        @case ('select') {
          <mat-form-field
            appearance="outline"
            class="cf-field"
            [class]="classNames?.field"
            [attr.data-cf-field]="field.definition.key"
            [attr.data-cf-type]="field.definition.fieldType"
            subscriptSizing="dynamic"
          >
            <mat-label>{{ field.definition.label }}</mat-label>
            <mat-select
              [id]="fieldId"
              [name]="field.definition.key"
              [ngModel]="textValue"
              (ngModelChange)="valueChange.emit($event)"
            >
              <mat-option value="">Select…</mat-option>
              @for (opt of field.availableOptions; track opt.key) {
                <mat-option [value]="opt.key">{{ opt.label }}</mat-option>
              }
            </mat-select>
            @if (error) {
              <mat-error>{{ error }}</mat-error>
            }
          </mat-form-field>
        }
        @case ('multiselect') {
          <mat-form-field
            appearance="outline"
            class="cf-field"
            [class]="classNames?.field"
            [attr.data-cf-field]="field.definition.key"
            [attr.data-cf-type]="field.definition.fieldType"
            subscriptSizing="dynamic"
          >
            <mat-label>{{ field.definition.label }}</mat-label>
            <mat-select
              multiple
              [id]="fieldId"
              [name]="field.definition.key"
              [ngModel]="multiValue"
              (ngModelChange)="valueChange.emit($event)"
            >
              @for (opt of field.availableOptions; track opt.key) {
                <mat-option [value]="opt.key">{{ opt.label }}</mat-option>
              }
            </mat-select>
            @if (error) {
              <mat-error>{{ error }}</mat-error>
            }
          </mat-form-field>
        }
        @default {
          <mat-form-field
            appearance="outline"
            class="cf-field"
            [class]="classNames?.field"
            [attr.data-cf-field]="field.definition.key"
            [attr.data-cf-type]="field.definition.fieldType"
            subscriptSizing="dynamic"
          >
            <mat-label>{{ field.definition.label }}</mat-label>
            <input
              matInput
              [id]="fieldId"
              [name]="field.definition.key"
              [type]="inputType"
              [ngModel]="textValue"
              (ngModelChange)="onTextNgModelChange($event)"
            />
            @if (error) {
              <mat-error>{{ error }}</mat-error>
            }
          </mat-form-field>
        }
      }
    }
  `,
})
export class CfFieldComponent {
  @Input({ required: true }) field!: ResolvedField;
  @Input() fieldId = '';
  @Input() value: CustomFieldValueParsed = null;
  @Input() error?: string;
  @Input() classNames?: {
    field?: string;
    label?: string;
    control?: string;
    error?: string;
    requiredMark?: string;
    phoneGroup?: string;
    phoneCountry?: string;
    phoneNational?: string;
  };
  @Input() engineOptions?: FormEngineOptions;

  @Output() valueChange = new EventEmitter<CustomFieldValueParsed>();

  get phoneCountryOptions() {
    return resolvePhoneCountryCodeOptions(this.engineOptions);
  }

  get phoneParsed() {
    return parsePhoneFieldValue(this.value, this.engineOptions);
  }

  get visible(): boolean {
    return this.field.visible;
  }

  get textValue(): string {
    if (this.value === null || this.value === undefined) return '';
    if (typeof this.value === 'boolean') return '';
    if (typeof this.value === 'number') return String(this.value);
    if (Array.isArray(this.value)) return this.value.join(',');
    return this.value;
  }

  get multiValue(): string[] {
    return Array.isArray(this.value) ? this.value : [];
  }

  get boolValue(): boolean {
    return Boolean(this.value);
  }

  get inputType(): string {
    switch (this.field.definition.fieldType) {
      case 'email':
        return 'email';
      case 'phone':
        return 'tel';
      case 'number':
        return 'number';
      case 'date':
        return 'date';
      default:
        return 'text';
    }
  }

  onTextNgModelChange(value: string): void {
    if (this.field.definition.fieldType === 'number') {
      this.valueChange.emit(value === '' ? '' : Number(value));
      return;
    }
    this.valueChange.emit(value);
  }

  onPhoneCountryCodeChange(code: string): void {
    this.valueChange.emit(
      formatPhoneFieldValue(code, this.phoneParsed.nationalNumber),
    );
  }

  onPhoneNationalNgModel(national: string): void {
    this.valueChange.emit(
      formatPhoneFieldValue(this.phoneParsed.countryCode, national),
    );
  }
}
