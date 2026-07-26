import { Component } from '@angular/core';
import { CfFormComponent } from '@nabarun-ngo/forms-angular';
import { DEMO_FORM_DEFINITION } from '@nabarun-ngo/forms-core';

@Component({
  selector: 'app-form-demo',
  standalone: true,
  imports: [CfFormComponent],
  template: `
    <main style="max-width: 32rem; margin: 2rem auto; font-family: system-ui, sans-serif;">
      <cf-form
        [definition]="definition"
        submitLabel="Save draft"
        (submitted)="onSubmit($event)"
      />
      @if (lastSubmission) {
        <pre style="margin-top: 1.5rem; background: #f4f4f4; padding: 1rem;">{{ lastSubmission }}</pre>
      }
    </main>
  `,
})
export class FormDemoComponent {
  readonly definition = DEMO_FORM_DEFINITION;
  lastSubmission = '';

  onSubmit(values: Record<string, unknown>): void {
    this.lastSubmission = JSON.stringify(values, null, 2);
  }
}
