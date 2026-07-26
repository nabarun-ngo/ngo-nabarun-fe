import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnChanges,
  Optional,
  Output,
  SimpleChanges,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import type { FormDefinition, FormEngineOptions, FormValues } from '@nabarun-ngo/forms-core';
import { CfFieldComponent } from './cf-field.component';
import { FormEngineService } from './form-engine.service';
import { CF_FORM_CLASS_NAMES, type CfFormClassNames } from './tokens';

@Component({
  selector: 'cf-form',
  standalone: true,
  imports: [CfFieldComponent, MatButtonModule],
  styleUrl: './cf-form.component.scss',
  providers: [FormEngineService],
  template: `
    <form
      class="cf-form mat-typography"
      [class]="classNames?.root"
      (submit)="onSubmit($event)"
      novalidate
      [attr.data-cf-form]="definition.key"
    >
      @if (!hideHeading && definition.label) {
        <h2 class="mat-headline-6 cf-form-title">{{ definition.label }}</h2>
      }
      @if (!hideHeading && definition.description) {
        <p class="cf-form-description">{{ definition.description }}</p>
      }

      @for (step of steps; track step.stepId) {
        <div [attr.data-cf-step]="step.stepId || null">
          @if (step.stepName) {
            <h3 class="mat-title-medium cf-form-step-title">{{ step.stepName }}</h3>
          }
          @for (field of step.fields; track field.definition.id) {
            <cf-field
              [field]="field"
              [fieldId]="idPrefix + '-' + field.definition.key"
              [value]="values[field.definition.key] ?? null"
              [error]="fieldErrors[field.definition.key]"
              [classNames]="classNames"
              [engineOptions]="engineOptions"
              (valueChange)="setValue(field.definition.key, $event)"
            />
          }
        </div>
      }

      @if (showSubmit) {
        <button
          mat-flat-button
          color="primary"
          type="submit"
          class="cf-form-submit"
          [class]="classNames?.submit"
          [disabled]="submitting"
        >
          {{ submitting ? 'Submitting…' : submitLabel }}
        </button>
      }
    </form>
  `,
})
export class CfFormComponent implements OnChanges {
  @Input({ required: true }) definition!: FormDefinition;
  @Input() initialValues?: FormValues;
  @Input() engineOptions?: FormEngineOptions;
  @Input() idPrefix = 'cf';
  @Input() hideHeading = false;
  @Input() submitLabel = 'Submit';
  @Input() showSubmit = true;

  @Output() submitted = new EventEmitter<FormValues>();

  submitting = false;
  values: FormValues = {};
  fieldErrors: Record<string, string> = {};
  steps: ReturnType<FormEngineService['getSteps']> = [];

  constructor(
    private readonly engine: FormEngineService,
    @Optional() @Inject(CF_FORM_CLASS_NAMES) public classNames: CfFormClassNames | null,
  ) {
    this.classNames = this.classNames ?? {};
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.definition && (changes['definition'] || changes['initialValues'] || changes['engineOptions'])) {
      this.engine.init(this.definition, this.initialValues, this.engineOptions);
      this.refresh();
    }
  }

  setValue(key: string, value: FormValues[string]): void {
    this.engine.setValue(key, value);
    this.refresh();
  }

  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();
    const result = this.engine.validate();
    this.fieldErrors = result.fieldErrors;
    if (!result.valid) return;

    this.submitting = true;
    try {
      this.submitted.emit(this.engine.getSubmitValues());
      this.engine.reset();
      this.refresh();
    } finally {
      this.submitting = false;
    }
  }

  private refresh(): void {
    this.values = this.engine.getValues();
    this.steps = this.engine.getSteps();
    this.fieldErrors = this.engine.getFieldErrors();
  }
}
